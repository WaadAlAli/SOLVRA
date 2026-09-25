import { Router } from 'express'

import {
  createSupplierBid,
  getMyBidById,
  getMyBids,
  getOpenRequestById,
  getOpenRequests,
  getSupplierDashboard,
  getSupplierProfile,
  updateSupplierProfile,
} from '../controllers/supplier.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'

const router = Router()

router.use(authenticate)
router.use(authorizeRoles('SUPPLIER'))

router.get('/', getSupplierDashboard)
router.get('/profile', getSupplierProfile)
router.patch('/profile', updateSupplierProfile)
router.get('/requests', getOpenRequests)
router.get('/requests/:id', getOpenRequestById)
router.post('/requests/:requestId/bid', createSupplierBid)
router.get('/bids', getMyBids)
router.get('/bids/:id', getMyBidById)

export default router
