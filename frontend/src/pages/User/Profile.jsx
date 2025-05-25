import { useEffect, useState, useReducer } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

import Loader from '../../components/Loader'
import {
  useProfileMutation,
  useRequestProfileUpdateOtpMutation,
  useVerifyProfileUpdateOtpMutation,
} from '../../redux/api/usersApiSlice'
import { setCredentials } from '../../redux/features/auth/authSlice'

const initialProfileState = {
  step: 'idle',
  otpSent: false,
  otpVerified: false,
  loading: false,
  currentUpdateType: null,
  loadingOtpRequest: false,
  loadingOtpVerify: false,
}

function profileUpdateReducer(state, action) {
  switch (action.type) {
    case 'START_EMAIL_EDIT':
      return { ...state, step: 'email-edit', currentUpdateType: 'email' }
    case 'START_PASSWORD_EDIT':
      return { ...state, step: 'password-edit', currentUpdateType: 'password' }
    case 'OTP_REQUEST_START':
      return { ...state, loadingOtpRequest: true }
    case 'OTP_REQUEST_END':
      return { ...state, loadingOtpRequest: false }
    case 'OTP_REQUESTED':
      return {
        ...state,
        otpSent: true,
        step: `${state.currentUpdateType}-verify`,
        loadingOtpRequest: false,
      }
    case 'OTP_VERIFY_START':
      return { ...state, loadingOtpVerify: true }
    case 'OTP_VERIFY_END':
      return { ...state, loadingOtpVerify: false }
    case 'OTP_VERIFIED':
      return {
        ...state,
        otpVerified: true,
        step: 'idle',
        loadingOtpVerify: false,
      }
    case 'START_SUBMIT':
      return { ...state, step: 'submitting', loading: true }
    case 'FINISH_SUBMIT':
      return { ...state, step: 'idle', loading: false }
    case 'CANCEL_UPDATE':
      return initialProfileState
    default:
      return state
  }
}

