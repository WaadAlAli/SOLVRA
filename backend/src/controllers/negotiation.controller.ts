import type { Response } from 'express'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

const negotiationIdParamSchema = z.object({
  id: z.string().uuid('Negotiation ID is invalid'),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

function getProposalPrice(
  version: { totalPrice?: unknown } | null,
): number | null {
  if (
    !version ||
    version.totalPrice === null ||
    version.totalPrice === undefined
  ) {
    return null
  }

  const value = Number(version.totalPrice)
  return Number.isFinite(value) ? value : null
}

function getAuthorType(role: string) {
  if (role === 'BUYER') return 'BUYER' as const
  if (role === 'SUPPLIER') return 'SUPPLIER' as const
  return null
}
const bidIdParamSchema = z.object({
  bidId: z.string().uuid('Bid ID is invalid'),
})

/**
 * POST /api/negotiations/bids/:bidId
 *
 * Starts a negotiation for a specific bid.
 *
 * Only the buyer who owns the request can start it.
 * If a negotiation already exists for the bid, return the existing one.
 */
export async function createNegotiation(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const role = req.user?.role

    const result = bidIdParamSchema.safeParse({
      bidId: Array.isArray(req.params.bidId)
        ? req.params.bidId[0]
        : req.params.bidId,
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is invalid',
        errors: result.error.flatten(),
      })
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (role !== 'BUYER') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can start a negotiation',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const bid = await prisma.bid.findFirst({
      where: {
        id: result.data.bidId,
        request: {
          buyerId: buyerProfile.id,
        },
      },
      select: {
        id: true,
        requestId: true,
        status: true,
      },
    })

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found or access denied',
      })
    }

    if (bid.status === 'WITHDRAWN' || bid.status === 'REJECTED') {
      return res.status(409).json({
        success: false,
        message: 'Negotiation cannot be started for this bid',
      })
    }

    const existingNegotiation = await prisma.negotiation.findFirst({
      where: {
        bidId: bid.id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (existingNegotiation) {
      return res.status(200).json({
        success: true,
        created: false,
        message: 'Negotiation already exists',
        negotiation: existingNegotiation,
      })
    }

    const negotiation = await prisma.negotiation.create({
      data: {
        bidId: bid.id,
        status: 'OPEN',
      },
      select: {
        id: true,
        bidId: true,
        status: true,
        createdAt: true,
      },
    })

    return res.status(201).json({
      success: true,
      created: true,
      message: 'Negotiation started successfully',
      negotiation,
    })
  } catch (error) {
    console.error('Create negotiation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to start negotiation',
    })
  }
}
/**
 * Builds the Prisma condition that determines whether
 * the authenticated user is allowed to access a negotiation.
 *
 * BUYER:
 *   Can access negotiations for bids belonging to their requests.
 *
 * SUPPLIER:
 *   Can access negotiations for their own bids.
 */
async function getNegotiationAccessWhere(
  userId: string,
  role: string,
) {
  if (role === 'BUYER') {
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!buyerProfile) {
      return null
    }

    return {
      bid: {
        request: {
          buyerId: buyerProfile.id,
        },
      },
    }
  }

  if (role === 'SUPPLIER') {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!supplierProfile) {
      return null
    }

    return {
      bid: {
        supplierId: supplierProfile.id,
      },
    }
  }

  return null
}

/**
 * GET /api/negotiations
 *
 * Returns negotiations available to the authenticated user.
 *
 * BUYER    -> negotiations for bids submitted to their requests.
 * SUPPLIER -> negotiations for their own bids.
 */
export async function getMyNegotiations(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'User role is required',
      })
    }

    const accessWhere = await getNegotiationAccessWhere(userId, role)

    if (!accessWhere) {
      return res.status(403).json({
        success: false,
        message: 'Profile not found or access denied',
      })
    }

    const negotiations = await prisma.negotiation.findMany({
      where: accessWhere,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bid: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                status: true,
                currency: true,
                budget: true,
              },
            },
            supplier: {
              select: {
                id: true,
                companyName: true,
              },
            },
            versions: {
              orderBy: {
                versionNumber: 'desc',
              },
              take: 1,
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })

    const payload = negotiations.map((negotiation) => {
      const latestVersion = negotiation.bid.versions[0] ?? null

      return {
        id: negotiation.id,
        status: negotiation.status,
        createdAt: negotiation.createdAt,

        request: {
          id: negotiation.bid.request.id,
          title: negotiation.bid.request.title,
          status: negotiation.bid.request.status,
          currency: negotiation.bid.request.currency,
          budget: negotiation.bid.request.budget
            ? Number(negotiation.bid.request.budget)
            : null,
        },

        supplier: {
          id: negotiation.bid.supplier.id,
          companyName: negotiation.bid.supplier.companyName,
        },

        proposal: {
          bidId: negotiation.bid.id,
          price: getProposalPrice(latestVersion),
          currency: negotiation.bid.request.currency,
          versionNumber: latestVersion?.versionNumber ?? null,
          updatedAt: latestVersion?.createdAt ?? null,
        },

        lastActivityAt:
          negotiation.messages[0]?.createdAt ?? negotiation.createdAt,

        messageCount: negotiation.messages.length,
      }
    })

    return res.status(200).json({
      success: true,
      negotiations: payload,
    })
  } catch (error) {
    console.error('Get negotiations error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch negotiations',
    })
  }
}

