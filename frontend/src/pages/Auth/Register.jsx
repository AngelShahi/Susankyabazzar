import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  useRegisterMutation,
  useVerifyOtpMutation,
} from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'

// Custom loader component for displaying a loading spinner
const CustomLoader = () => (
  <div className='flex justify-center items-center'>
    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300'></div>
  </div>
)

// Main Register component for handling user registration and OTP verification
const Register = () => {
  // State for form inputs and UI toggles
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false) // Toggle between registration and OTP verification form
  const [showPassword, setShowPassword] = useState(false) // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // Toggle confirm password visibility

  // Redux hooks for dispatching actions and accessing state
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // RTK Query hooks for registration and OTP verification API calls
  const [register, { isLoading }] = useRegisterMutation()
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation()

  // Access user info from Redux store
  const { userInfo } = useSelector((state) => state.auth)

  // Get redirect URL from query parameters or default to home
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  // Redirect authenticated users to the specified route
  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo])

  // Handle registration form submission
  const submitHandler = async (e) => {
    e.preventDefault()

    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Invalid credentials provided')
    } else {
      try {
        // Attempt to register user
        await register({ username, email, password }).unwrap()
        toast.success(
          'Account creation initiated. Please verify your credentials.'
        )
        setShowOtpInput(true) // Show OTP input form
      } catch (err) {
        console.error(err)
        toast.error(err?.data?.message || 'Account creation failed')
      }
    }
  }

  // Handle OTP verification form submission
  const verifyOtpHandler = async (e) => {
    e.preventDefault()
    try {
      // Verify OTP and get user data
      const response = await verifyOtp({ email, otp }).unwrap()
      console.log('OTP verification response:', response)

      // Store user credentials in Redux
      dispatch(setCredentials(response))
      toast.success('Credentials verified. Access granted.')

      // Prevent admin registration
      if (response.isAdmin) {
        toast.error('Unauthorized account type')
        return
      }

      // Navigate to redirect URL or home
      if (redirect === '/') {
        navigate(redirect, { replace: true })
        window.location.reload() // Refresh to ensure state consistency
      } else {
        navigate(redirect)
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || 'Verification failed')
    }
  }

  // Define custom color scheme for consistent styling
  const styles = {
    backgroundColor: 'rgb(7, 10, 19)',
    accentColor: 'rgb(211, 190, 249)',
    darkAccent: 'rgb(161, 140, 199)',
    darkBg: 'rgb(13, 17, 30)',
    lighterBg: 'rgb(20, 25, 40)',
  }

  return (
    // Main container with full-screen centering
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ backgroundColor: styles.backgroundColor }}
    >
      {/* Form and image container */}
      <div
        className='w-full max-w-6xl flex rounded-xl shadow-2xl overflow-hidden'
        style={{ backgroundColor: styles.darkBg }}
      >
        {/* Left Side - Registration/OTP Form */}
        <div className='w-full lg:w-1/2 p-8 md:p-12'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-white mb-2'>
              {showOtpInput ? 'Verify Your Credentials' : 'Create Account'}
            </h1>
            <p className='text-gray-300'>
              {showOtpInput
                ? `Enter the code sent to your registered contact`
                : 'Sign up to access our platform'}
            </p>
          </div>

          {/* Conditional rendering: Registration form or OTP verification form */}
          {!showOtpInput ? (
            <form onSubmit={submitHandler} className='space-y-6'>
              {/* Username Input */}
              <div>
                <label
                  htmlFor='username'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Full Name
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
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                  <input
                    type='text'
                    id='username'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='Enter your name'
                    value={username}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Contact Address
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
                    placeholder='Enter contact address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Passcode
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
                    id='password'
                    className='mt-1 pl-10 p-3 text-white border rounded-lg w-full focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: styles.lighterBg,
                      borderColor: 'rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                    placeholder='••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password Input with Visibility Toggle */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Confirm Passcode
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

              {/* Submit Button for Registration */}
              <button
                disabled={isLoading}
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
                style={{
                  backgroundColor: styles.accentColor,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
              >
                {isLoading ? <CustomLoader /> : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtpHandler} className='space-y-6'>
              {/* OTP Input */}
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

              {/* Submit Button for OTP Verification */}
              <button
                disabled={isVerifying}
                type='submit'
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
                style={{
                  backgroundColor: styles.accentColor,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
              >
                {isVerifying ? <CustomLoader /> : 'Verify & Sign In'}
              </button>
            </form>
          )}

          {/* Link to Login Page */}
          <div className='mt-8 text-center'>
            <p className='text-gray-300'>
              Already registered?{' '}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : '/login'}
                className='font-medium hover:opacity-80 transition-opacity duration-200'
                style={{ color: styles.accentColor }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
        /* Right Side - Decorative Image Section (Visible on Large Screens) */
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
                    d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Join Our Platform
              </h2>
              <p className='text-gray-300'>
                Register to unlock exclusive features and connect with our
                community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