const Profile = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayEmail, setDisplayEmail] = useState('') // For UI display
  const [newEmail, setNewEmail] = useState('')
  const [displayNewEmail, setDisplayNewEmail] = useState('') // For UI display
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({
    username: '',
    newEmail: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })

  const [profileState, dispatch] = useReducer(
    profileUpdateReducer,
    initialProfileState
  )
  const { userInfo } = useSelector((state) => state.auth)
  const reduxDispatch = useDispatch()

  const [updateProfile] = useProfileMutation()
  const [requestOtp] = useRequestProfileUpdateOtpMutation()
  const [verifyOtp] = useVerifyProfileUpdateOtpMutation()

  useEffect(() => {
    setUsername(userInfo.username)
    setEmail(userInfo.email.toLowerCase()) // Normalize email
    setDisplayEmail(userInfo.email) // Keep original for display
    setNewEmail(userInfo.email.toLowerCase())
    setDisplayNewEmail(userInfo.email)
  }, [userInfo.email, userInfo.username])

  // Validation function
  const validateForm = () => {
    const newErrors = {
      username: '',
      newEmail: '',
      password: '',
      confirmPassword: '',
      otp: '',
    }
    let isValid = true

    // Username validation
    if (username !== userInfo.username) {
      if (!username.trim()) {
        newErrors.username = 'Username is required'
        isValid = false
      } else if (username.length < 2) {
        newErrors.username = 'Username must be at least 2 characters long'
        isValid = false
      }
    }

    // Email validation
    if (profileState.step === 'email-edit' && newEmail !== email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!newEmail.trim()) {
        newErrors.newEmail = 'Email is required'
        isValid = false
      } else if (!emailRegex.test(newEmail)) {
        newErrors.newEmail = 'Please enter a valid email address'
        isValid = false
      }
    }

    // Password validation
    if (profileState.step === 'password-edit') {
      if (!password) {
        newErrors.password = 'Password is required'
        isValid = false
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long'
        isValid = false
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password =
          'Password must contain at least one uppercase letter'
        isValid = false
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Password must contain at least one number'
        isValid = false
      }

      // Confirm password validation
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
        isValid = false
      }
    }

    // OTP validation
    if (
      profileState.step === 'email-verify' ||
      profileState.step === 'password-verify'
    ) {
      if (!otp.trim()) {
        newErrors.otp = 'Verification code is required'
        isValid = false
      } else if (otp.length !== 6) {
        newErrors.otp = 'Verification code must be 6 digits'
        isValid = false
      } else if (!/^\d+$/.test(otp)) {
        newErrors.otp = 'Verification code must contain only numbers'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const hasChanges = () => {
    if (username !== userInfo.username) return true
    if (
      newEmail !== userInfo.email.toLowerCase() &&
      profileState.otpVerified &&
      profileState.currentUpdateType === 'email'
    )
      return true
    if (
      password &&
      profileState.otpVerified &&
      profileState.currentUpdateType === 'password'
    )
      return true
    return false
  }

  const handleNewEmailChange = (e) => {
    const inputEmail = e.target.value
    setDisplayNewEmail(inputEmail) // Keep user-entered email for UI
    setNewEmail(inputEmail.toLowerCase()) // Normalize to lowercase
  }

  const handleRequestOtp = async () => {
    if (!validateForm()) {
      return
    }

    try {
      dispatch({ type: 'OTP_REQUEST_START' })
      let data = { userId: userInfo._id }

      if (profileState.currentUpdateType === 'email') {
        data.email = newEmail
      } else {
        data.email = email
        data.type = 'password'
      }

      await requestOtp(data).unwrap()
      toast.success(
        `Verification code sent to your ${
          profileState.currentUpdateType === 'password'
            ? 'current email'
            : 'new email'
        }`
      )
      dispatch({ type: 'OTP_REQUESTED' })
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      dispatch({ type: 'OTP_REQUEST_END' })
    }
  }

  const handleVerifyOtp = async () => {
    if (!validateForm()) {
      return
    }

    try {
      dispatch({ type: 'OTP_VERIFY_START' })
      const data = {
        userId: userInfo._id,
        otp,
        type: profileState.currentUpdateType,
        email: profileState.currentUpdateType === 'email' ? newEmail : email,
      }

      await verifyOtp(data).unwrap()

      if (profileState.currentUpdateType === 'email') {
        const res = await updateProfile({
          _id: userInfo._id,
          email: newEmail,
        }).unwrap()
        reduxDispatch(setCredentials({ ...res }))
        setEmail(newEmail)
        setDisplayEmail(displayNewEmail)
        toast.success('Email updated successfully')
      } else {
        toast.success(
          'Password verification successful. You can now update your profile.'
        )
      }

      dispatch({ type: 'OTP_VERIFIED' })
      setOtp('')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      dispatch({ type: 'OTP_VERIFY_END' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    dispatch({ type: 'START_SUBMIT' })

    if (!hasChanges()) {
      toast.info('No changes to update')
      dispatch({ type: 'FINISH_SUBMIT' })
      return
    }

    try {
      const updateData = { _id: userInfo._id }

      if (username !== userInfo.username) updateData.username = username
      if (
        password &&
        profileState.otpVerified &&
        profileState.currentUpdateType === 'password'
      ) {
        updateData.password = password
      }

      if (Object.keys(updateData).length > 1) {
        const res = await updateProfile(updateData).unwrap()
        reduxDispatch(setCredentials({ ...res }))
        toast.success('Profile updated successfully')
        setPassword('')
        setConfirmPassword('')
        dispatch({ type: 'CANCEL_UPDATE' })
      } else {
        toast.info('No changes to update')
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    } finally {
      dispatch({ type: 'FINISH_SUBMIT' })
    }
  }

  const handleCancelUpdate = () => {
    if (profileState.currentUpdateType === 'email') {
      setNewEmail(email)
      setDisplayNewEmail(displayEmail)
    } else {
      setPassword('')
      setConfirmPassword('')
    }
    setOtp('')
    setErrors({
      username: '',
      newEmail: '',
      password: '',
      confirmPassword: '',
      otp: '',
    })
    dispatch({ type: 'CANCEL_UPDATE' })
  }

  const isLoading = profileState.loading

  const styles = {
    errorColor: 'rgb(239, 68, 68)', // Red color for error messages
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-white py-8'>
      <div className='container mx-auto max-w-lg px-4'>
        <div className='bg-[rgba(20,23,34,0.7)] rounded-2xl shadow-lg border border-[rgba(211,190,249,0.2)] backdrop-blur-sm p-6'>
          <h1 className='text-2xl font-bold text-[rgb(211,190,249)] mb-6'>
            Update Profile
          </h1>

          {(isLoading ||
            profileState.loadingOtpRequest ||
            profileState.loadingOtpVerify) && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
              <Loader />
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Username */}
            <div className='bg-[rgba(15,18,28,0.4)] p-4 rounded-lg'>
              <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                Username
              </label>
              <input
                type='text'
                className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none ${
                  errors.username ? 'border-red-500' : 'border-gray-700'
                }`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              {errors.username && (
                <p
                  className='text-sm mt-1'
                  style={{ color: styles.errorColor }}
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Section */}
            <div className='bg-[rgba(15,18,28,0.4)] p-4 rounded-lg'>
              <h2 className='text-xl font-semibold text-[rgb(211,190,249)] mb-4'>
                Email Settings
              </h2>
              <div className='mb-4'>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Current Email
                </label>
                <input
                  type='email'
                  readOnly
                  className='w-full p-3 border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white opacity-70 cursor-not-allowed'
                  value={displayEmail}
                />
              </div>

              {profileState.step !== 'email-edit' &&
                profileState.step !== 'email-verify' && (
                  <button
                    type='button'
                    onClick={() => dispatch({ type: 'START_EMAIL_EDIT' })}
                    className='w-full py-2 px-4 rounded-lg font-medium bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] hover:bg-[rgba(211,190,249,0.25)] transition-colors'
                    disabled={
                      isLoading ||
                      profileState.loadingOtpRequest ||
                      profileState.loadingOtpVerify
                    }
                  >
                    Change Email Address
                  </button>
                )}

              {(profileState.step === 'email-edit' ||
                profileState.step === 'email-verify') && (
                <div className='mt-4 border border-[rgba(211,190,249,0.3)] rounded-lg p-4'>
                  {profileState.step === 'email-edit' ? (
                    <>
                      <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                        New Email Address
                      </label>
                      <input
                        type='email'
                        className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none mb-4 ${
                          errors.newEmail ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={displayNewEmail}
                        onChange={handleNewEmailChange}
                        disabled={
                          isLoading ||
                          profileState.otpSent ||
                          profileState.loadingOtpRequest
                        }
                      />
                      {errors.newEmail && (
                        <p
                          className='text-sm mt-1'
                          style={{ color: styles.errorColor }}
                        >
                          {errors.newEmail}
                        </p>
                      )}
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={handleRequestOtp}
                          disabled={
                            profileState.loadingOtpRequest ||
                            newEmail === email ||
                            !newEmail ||
                            isLoading ||
                            errors.newEmail
                          }
                          className='flex-1 py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] disabled:opacity-70'
                        >
                          {profileState.loadingOtpRequest
                            ? 'Sending...'
                            : 'Send Verification Code'}
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelUpdate}
                          className='flex-1 py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800'
                          disabled={isLoading || profileState.loadingOtpRequest}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex items-center mb-4'>
                        <div className='w-8 h-8 rounded-full bg-[rgba(211,190,249,0.2)] flex items-center justify-center mr-3'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 text-[rgb(211,190,249)]'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                            <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                          </svg>
                        </div>
                        <div>
                          <p className='text-sm text-gray-400'>
                            Verification code sent to {displayNewEmail}
                          </p>
                        </div>
                      </div>
                      <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                        Enter Verification Code
                      </label>
                      <input
                        type='text'
                        className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none mb-4 tracking-widest text-center ${
                          errors.otp ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value
                              .replace(/[^0-9]/g, '')
                              .substring(0, 6)
                          )
                        }
                        maxLength={6}
                        disabled={isLoading || profileState.loadingOtpVerify}
                      />
                      {errors.otp && (
                        <p
                          className='text-sm mt-1'
                          style={{ color: styles.errorColor }}
                        >
                          {errors.otp}
                        </p>
                      )}
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={handleVerifyOtp}
                          disabled={
                            !otp ||
                            otp.length < 6 ||
                            isLoading ||
                            profileState.loadingOtpVerify ||
                            errors.otp
                          }
                          className='flex-1 py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] disabled:opacity-70'
                        >
                          {profileState.loadingOtpVerify
                            ? 'Verifying...'
                            : 'Verify Code'}
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelUpdate}
                          className='flex-1 py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800'
                          disabled={isLoading || profileState.loadingOtpVerify}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className='bg-[rgba(15,18,28,0.4)] p-4 rounded-lg'>
              <h2 className='text-xl font-semibold text-[rgb(211,190,249)] mb-4'>
                Password Settings
              </h2>

              {profileState.step !== 'password-edit' &&
                profileState.step !== 'password-verify' && (
                  <button
                    type='button'
                    onClick={() => dispatch({ type: 'START_PASSWORD_EDIT' })}
                    className='w-full py-2 px-4 rounded-lg font-medium bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] hover:bg-[rgba(211,190,249,0.25)] transition-colors'
                    disabled={
                      isLoading ||
                      profileState.loadingOtpRequest ||
                      profileState.loadingOtpVerify
                    }
                  >
                    Change Password
                  </button>
                )}

              {(profileState.step === 'password-edit' ||
                profileState.step === 'password-verify') && (
                <div className='mt-4 border border-[rgba(211,190,249,0.3)] rounded-lg p-4'>
                  {profileState.step === 'password-edit' ? (
                    <>
                      <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                        New Password
                      </label>
                      <input
                        type='password'
                        className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none mb-4 ${
                          errors.password ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || profileState.loadingOtpRequest}
                      />
                      {errors.password && (
                        <p
                          className='text-sm mt-1'
                          style={{ color: styles.errorColor }}
                        >
                          {errors.password}
                        </p>
                      )}
                      <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                        Confirm Password
                      </label>
                      <input
                        type='password'
                        className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none mb-4 ${
                          errors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-700'
                        }`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading || profileState.loadingOtpRequest}
                      />
                      {errors.confirmPassword && (
                        <p
                          className='text-sm mt-1'
                          style={{ color: styles.errorColor }}
                        >
                          {errors.confirmPassword}
                        </p>
                      )}
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={handleRequestOtp}
                          disabled={
                            !password ||
                            !confirmPassword ||
                            errors.password ||
                            errors.confirmPassword ||
                            isLoading ||
                            profileState.loadingOtpRequest
                          }
                          className='flex-1 py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] disabled:opacity-70'
                        >
                          {profileState.loadingOtpRequest
                            ? 'Sending...'
                            : 'Verify Password'}
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelUpdate}
                          className='flex-1 py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800'
                          disabled={isLoading || profileState.loadingOtpRequest}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='flex items-center mb-4'>
                        <div className='w-8 h-8 rounded-full bg-[rgba(211,190,249,0.2)] flex items-center justify-center mr-3'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 text-[rgb(211,190,249)]'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                            <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                          </svg>
                        </div>
                        <div>
                          <p className='text-sm text-gray-400'>
                            Verification code sent to {displayEmail}
                          </p>
                        </div>
                      </div>
                      <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                        Enter Verification Code
                      </label>
                      <input
                        type='text'
                        className={`w-full p-3 border rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none mb-4 tracking-widest text-center ${
                          errors.otp ? 'border-red-500' : 'border-gray-700'
                        }`}
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value
                              .replace(/[^0-9]/g, '')
                              .substring(0, 6)
                          )
                        }
                        maxLength={6}
                        disabled={isLoading || profileState.loadingOtpVerify}
                      />
                      {errors.otp && (
                        <p
                          className='text-sm mt-1'
                          style={{ color: styles.errorColor }}
                        >
                          {errors.otp}
                        </p>
                      )}
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={handleVerifyOtp}
                          disabled={
                            !otp ||
                            otp.length < 6 ||
                            isLoading ||
                            profileState.loadingOtpVerify ||
                            errors.otp
                          }
                          className='flex-1 py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] disabled:opacity-70'
                        >
                          {profileState.loadingOtpVerify
                            ? 'Verifying...'
                            : 'Verify Code'}
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelUpdate}
                          className='flex-1 py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800'
                          disabled={isLoading || profileState.loadingOtpVerify}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <button
                type='submit'
                disabled={
                  !hasChanges() ||
                  isLoading ||
                  Object.values(errors).some((e) => e)
                }
                className='flex-1 py-3 px-6 rounded-lg font-bold bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>

              {/* Conditionally render My Orders link for non-admin users */}
              {!userInfo.isAdmin && (
                <Link
                  to='/orderhistory'
                  className='flex-1 py-3 px-6 rounded-lg font-bold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors text-center'
                >
                  My Orders
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
