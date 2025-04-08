import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { useRegisterMutation } from '../../redux/api/usersApiSlice'
import { useVerifyOtpMutation } from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { toast } from 'react-toastify'

const Register = () => {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()
  const [verifyOtp] = useVerifyOtpMutation()

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

  const verifyOtpHandler = async () => {
    try {
      const response = await verifyOtp({ email, otp }).unwrap()
      dispatch(setCredentials(response.data))
      toast.success('OTP verified! You are now logged in.')
      navigate(redirect)
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || 'OTP verification failed')
    }
  }
  return (
    <section className='pl-[10rem] flex flex-wrap'>
      <div className='mr-[4rem] mt-[5rem]'>
        <h1 className='text-2xl font-semibold mb-4'>Register</h1>

        {!showOtpInput ? (
          <form onSubmit={submitHandler} className='container w-[40rem]'>
            <div className='my-[2rem]'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-white'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                className='mt-1 p-2 border rounded w-full'
                placeholder='Enter name'
                value={username}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className='my-[2rem]'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-white'
              >
                Email Address
              </label>
              <input
                type='email'
                id='email'
                className='mt-1 p-2 border rounded w-full'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='my-[2rem]'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-white'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                className='mt-1 p-2 border rounded w-full'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className='my-[2rem]'>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-white'
              >
                Confirm Password
              </label>
              <input
                type='password'
                id='confirmPassword'
                className='mt-1 p-2 border rounded w-full'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              disabled={isLoading}
              type='submit'
              className='bg-gray-800 text-white px-4 py-2 rounded cursor-pointer my-[1rem]'
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            {isLoading && <Loader />}
          </form>
        ) : (
          <div className='mt-8'>
            <h2 className='text-white text-xl mb-2'>
              Enter the OTP sent to {email}
            </h2>
            <input
              type='text'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder='Enter OTP'
              className='p-2 border rounded w-full mb-4'
            />
            <button
              onClick={verifyOtpHandler}
              className='bg-green-600 text-white px-4 py-2 rounded cursor-pointer'
            >
              Verify OTP
            </button>
          </div>
        )}

        <div className='mt-4'>
          <p className='text-black'>
            Already have an account?{' '}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : '/login'}
              className='text-gray-500 hover:underline'
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <img
        src='https://images.unsplash.com/photo-1636487410194-7830594388bc?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        alt=''
        className='h-[65rem] w-[59%] xl:block md:hidden sm:hidden rounded-lg'
      />
    </section>
  )
}

export default Register
