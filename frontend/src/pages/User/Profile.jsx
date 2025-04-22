import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import Loader from '../../components/Loader'
import { useProfileMutation } from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'
import { Link } from 'react-router-dom'

const Profile = () => {
  const [username, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { userInfo } = useSelector((state) => state.auth)

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation()

  useEffect(() => {
    setUserName(userInfo.username)
    setEmail(userInfo.email)
  }, [userInfo.email, userInfo.username])

  const dispatch = useDispatch()

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await updateProfile({
        _id: userInfo._id,
        username,
        email,
        password,
      }).unwrap()
      dispatch(setCredentials({ ...res }))
      toast.success('Profile updated successfully')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-white py-8'>
      <div className='container mx-auto max-w-md px-4'>
        <div className='bg-[rgba(20,23,34,0.7)] rounded-2xl shadow-lg border border-[rgba(211,190,249,0.2)] backdrop-blur-sm'>
          <div className='p-6 border-b border-[rgba(211,190,249,0.3)]'>
            <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
              Update Profile
            </h1>
            <p className='text-gray-400 mt-2'>
              Manage your account information
            </p>
          </div>

          <div className='p-6'>
            <form onSubmit={submitHandler}>
              <div className='mb-6'>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Username
                </label>
                <input
                  type='text'
                  placeholder='Enter username'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className='mb-6'>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Email Address
                </label>
                <input
                  type='email'
                  placeholder='Enter email'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className='mb-6'>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Password
                </label>
                <input
                  type='password'
                  placeholder='Enter new password (leave blank to keep current)'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className='mb-8'>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  placeholder='Confirm new password'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className='mt-8 flex flex-wrap gap-4'>
                <button
                  type='submit'
                  disabled={isSubmitting || loadingUpdateProfile}
                  className='py-4 px-10 rounded-lg text-lg font-bold bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {isSubmitting || loadingUpdateProfile ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-[rgb(7,10,19)]'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mr-2'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Update Profile
                    </>
                  )}
                </button>

                <Link
                  to='/user-orders'
                  className='py-4 px-10 rounded-lg text-lg font-bold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors flex items-center'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z'
                      clipRule='evenodd'
                    />
                  </svg>
                  My Orders
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
