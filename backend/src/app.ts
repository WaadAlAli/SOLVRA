import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'
import bidRoutes from './routes/bid.routes.js'
import compareRoutes from './routes/compare.routes.js'
import aiInsightsRoutes from './routes/ai-insights.routes.js'
import negotiationRoutes from './routes/negotiation.routes.js'
import whatIfRoutes from './routes/what-if.routes.js'
import requestRoutes from './routes/request.routes.js'
import buyerRoutes from './routes/buyer.routes.js'
import supplierRoutes from './routes/supplier.routes.js'
import evaluationRoutes from './routes/evaluation.routes.js'
import awardRoutes from './routes/award.routes.js'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SOLVRA API is running',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api', bidRoutes)
app.use('/api', aiInsightsRoutes)
app.use('/api/negotiations', negotiationRoutes)
app.use('/api/what-if', whatIfRoutes)
app.use('/api/compare', compareRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/buyer', buyerRoutes)
app.use('/api/evaluation', evaluationRoutes)
app.use('/api/supplier', supplierRoutes)
app.use('/api/award', awardRoutes)

export default app