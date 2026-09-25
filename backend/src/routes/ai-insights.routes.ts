import { Router } from 'express'

import {
  getInsightsHealth,
  getRequestInsights,
} from '../controllers/ai-insights.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/insights/health', getInsightsHealth)
router.get('/requests/:requestId/insights', getRequestInsights)

export default router
