import { Router } from 'express'

import {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  openRequest,
} from '../controllers/request.controller.js'
import {
  analyzeRequest,
  confirmRequirements,
} from '../controllers/requestAi.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.post('/', createRequest)

router.get('/', getMyRequests)

router.get('/:id', getRequestById)

router.patch('/:id', updateRequest)

router.delete('/:id', deleteRequest)

router.post('/:id/open', openRequest)

router.post('/:id/analyze', analyzeRequest)
router.post('/:id/requirements/confirm', confirmRequirements)

export default router