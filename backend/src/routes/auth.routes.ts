import { Router } from 'express'

import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPasswordHandler,
} from '../controllers/auth.controller.js'

import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'
import { authRateLimiter } from '../middleware/rate-limit.middleware.js'

const router = Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)

router.get('/me', authenticate, me)

router.post('/logout', logout)
router.post('/forgot-password', authRateLimiter, forgotPassword)

router.post('/reset-password', authRateLimiter, resetPasswordHandler)

router.get(
  '/buyer-test',
  authenticate,
  authorizeRoles('BUYER'),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Buyer authorization works.',
    })
  },
)

export default router
