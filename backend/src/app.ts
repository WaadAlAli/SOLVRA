import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'

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

export default app