/**
 * GET /api/negotiations/:id
 *
 * Both the buyer and supplier involved in the bid
 * can access the same negotiation.
 */
export async function getNegotiationById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const role = req.user?.role

    const result = negotiationIdParamSchema.safeParse({
      id: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Negotiation ID is invalid',
        errors: result.error.flatten(),
      })
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'User role is required',
      })
    }

    const accessWhere = await getNegotiationAccessWhere(userId, role)

    if (!accessWhere) {
      return res.status(403).json({
        success: false,
        message: 'Profile not found or access denied',
      })
    }

    const negotiation = await prisma.negotiation.findFirst({
      where: {
        id: result.data.id,
        ...accessWhere,
      },
      include: {
        bid: {
          include: {
            request: {
              select: {
                id: true,
                title: true,
                status: true,
                currency: true,
                budget: true,
              },
            },
            supplier: {
              select: {
                id: true,
                companyName: true,
              },
            },
            versions: {
              orderBy: {
                versionNumber: 'desc',
              },
              take: 1,
            },
          },
        },

        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found',
      })
    }

    const latestVersion = negotiation.bid.versions[0] ?? null

    return res.status(200).json({
      success: true,

      negotiation: {
        id: negotiation.id,
        status: negotiation.status,
        createdAt: negotiation.createdAt,

        request: {
          id: negotiation.bid.request.id,
          title: negotiation.bid.request.title,
          status: negotiation.bid.request.status,
          currency: negotiation.bid.request.currency,
          budget: negotiation.bid.request.budget
            ? Number(negotiation.bid.request.budget)
            : null,
        },

        supplier: {
          id: negotiation.bid.supplier.id,
          companyName: negotiation.bid.supplier.companyName,
        },

        proposal: {
          bidId: negotiation.bid.id,
          price: getProposalPrice(latestVersion),
          currency: negotiation.bid.request.currency,
          versionNumber: latestVersion?.versionNumber ?? null,
          updatedAt: latestVersion?.createdAt ?? null,
        },

        messages: negotiation.messages.map((message) => ({
          id: message.id,
          content: message.content,
          authorType: message.authorType,
          createdAt: message.createdAt,

          sender: message.sender
            ? {
                id: message.sender.id,
                email: message.sender.email,
              }
            : null,
        })),
      },
    })
  } catch (error) {
    console.error('Get negotiation by id error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch negotiation details',
    })
  }
}

/**
 * POST /api/negotiations/:id/messages
 *
 * Both the buyer and supplier can send messages.
 *
 * The authorType is determined by the authenticated user's
 * actual role. The frontend cannot choose it.
 */
export async function createNegotiationMessage(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const role = req.user?.role

    const result = negotiationIdParamSchema.safeParse({
      id: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Negotiation ID is invalid',
        errors: result.error.flatten(),
      })
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'User role is required',
      })
    }

    const authorType = getAuthorType(role)

    if (!authorType) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and suppliers can send negotiation messages',
      })
    }

    const validation = sendMessageSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message payload',
        errors: validation.error.flatten(),
      })
    }

    const accessWhere = await getNegotiationAccessWhere(userId, role)

    if (!accessWhere) {
      return res.status(403).json({
        success: false,
        message: 'Profile not found or access denied',
      })
    }

    const negotiation = await prisma.negotiation.findFirst({
      where: {
        id: result.data.id,
        ...accessWhere,
      },
      include: {
        bid: {
          select: {
            id: true,
            requestId: true,
          },
        },
      },
    })

    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found',
      })
    }

    if (negotiation.status !== 'OPEN') {
      return res.status(409).json({
        success: false,
        message: 'This negotiation is no longer open',
      })
    }

    const message = await prisma.negotiationMessage.create({
      data: {
        negotiationId: negotiation.id,
        senderId: userId,
        authorType,
        content: validation.data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        requestId: negotiation.bid.requestId,
        bidId: negotiation.bid.id,
        action: 'NEGOTIATION_MESSAGE_SENT',
        metadata: {
          negotiationId: negotiation.id,
          authorType,
          messageLength: validation.data.content.length,
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',

      entry: {
        id: message.id,
        content: message.content,
        authorType: message.authorType,
        createdAt: message.createdAt,

        sender: message.sender
          ? {
              id: message.sender.id,
              email: message.sender.email,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Create negotiation message error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to send negotiation message',
    })
  }
}
