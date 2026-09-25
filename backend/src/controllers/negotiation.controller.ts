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

function getProposalPrice(version: { totalPrice?: unknown } | null): number | null {
  if (!version || version.totalPrice === null || version.totalPrice === undefined) {
    return null
  }

  const value = Number(version.totalPrice)
  return Number.isFinite(value) ? value : null
}

export async function getBuyerNegotiations(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const negotiations = await prisma.negotiation.findMany({
      where: {
        bid: {
          request: {
            buyerId: buyerProfile.id,
          },
        },
      },
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
    console.error('Get buyer negotiations error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch negotiations',
    })
  }
}

export async function getNegotiationById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
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

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const negotiation = await prisma.negotiation.findFirst({
      where: {
        id: result.data.id,
        bid: {
          request: {
            buyerId: buyerProfile.id,
          },
        },
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

export async function createNegotiationMessage(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
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

    const validation = sendMessageSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message payload',
        errors: validation.error.flatten(),
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const negotiation = await prisma.negotiation.findFirst({
      where: {
        id: result.data.id,
        bid: {
          request: {
            buyerId: buyerProfile.id,
          },
        },
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

    const message = await prisma.negotiationMessage.create({
      data: {
        negotiationId: negotiation.id,
        senderId: userId,
        authorType: 'BUYER',
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
          authorType: 'BUYER',
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
