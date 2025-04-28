import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  useRegisterMutation,
  useVerifyOtpMutation,
} from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'

// Custom loader component
const CustomLoader = () => (
  <div className='flex justify-center items-center'>
    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300'></div>
  </div>
)

const Register = () => {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation()

  const { userInfo } = useSelector((state) => state.auth)

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
    } else {
      try {
        await register({ username, email, password }).unwrap()
        toast.success('User registered! Please verify your email.')
        setShowOtpInput(true) // Show OTP input after successful registration
      } catch (err) {
        console.error(err)
        toast.error(err?.data?.message || 'Registration failed')
      }
    }
  }

  const verifyOtpHandler = async (e) => {
    e.preventDefault()
    try {
      const response = await verifyOtp({ email, otp }).unwrap()
      // Log the response to check structure
      console.log('OTP verification response:', response)

      // If the user data is nested inside response.data
      dispatch(setCredentials(response))
      toast.success('OTP verified! You are now logged in.')

      // Check if the registered user is an admin
      if (response.isAdmin) {
        toast.error('Admin registration is not allowed here.')
        return
      }

      // If not admin, navigate normally
      if (redirect === '/') {
        navigate(redirect, { replace: true })
        // Add window.location.reload() like in login component
        window.location.reload()
      } else {
        navigate(redirect)
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || 'OTP verification failed')
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
              {showOtpInput ? 'Verify Your Email' : 'Create Account'}
            </h1>
            <p className='text-gray-300'>
              {showOtpInput
                ? `Enter the verification code sent to ${email}`
                : 'Register to get started with our platform'}
            </p>
          </div>

          {!showOtpInput ? (
            <form onSubmit={submitHandler} className='space-y-6'>
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
                    placeholder='John Doe'
                    value={username}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Password
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

              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-300 mb-1'
                >
                  Confirm Password
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
                {isVerifying ? <CustomLoader /> : 'Verify & Login'}
              </button>
            </form>
          )}

          <div className='mt-8 text-center'>
            <p className='text-gray-300'>
              Already have an account?{' '}
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
                    d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Join Our Community
              </h2>
              <p className='text-gray-300'>
                Create your account to access exclusive features and connect
                with our growing community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
