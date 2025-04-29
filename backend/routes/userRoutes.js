import express from 'express'
import {
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyOtpHandler,
  sendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  requestProfileUpdateOtp,
  verifyProfileUpdateOtp,
  notifyUserStatusChange,
} from '../controllers/userController.js'

import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Routes for creating a user and viewing users (admin only)
router.route('/').get(authenticate, authorizeAdmin, getAllUsers)

router.post('/auth', loginUser)
router.post('/logout', logoutCurrentUser)

// Registration OTP routes
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtpHandler)

// Password reset routes
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-otp', verifyResetOtp)
router.post('/reset-password', resetPassword)

// Routes for profile management
router
  .route('/profile')
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateUserProfile)

// Profile update OTP routes - require authentication
router.post(
  '/request-profile-update-otp',
  authenticate,
  requestProfileUpdateOtp
)
router.post('/verify-profile-update-otp', authenticate, verifyProfileUpdateOtp)

// Status change notification route
router.post(
  '/notify-status-change',
  authenticate,
  authorizeAdmin,
  notifyUserStatusChange
)

// ADMIN ROUTES 👇
router
  .route('/:id')
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById)

export default router
