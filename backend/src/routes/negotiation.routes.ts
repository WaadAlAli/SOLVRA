import { Router } from 'express'

import {
  createNegotiationMessage,
  getBuyerNegotiations,
  getNegotiationById,
} from '../controllers/negotiation.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', getBuyerNegotiations)
router.get('/:id', getNegotiationById)
router.post('/:id/messages', createNegotiationMessage)

export default router
