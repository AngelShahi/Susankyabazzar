import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  useRequestPasswordResetOtpMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from '../../redux/api/usersApiSlice'

// Custom loader component
const CustomLoader = () => (
  <div className='flex justify-center items-center'>
    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300'></div>
  </div>
)

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [requestPasswordResetOtp] = useRequestPasswordResetOtpMutation()
  const [verifyResetOtp] = useVerifyResetOtpMutation()
  const [resetPassword] = useResetPasswordMutation()

  const navigate = useNavigate()

  // Request OTP
  const requestOtpHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await requestPasswordResetOtp({ email }).unwrap()

      toast.success(`OTP sent to ${email}`)
      setShowOtpInput(true)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  const verifyOtpHandler = async (e) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      const response = await verifyResetOtp({ email, otp }).unwrap()

      toast.success('OTP verified successfully')
      setShowResetForm(true)
    } catch (err) {
      toast.error(err?.data?.message || 'OTP verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  // Reset Password
  const resetPasswordHandler = async (e) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill all the fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsResetting(true)

    try {
      const response = await resetPassword({
        email,
        otp,
        newPassword,
      }).unwrap()

      toast.success(response.message || 'Password reset successfully')
      navigate('/login')
    } catch (err) {
      toast.error(err?.data?.message || 'Password reset failed')
    } finally {
      setIsResetting(false)
    }
  }

  // Custom styles that match the specific color scheme
  const styles = {
    backgroundColor: 'rgb(7, 10, 19)',
    accentColor: 'rgb(211, 190, 249)',
    darkAccent: 'rgb(161, 140, 199)',
    darkBg: 'rgb(13, 17, 30)',
    lighterBg: 'rgb(20, 25, 40)',
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div
        className='w-full max-w-6xl flex rounded-xl shadow-2xl overflow-hidden'
        style={{ backgroundColor: styles.darkBg }}
      >
        {/* Left Side - Form */}
        <div className='w-full lg:w-1/2 p-8 md:p-12'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>
              {showResetForm
                ? 'Reset Your Password'
                : showOtpInput
                ? 'Verify Your Email'
                : 'Forgot Password?'}
            </h1>
            <p className='text-gray-300'>
              {showResetForm
                ? 'Enter a new password for your account'
                : showOtpInput
                ? `Enter the verification code sent to ${email}`
                : "Don't worry, we'll help you reset your password"}
            </p>
          </div>

          {!showOtpInput && !showResetForm ? (
            <form onSubmit={requestOtpHandler} className='space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <input
                    type='email'
                    id='email'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='you@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
                style={{
                  backgroundColor: styles.accentColor,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
              >
                {isLoading ? <CustomLoader /> : 'Send Verification Code'}
              </button>
            </form>
          ) : showOtpInput && !showResetForm ? (
            <form onSubmit={verifyOtpHandler} className='space-y-6'>
              <div>
                <label
                  htmlFor='otp'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Verification Code
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      />
                    </svg>
                  </div>
                  <input
                    type='text'
                    id='otp'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='Enter verification code'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                disabled={isVerifying}
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
                style={{
                  backgroundColor: styles.accentColor,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
              >
                {isVerifying ? <CustomLoader /> : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPasswordHandler} className='space-y-6'>
              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  New Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='newPassword'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='••••••••'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <div
                    className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      className='h-5 w-5 hover:opacity-80 transition-opacity duration-200'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        />
                      ) : (
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Confirm New Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='••••••••'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div
                    className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg
                      className='h-5 w-5 hover:opacity-80 transition-opacity duration-200'
                      fill='none'
                      stroke='rgb(211, 190, 249)'
                      viewBox='0 0 24 24'
                    >
                      {showConfirmPassword ? (
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        />
                      ) : (
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              <button
                disabled={isResetting}
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
                style={{
                  backgroundColor: styles.accentColor,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
              >
                {isResetting ? <CustomLoader /> : 'Reset Password'}
              </button>
            </form>
          )}

          <div className='mt-8 text-center'>
            <p className='text-gray-300'>
              Remember your password?{' '}
              <a
                href='/login'
                className='font-medium hover:opacity-80 transition-opacity duration-200'
                style={{ color: styles.accentColor }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className='hidden lg:block w-1/2 relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 opacity-60'></div>
          <div className='absolute inset-0 flex items-center justify-center z-20'>
            <div
              className='text-center p-6 rounded-xl max-w-md'
              style={{ backgroundColor: 'rgba(7, 10, 19, 0.8)' }}
            >
              <div
                className='w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full'
                style={{
                  backgroundColor: 'rgba(211, 190, 249, 0.2)',
                  border: '2px solid rgb(211, 190, 249)',
                }}
              >
                <svg
                  className='w-8 h-8'
                  fill='none'
                  stroke='rgb(211, 190, 249)'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Account Recovery
              </h2>
              <p className='text-gray-300'>
                We take security seriously. Your account is protected with
                multi-step verification to ensure only you can reset your
                password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
