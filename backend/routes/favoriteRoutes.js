// routes/favoriteRoutes.js
import express from 'express'
import {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
} from '../controllers/favoriteController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all favorites
router.get('/', getUserFavorites)

// Add to favorites
router.post('/', addToFavorites)

// Remove from favorites
router.delete('/:productId', removeFromFavorites)

export default router
