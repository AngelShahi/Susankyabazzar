// Updates to userRoutes.js - focusing on profile update routes

import express from 'express'
import {
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateUserProfile, // Renamed from getCurrentUserProfile to be clearer
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
  .put(authenticate, updateUserProfile) // Add PUT to update profile

// Profile update OTP routes - require authentication
router.post(
  '/request-profile-update-otp',
  authenticate,
  requestProfileUpdateOtp
)
router.post('/verify-profile-update-otp', authenticate, verifyProfileUpdateOtp)

// ADMIN ROUTES 👇
router
  .route('/:id')
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById)

export default router
