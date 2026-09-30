import { Router } from 'express'

import { awardBid } from '../controllers/award.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.post('/requests/:requestId', awardBid)

export default router
