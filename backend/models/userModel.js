import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, 
    verificationCode: String,
    verificationCodeExpiry: Date,
    deactivationReason: String, 
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
export default User
