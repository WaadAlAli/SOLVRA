import { Router } from 'express'

import { runWhatIfScenario } from '../controllers/what-if.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.post('/requests/:requestId', runWhatIfScenario)

export default router
