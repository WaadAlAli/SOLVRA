import { Router } from 'express'

import {
  getRequestBidById,
  getRequestBids,
} from '../controllers/bid.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/requests/:id/bids', getRequestBids)
router.get('/requests/:id/bids/:bidId', getRequestBidById)

export default router
