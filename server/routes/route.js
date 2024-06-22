import express from 'express'
import userRoutes from './userRoutes.js'
import adminRoutes from './adminRoutes.js'

const router = express.Router()

// ROUTING FILES
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)

export default router