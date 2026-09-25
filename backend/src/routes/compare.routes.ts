import { Router } from 'express'

import { getRequestComparison } from '../controllers/compare.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/requests/:requestId', getRequestComparison)

export default router
