import { Router } from 'express'

import {
  getEvaluation,
  runEvaluation,
  setEvaluationCriteria,
} from '../controllers/evaluation.controller.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.put(
  '/requests/:requestId/criteria',
  setEvaluationCriteria,
)

router.post(
  '/requests/:requestId/run',
  runEvaluation,
)

router.get(
  '/requests/:requestId',
  getEvaluation,
)

export default router