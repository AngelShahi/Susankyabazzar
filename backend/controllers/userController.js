import User from '../models/userModel.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'
import sendEmail from '../utils/sendEmail.js'
import dotenv from 'dotenv'

dotenv.config()

// in userController.js
let tempOtpStore = {} // temp memory store

const sendOtp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.status(400)
    throw new Error('Please fill all the fields')
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 10 * 60 * 1000

  // Save temporarily in memory
  tempOtpStore[email] = {
    otp,
    expiry,
    username,
    password,
  }

  const message = `
    <h2>Hello ${username},</h2>
    <p>Your OTP is: <strong>${otp}</strong></p>
    <p>This code expires in 10 minutes.</p>
  `

  await sendEmail({
    email,
    subject: 'Your OTP Code',
    html: message,
  })

  res.status(200).json({ message: 'OTP sent to email' })
})

const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  const data = tempOtpStore[email]
  if (!data) {
    res.status(400)
    throw new Error('No OTP request found for this email')
  }

  const { otp: validOtp, expiry, username, password } = data

  if (Date.now() > expiry) {
    delete tempOtpStore[email]
    res.status(400)
    throw new Error('OTP has expired')
  }

  if (otp !== validOtp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  // All good – create user
  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    isVerified: true,
  })

  delete tempOtpStore[email]

  createToken(res, newUser._id)

  res.status(201).json({
    _id: newUser._id,
    username: newUser.username,
    email: newUser.email,
  })
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    // Check if the user is verified
    if (!existingUser.isVerified) {
      res.status(400)
      throw new Error('Please verify your email before logging in.')
    }

    // Check if account is active
    if (!existingUser.isActive) {
      res.status(403)
      throw new Error(
        'Your account has been deactivated. Please contact support.'
      )
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (isPasswordValid) {
      createToken(res, existingUser._id)

      return res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
      })
    } else {
      res.status(401)
      throw new Error('Invalid password')
    }
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  })

  res.status(200).json({ message: 'Logged out successfully' })
})

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    })
  } else {
    res.status(404)
    throw new Error('User not found.')
  }
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    // Allow updating username and password without verification
    user.username = req.body.username || user.username

    // Email updates should be handled separately through OTP verification
    // Only update if email is provided AND it matches the current email
    // This prevents direct email updates without verification
    if (req.body.email && req.body.email === user.email) {
      user.email = req.body.email
    }

    // Update password if provided
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10)
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const requestProfileUpdateOtp = asyncHandler(async (req, res) => {
  const { userId, email, type } = req.body

  if (!userId || !email) {
    res.status(400)
    throw new Error('User ID and email are required')
  }

  // Make sure this user can only request OTP for themselves
  if (req.user._id.toString() !== userId) {
    res.status(403)
    throw new Error('Not authorized to update this profile')
  }

  const user = await User.findById(userId)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Check if the new email already exists for a different user (only for email updates)
  if (!type || type !== 'password') {
    if (email !== user.email) {
      const emailExists = await User.findOne({ email })
      if (emailExists) {
        res.status(400)
        throw new Error('Email already in use by another account')
      }
    }
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 10 * 60 * 1000 // 10 minutes

  // Store OTP temporarily
  tempOtpStore[email] = {
    otp,
    expiry,
    userId: user._id,
    purpose: type === 'password' ? 'password-update' : 'profile-update', // Different purpose for password updates
  }

  let subject, message

  if (type === 'password') {
    subject = 'Password Change Verification'
    message = `
      <h2>Hello ${user.username},</h2>
      <p>Your password change verification code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this password change, please secure your account immediately.</p>
    `
  } else {
    subject = 'Profile Update Verification'
    message = `
      <h2>Hello ${user.username},</h2>
      <p>Your profile update verification code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this profile update, please secure your account immediately.</p>
    `
  }

  // Send OTP to the email address (current email for password changes, new email for email changes)
  await sendEmail({
    email,
    subject,
    html: message,
  })

  res.status(200).json({ message: 'Verification code sent to email' })
})

const verifyProfileUpdateOtp = asyncHandler(async (req, res) => {
  const { userId, email, otp, type } = req.body

  if (!userId || !email || !otp) {
    res.status(400)
    throw new Error('User ID, email and OTP are required')
  }

  // Make sure this user can only verify OTP for themselves
  if (req.user._id.toString() !== userId) {
    res.status(403)
    throw new Error('Not authorized to update this profile')
  }

  const data = tempOtpStore[email]
  if (!data) {
    res.status(400)
    throw new Error('No OTP request found for this email')
  }

  const { otp: validOtp, expiry, userId: otpUserId, purpose } = data

  // Check if the purpose matches what we expect
  const expectedPurpose =
    type === 'password' ? 'password-update' : 'profile-update'
  if (purpose !== expectedPurpose) {
    res.status(400)
    throw new Error('Invalid OTP purpose')
  }

  if (userId !== otpUserId.toString()) {
    res.status(400)
    throw new Error('User ID mismatch')
  }

  if (Date.now() > expiry) {
    delete tempOtpStore[email]
    res.status(400)
    throw new Error('OTP has expired')
  }

  if (otp !== validOtp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  // For password updates, we don't actually update the password yet
  // Just mark the OTP as verified and let the main profile update handle it
  if (type === 'password') {
    // Clean up OTP data
    delete tempOtpStore[email]

    return res.status(200).json({
      message: 'Password verification successful',
      _id: otpUserId,
    })
  }

  // For email updates, proceed with the update
  const user = await User.findById(userId)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Check if email already exists (race condition check)
  if (email !== user.email) {
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      delete tempOtpStore[email]
      res.status(400)
      throw new Error('Email already in use by another account')
    }
  }

  // Update the email
  user.email = email
  await user.save()

  // Clean up OTP data
  delete tempOtpStore[email]

  res.status(200).json({
    message: 'Email updated successfully',
    _id: user._id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  })
})

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    if (user.isAdmin) {
      res.status(400)
      throw new Error('Cannot delete admin user')
    }

    await User.deleteOne({ _id: user._id })
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found.')
  }
})

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.username = req.body.username || user.username
    user.email = req.body.email || user.email
    user.isAdmin = Boolean(req.body.isAdmin)

    // Handle isActive if provided
    if (typeof req.body.isActive !== 'undefined') {
      user.isActive = req.body.isActive
    }

    // Store deactivation reason if provided
    if (req.body.deactivationReason) {
      user.deactivationReason = req.body.deactivationReason
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isActive: updatedUser.isActive,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// New functions for password reset
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 10 * 60 * 1000 // 10 minutes

  // Store OTP temporarily (same approach as registration)
  tempOtpStore[email] = {
    otp,
    expiry,
    userId: user._id,
    purpose: 'password-reset', // To distinguish from registration OTPs
  }

  const message = `
    <h2>Hello ${user.username},</h2>
    <p>Your password reset OTP is: <strong>${otp}</strong></p>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
  `

  await sendEmail({
    email,
    subject: 'Password Reset OTP',
    html: message,
  })

  res.status(200).json({ message: 'Password reset OTP sent to email' })
})

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    res.status(400)
    throw new Error('Email and OTP are required')
  }

  const data = tempOtpStore[email]
  if (!data) {
    res.status(400)
    throw new Error('No OTP request found for this email')
  }

  const { otp: validOtp, expiry, userId, purpose } = data

  if (purpose !== 'password-reset') {
    res.status(400)
    throw new Error('Invalid OTP purpose')
  }

  if (Date.now() > expiry) {
    delete tempOtpStore[email]
    res.status(400)
    throw new Error('OTP has expired')
  }

  if (otp !== validOtp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  // Don't delete the OTP data yet, we'll use it in resetPassword

  res.status(200).json({
    message: 'OTP verified successfully',
    userId,
  })
})

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    res.status(400)
    throw new Error('Email, OTP and new password are required')
  }

  const data = tempOtpStore[email]
  if (!data) {
    res.status(400)
    throw new Error('No OTP request found for this email')
  }

  const { otp: validOtp, expiry, userId, purpose } = data

  if (purpose !== 'password-reset') {
    res.status(400)
    throw new Error('Invalid OTP purpose')
  }

  if (Date.now() > expiry) {
    delete tempOtpStore[email]
    res.status(400)
    throw new Error('OTP has expired')
  }

  if (otp !== validOtp) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  // Valid OTP, proceed with password reset
  const user = await User.findById(userId)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  await user.save()

  // Clean up OTP data
  delete tempOtpStore[email]

  res.status(200).json({ message: 'Password reset successful' })
})

const notifyUserStatusChange = asyncHandler(async (req, res) => {
  const { email, username, isActive, reason } = req.body

  try {
    const message = isActive
      ? `
        <h2>Account Reactivated</h2>
        <p>Your account has been reactivated by the administrator.</p>
        <p>You can now log in and use all features of the platform.</p>
      `
      : `
        <h2>Account Deactivated</h2>
        <p>Your account has been deactivated by the administrator.</p>
        ${reason && `<p><strong>Reason:</strong> ${reason}</p>`}
        <p>If you believe this was done in error, please contact <a href="mailto:support@example.com">support</a>.</p>
      `

    await sendEmail({
      email,
      subject: isActive ? 'Account Reactivated' : 'Account Deactivated',
      html: message,
    })
    
    res.status(200).json({ message: 'Notification sent successfully' })
  } catch (error) {
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

export {
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateUserProfile,
  requestProfileUpdateOtp,
  verifyProfileUpdateOtp,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyOtpHandler,
  sendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  notifyUserStatusChange,
}
