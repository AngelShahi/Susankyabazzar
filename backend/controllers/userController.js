import User from '../models/userModel.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'
import sendEmail from '../utils/sendEmail.js'
import dotenv from 'dotenv'

dotenv.config()

// in userController.js
let tempOtpStore = {} // temp memory store, consider Redis or DB for production

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

  // Save temporarily in memory (use Redis in production)
  tempOtpStore[email] = {
    otp,
    expiry,
    username,
    password, // store raw, hash later
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

  console.log(email)
  console.log(password)

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    // Check if the user is verified
    if (!existingUser.isVerified) {
      res.status(400)
      throw new Error('Please verify your email before logging in.')
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
      // Password mismatch
      res.status(401)
      throw new Error('Invalid password')
    }
  } else {
    // User not found
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

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.username = req.body.username || user.username
    user.email = req.body.email || user.email

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)
      user.password = hashedPassword
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

export {
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
}
