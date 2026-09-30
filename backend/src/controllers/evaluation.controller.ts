import type { Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'
import {
  calculateCriterionScore,
  calculateTco,
} from '../services/evaluation-calculation.js'

type CriterionScoreMap = Record<string, number>

type EvaluationCalculation = {
  bidVersionId: string
  requestId: string
  tcoAmount: number
  criterionScores: CriterionScoreMap
  weightedTotalScore: number
  isCompliant: boolean
}

function getRequestId(req: AuthenticatedRequest): string | null {
  const value = req.params.requestId

  if (typeof value !== 'string') {
    return null
  }

  return value
}

export async function setEvaluationCriteria(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const requestId = getRequestId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      })
    }

    const { criteria } = req.body

    if (!Array.isArray(criteria)) {
      return res.status(400).json({
        success: false,
        message: 'criteria must be an array',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: requestId,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      })
    }

    const validCriteria = [
      'PRICE',
      'TECHNICAL_COMPLIANCE',
      'WARRANTY',
      'DELIVERY',
      'MAINTENANCE',
      'PAYMENT_TERMS',
      'CUSTOM',
    ]

    const parsedCriteria = criteria.map((criterion: unknown) => {
      const item = criterion as {
        name?: unknown
        weightPercent?: unknown
      }

      return {
        name: String(item.name ?? ''),
        weightPercent: Number(item.weightPercent),
      }
    })

    const hasInvalidCriterion = parsedCriteria.some(
      (criterion) =>
        !validCriteria.includes(criterion.name) ||
        !Number.isFinite(criterion.weightPercent) ||
        criterion.weightPercent < 0,
    )

    if (hasInvalidCriterion) {
      return res.status(400).json({
        success: false,
        message: 'Invalid evaluation criteria',
      })
    }

    const totalWeight = parsedCriteria.reduce(
      (sum, criterion) => sum + criterion.weightPercent,
      0,
    )

    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Evaluation weights must total exactly 100%',
        totalWeight,
      })
    }

    const uniqueNames = new Set(
      parsedCriteria.map((criterion) => criterion.name),
    )

    if (uniqueNames.size !== parsedCriteria.length) {
      return res.status(400).json({
        success: false,
        message: 'Each evaluation criterion can only appear once',
      })
    }

    await prisma.$transaction(async (tx) => {
      await tx.evaluationCriterion.deleteMany({
        where: {
          requestId,
        },
      })

      await tx.evaluationCriterion.createMany({
        data: parsedCriteria.map((criterion) => ({
          requestId,
          name: criterion.name as
            | 'PRICE'
            | 'TECHNICAL_COMPLIANCE'
            | 'WARRANTY'
            | 'DELIVERY'
            | 'MAINTENANCE'
            | 'PAYMENT_TERMS'
            | 'CUSTOM',
          weightPercent: criterion.weightPercent,
        })),
      })

      await tx.activityLog.create({
        data: {
          actorId: userId,
          requestId,
          action: 'WEIGHTS_SET',
          metadata: {
            criteria: parsedCriteria,
            totalWeight,
          },
        },
      })
    })

    const savedCriteria = await prisma.evaluationCriterion.findMany({
      where: {
        requestId,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Evaluation criteria saved successfully',
      criteria: savedCriteria,
    })
  } catch (error) {
    console.error('Set evaluation criteria error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to save evaluation criteria',
    })
  }
}

export async function runEvaluation(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId
    const requestId = getRequestId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: requestId,
        buyerId: buyerProfile.id,
      },
      include: {
        evaluationCriteria: true,
        bids: {
          where: {
            status: {
              notIn: ['WITHDRAWN', 'REJECTED'],
            },
          },
          include: {
            versions: {
              orderBy: {
                versionNumber: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      })
    }

    if (request.status !== 'OPEN' && request.status !== 'EVALUATING') {
      return res.status(409).json({
        success: false,
        message: 'Only open requests can be evaluated',
      })
    }

    if (request.evaluationCriteria.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Set evaluation criteria before running evaluation',
      })
    }

    const totalWeight = request.evaluationCriteria.reduce(
      (sum, criterion) => sum + Number(criterion.weightPercent),
      0,
    )

    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Evaluation weights must total exactly 100%',
        totalWeight,
      })
    }

    if (request.bids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No bids available for evaluation',
      })
    }

    const versions = request.bids
      .map((bid) => bid.versions[0])
      .filter((version) => version !== undefined)

    if (versions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No bid versions available for evaluation',
      })
    }

    const calculations: EvaluationCalculation[] = versions.map((version) => {
      const criterionScores: CriterionScoreMap = {}

      for (const criterion of request.evaluationCriteria) {
        criterionScores[criterion.name] = calculateCriterionScore(
          criterion.name,
          version,
          versions,
        )
      }

      const weightedTotalScore = request.evaluationCriteria.reduce(
        (total, criterion) => {
          const score = criterionScores[criterion.name] ?? 0

          const weight = Number(criterion.weightPercent) / 100

          return total + score * weight
        },
        0,
      )

      const isCompliant =
        Number(version.panelCapacityKw ?? 0) > 0 &&
        Number(version.totalPrice ?? 0) > 0

      return {
        bidVersionId: version.id,
        requestId,
        tcoAmount: calculateTco(version),
        criterionScores,
        weightedTotalScore,
        isCompliant,
      }
    })

    const compliantResults = calculations
      .filter((result) => result.isCompliant)
      .sort((a, b) => b.weightedTotalScore - a.weightedTotalScore)

    const rankMap = new Map<string, number>()

    compliantResults.forEach((result, index) => {
      rankMap.set(result.bidVersionId, index + 1)
    })

    await prisma.$transaction(async (tx) => {
      await tx.evaluationResult.deleteMany({
        where: {
          requestId,
        },
      })

      for (const result of calculations) {
        await tx.evaluationResult.create({
          data: {
            bidVersionId: result.bidVersionId,
            requestId: result.requestId,
            tcoAmount: result.tcoAmount,
            criterionScores: result.criterionScores,
            weightedTotalScore: result.weightedTotalScore,
            rank: rankMap.get(result.bidVersionId) ?? 0,
            isCompliant: result.isCompliant,
          },
        })
      }

      await tx.solarRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'EVALUATING',
        },
      })

      await tx.activityLog.create({
        data: {
          actorId: userId,
          requestId,
          action: 'EVALUATION_RUN',
          metadata: {
            bidCount: calculations.length,
            criteria: request.evaluationCriteria,
          },
        },
      })
    })

    const savedResults = await prisma.evaluationResult.findMany({
      where: {
        requestId,
      },
      orderBy: [
        {
          rank: 'asc',
        },
        {
          weightedTotalScore: 'desc',
        },
      ],
    })

    return res.status(200).json({
      success: true,
      message: 'Evaluation completed successfully',
      results: savedResults,
    })
  } catch (error) {
    console.error('Run evaluation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to run evaluation',
    })
  }
}

export async function getEvaluation(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId
    const requestId = getRequestId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: requestId,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      })
    }

    const results = await prisma.evaluationResult.findMany({
      where: {
        requestId,
      },
      include: {
        bidVersion: {
          include: {
            bid: {
              include: {
                supplier: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          rank: 'asc',
        },
        {
          weightedTotalScore: 'desc',
        },
      ],
    })

    return res.status(200).json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Get evaluation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluation',
    })
  }
}
