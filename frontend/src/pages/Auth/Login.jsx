import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'

// Custom loader component
const CustomLoader = () => (
  <div className='flex justify-center items-center'>
    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300'></div>
  </div>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [login, { isLoading }] = useLoginMutation()

  const { userInfo } = useSelector((state) => state.auth)

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      // Redirect admin users to the dashboard, others to the specified redirect path
      if (userInfo.isAdmin) {
        navigate('/admin/dashboard')
      } else {
        navigate(redirect)
      }
    }
  }, [navigate, redirect, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      dispatch(setCredentials({ ...res }))

      // Check if user is admin and redirect accordingly
      if (res.isAdmin) {
        navigate('/dashboard')
        toast.success('Welcome back, Admin!')
      } else if (redirect === '/') {
        navigate(redirect, { replace: true })
        toast.success('Login successful!')
        window.location.reload()
      } else {
        navigate(redirect)
        toast.success('Login successful!')
      }
    } catch (err) {
      console.log('Error:', err)
      toast.error(err?.data?.message || err.error)
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
            <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
            <p className='text-gray-300'>Sign in to continue to your account</p>
          </div>

          <form onSubmit={submitHandler} className='space-y-6'>
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
                    '::placeholder': { color: 'rgb(150, 150, 170)' },
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

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  className='h-4 w-4 border-gray-600 rounded'
                  style={{
                    backgroundColor: styles.lighterBg,
                    borderColor: 'rgba(211, 190, 249, 0.5)',
                  }}
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-300'
                >
                  Remember me
                </label>
              </div>

              <div className='text-sm'>
                <a
                  href='#'
                  className='font-medium hover:opacity-80 transition-opacity duration-200'
                  style={{ color: styles.accentColor }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              disabled={isLoading}
              type='submit'
              className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-center font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
              style={{
                backgroundColor: styles.accentColor,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                ':hover': { backgroundColor: styles.darkAccent },
              }}
            >
              {isLoading ? <CustomLoader /> : 'Sign In'}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-gray-300'>
              New to our platform?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                className='font-medium hover:opacity-80 transition-opacity duration-200'
                style={{ color: styles.accentColor }}
              >
                Create an account
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
                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Secure Login
              </h2>
              <p className='text-gray-300'>
                Access your account with enhanced security to keep your
                information protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
