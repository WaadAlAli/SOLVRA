import { Router } from 'express'

import {
  getBuyerProfile,
  updateBuyerProfile,
} from '../controllers/buyer.controller.js'

import {
  getBuyerDashboard,
} from '../controllers/buyerDashboard.controller.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/dashboard', getBuyerDashboard)

router.get('/profile', getBuyerProfile)

router.patch('/profile', updateBuyerProfile)

export default router