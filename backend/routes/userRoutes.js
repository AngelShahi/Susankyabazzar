import express from 'express'
import {
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyOtpHandler,
  sendOtp,
} from '../controllers/userController.js'

import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Routes for creating a user and viewing users (admin only)
router.route('/').get(authenticate, authorizeAdmin, getAllUsers)

router.post('/auth', loginUser)
router.post('/logout', logoutCurrentUser)

// backend/routes/userRoutes.js or similar
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtpHandler)

// Routes for profile management
router
  .route('/profile')
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile)

// ADMIN ROUTES 👇
router
  .route('/:id')
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById)

export default router
