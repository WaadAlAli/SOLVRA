import { Router } from 'express'

import {
  createNegotiation,
  createNegotiationMessage,
  getMyNegotiations,
  getNegotiationById,
} from '../controllers/negotiation.controller.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)
router.post('/bids/:bidId', createNegotiation)

// Buyer:
//   returns negotiations for their requests.
//
// Supplier:
//   returns negotiations for their own bids.
router.get('/', getMyNegotiations)

// Both buyer and supplier can access the same negotiation.
router.get('/:id', getNegotiationById)

// Both buyer and supplier can send messages.
router.post('/:id/messages', createNegotiationMessage)

export default router
