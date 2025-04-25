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

// Initial state for profile updates
const initialProfileState = {
  step: 'idle', // idle, email-edit, email-verify, password-edit, password-verify, submitting
  otpSent: false,
  otpVerified: false,
  loading: false,
  currentUpdateType: null, // email or password
}

// Reducer for profile update workflow
function profileUpdateReducer(state, action) {
  switch (action.type) {
    case 'START_EMAIL_EDIT':
      return { ...state, step: 'email-edit', currentUpdateType: 'email' }
    case 'START_PASSWORD_EDIT':
      return { ...state, step: 'password-edit', currentUpdateType: 'password' }
    case 'OTP_REQUESTED':
      return {
        ...state,
        otpSent: true,
        step: `${state.currentUpdateType}-verify`,
      }
    case 'OTP_VERIFIED':
      return { ...state, otpVerified: true, step: 'idle' }
    case 'START_SUBMIT':
      return { ...state, step: 'submitting', loading: true }
    case 'FINISH_SUBMIT':
      return { ...state, step: 'idle', loading: false }
    case 'CANCEL_UPDATE':
      return {
        ...state,
        step: 'idle',
        otpSent: false,
        otpVerified: false,
        currentUpdateType: null,
      }
    default:
      return state
  }
}

const Profile = () => {
  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')

  // Profile update workflow state
  const [profileState, dispatch] = useReducer(
    profileUpdateReducer,
    initialProfileState
  )

  const { userInfo } = useSelector((state) => state.auth)
  const reduxDispatch = useDispatch()

  // API hooks
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation()
  const [requestOtp, { isLoading: loadingOtpRequest }] =
    useRequestProfileUpdateOtpMutation()
  const [verifyOtp, { isLoading: loadingOtpVerify }] =
    useVerifyProfileUpdateOtpMutation()

  // Initialize form with user data
  useEffect(() => {
    setUsername(userInfo.username)
    setEmail(userInfo.email)
    setNewEmail(userInfo.email)
  }, [userInfo.email, userInfo.username])

  // Check if any field has changed from original values
  const hasChanges = () => {
    if (username !== userInfo.username) return true
    if (
      newEmail !== userInfo.email &&
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

  // Request OTP verification code
  const handleRequestOtp = async () => {
    try {
      let data = {
        userId: userInfo._id,
      }

      if (profileState.currentUpdateType === 'email') {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
          toast.error('Please enter a valid email address')
          return
        }
        data.email = newEmail
      } else if (profileState.currentUpdateType === 'password') {
        // For password verification, use current email
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
    }
  }

  // Verify OTP code
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid verification code')
      return
    }

    try {
      const data = {
        userId: userInfo._id,
        otp,
        type: profileState.currentUpdateType,
      }

      if (profileState.currentUpdateType === 'email') {
        data.email = newEmail
      } else if (profileState.currentUpdateType === 'password') {
        data.email = email
      }

      await verifyOtp(data).unwrap()

      if (profileState.currentUpdateType === 'email') {
        // After OTP verification, update the user profile with new email
        const res = await updateProfile({
          _id: userInfo._id,
          email: newEmail,
        }).unwrap()

        reduxDispatch(setCredentials({ ...res }))
        toast.success('Email updated successfully')
        setEmail(newEmail)
      } else if (profileState.currentUpdateType === 'password') {
        toast.success(
          'Password verification successful. You can now update your profile.'
        )
      }

      dispatch({ type: 'OTP_VERIFIED' })
      setOtp('')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch({ type: 'START_SUBMIT' })

    // Validate password match if updating password
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match')
      dispatch({ type: 'FINISH_SUBMIT' })
      return
    }

    // Check if there are any changes at all
    if (!hasChanges()) {
      toast.info('No changes to update')
      dispatch({ type: 'FINISH_SUBMIT' })
      return
    }

    try {
      // Build update data with only changed fields
      const updateData = {
        _id: userInfo._id,
      }

      if (username !== userInfo.username) {
        updateData.username = username
      }

      // Include password if it was verified
      if (
        password &&
        profileState.otpVerified &&
        profileState.currentUpdateType === 'password'
      ) {
        updateData.password = password
      }

      // Only proceed if there's something to update
      if (Object.keys(updateData).length > 1) {
        // > 1 because _id is always included
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

  // Cancel current update and reset related fields
  const handleCancelUpdate = () => {
    if (profileState.currentUpdateType === 'email') {
      setNewEmail(email)
    } else if (profileState.currentUpdateType === 'password') {
      setPassword('')
      setConfirmPassword('')
    }

    setOtp('')
    dispatch({ type: 'CANCEL_UPDATE' })
  }

  // Various UI state conditions
  const isEmailUpdateMode =
    profileState.step === 'email-edit' || profileState.step === 'email-verify'
  const isPasswordUpdateMode =
    profileState.step === 'password-edit' ||
    profileState.step === 'password-verify'
  const isVerifyingEmail = profileState.step === 'email-verify'
  const isVerifyingPassword = profileState.step === 'password-verify'
  const isLoading =
    loadingUpdateProfile ||
    profileState.loading ||
    loadingOtpRequest ||
    loadingOtpVerify

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-white py-8'>
      <div className='container mx-auto max-w-md px-4'>
        <div className='bg-[rgba(20,23,34,0.7)] rounded-2xl shadow-lg border border-[rgba(211,190,249,0.2)] backdrop-blur-sm'>
          {/* Header */}
          <div className='p-6 border-b border-[rgba(211,190,249,0.3)]'>
            <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
              Update Profile
            </h1>
            <p className='text-gray-400 mt-2'>
              Manage your account information
            </p>
          </div>

          {/* Profile update process status bar */}
          {(isEmailUpdateMode || isPasswordUpdateMode) && (
            <div className='px-6 pt-4'>
              <div className='w-full bg-[rgb(7,10,19)] rounded-full h-2.5 mb-2'>
                <div
                  className='bg-[rgb(211,190,249)] h-2.5 rounded-full transition-all'
                  style={{
                    width: profileState.otpSent
                      ? profileState.otpVerified
                        ? '100%'
                        : '66%'
                      : '33%',
                  }}
                ></div>
              </div>
              <div className='flex justify-between text-xs text-gray-400 mb-4'>
                <span>Start</span>
                <span>Verify</span>
                <span>Complete</span>
              </div>
              <div className='mb-4 text-center text-sm'>
                {!profileState.otpSent && (
                  <p className='text-[rgb(211,190,249)]'>
                    {isEmailUpdateMode
                      ? 'Step 1: Enter your new email address'
                      : 'Step 1: Enter your new password'}
                  </p>
                )}
                {profileState.otpSent && !profileState.otpVerified && (
                  <p className='text-[rgb(211,190,249)]'>
                    Step 2: Enter the verification code sent to your{' '}
                    {isEmailUpdateMode ? 'new email' : 'email'}
                  </p>
                )}
                {profileState.otpVerified && (
                  <p className='text-[rgb(211,190,249)]'>
                    Step 3: Changes verified! Click "Update Profile" to save
                    changes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main Form */}
          <div className='p-6'>
            <form onSubmit={handleSubmit}>
              {/* Username Section */}
              <div className='mb-6 bg-[rgba(15,18,28,0.4)] p-5 rounded-lg'>
                <h2 className='text-xl font-semibold text-[rgb(211,190,249)] mb-4'>
                  Basic Information
                </h2>
                <div>
                  <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                    Username
                  </label>
                  <input
                    type='text'
                    placeholder='Enter username'
                    className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Section */}
              <div className='mb-6 bg-[rgba(15,18,28,0.4)] p-5 rounded-lg'>
                <h2 className='text-xl font-semibold text-[rgb(211,190,249)] mb-4'>
                  Email Settings
                </h2>

                <div className='mb-4'>
                  <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                    Current Email Address
                  </label>
                  <div className='flex items-center gap-2'>
                    <input
                      type='email'
                      readOnly
                      className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white opacity-70 cursor-not-allowed'
                      value={email}
                    />
                  </div>
                </div>

                {!isEmailUpdateMode && (
                  <button
                    type='button'
                    onClick={() => dispatch({ type: 'START_EMAIL_EDIT' })}
                    className='py-2 px-4 rounded-lg font-medium bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] hover:bg-[rgba(211,190,249,0.25)] transition-colors'
                    disabled={isLoading || isPasswordUpdateMode}
                  >
                    <span className='flex items-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 mr-2'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                      </svg>
                      Change Email Address
                    </span>
                  </button>
                )}

                {isEmailUpdateMode && (
                  <div className='mt-4 border border-[rgba(211,190,249,0.3)] rounded-lg p-4'>
                    {!isVerifyingEmail ? (
                      <>
                        <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                          New Email Address
                        </label>
                        <input
                          type='email'
                          placeholder='Enter new email'
                          className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all mb-4'
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          disabled={isLoading || profileState.otpSent}
                        />
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={handleRequestOtp}
                            disabled={
                              loadingOtpRequest ||
                              newEmail === email ||
                              !newEmail
                            }
                            className='py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
                          >
                            {loadingOtpRequest ? (
                              <span className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-[rgb(7,10,19)]'
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
                                Sending...
                              </span>
                            ) : (
                              <span className='flex items-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-4 w-4 mr-2'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                >
                                  <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
                                </svg>
                                Send Verification Code
                              </span>
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={handleCancelUpdate}
                            className='py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors'
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='mb-4'>
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
                              <h3 className='text-[rgb(211,190,249)] font-medium'>
                                Verification Code Sent
                              </h3>
                              <p className='text-sm text-gray-400'>
                                We sent a code to {newEmail}
                              </p>
                            </div>
                          </div>
                          <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                            Enter Verification Code
                          </label>
                          <input
                            type='text'
                            placeholder='6-digit code'
                            className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all tracking-widest text-center font-mono'
                            value={otp}
                            onChange={(e) =>
                              setOtp(
                                e.target.value
                                  .replace(/[^0-9]/g, '')
                                  .substring(0, 6)
                              )
                            }
                            maxLength={6}
                            disabled={isLoading}
                          />
                        </div>
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={handleVerifyOtp}
                            disabled={
                              loadingOtpVerify || !otp || otp.length < 6
                            }
                            className='py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
                          >
                            {loadingOtpVerify ? (
                              <span className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-[rgb(7,10,19)]'
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
                                Verifying...
                              </span>
                            ) : (
                              <span className='flex items-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-4 w-4 mr-2'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                                Verify Code
                              </span>
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() => handleRequestOtp()}
                            disabled={loadingOtpRequest}
                            className='py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors'
                          >
                            Resend Code
                          </button>
                          <button
                            type='button'
                            onClick={handleCancelUpdate}
                            className='py-2 px-4 rounded-lg font-medium border border-red-800 text-red-300 hover:bg-red-900 transition-colors'
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
              <div className='mb-6 bg-[rgba(15,18,28,0.4)] p-5 rounded-lg'>
                <h2 className='text-xl font-semibold text-[rgb(211,190,249)] mb-4'>
                  Password Settings
                </h2>

                {!isPasswordUpdateMode ? (
                  <>
                    <p className='text-gray-400 mb-4'>
                      Password changes require verification through your email.
                    </p>
                    <button
                      type='button'
                      onClick={() => dispatch({ type: 'START_PASSWORD_EDIT' })}
                      className='py-2 px-4 rounded-lg font-medium bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] hover:bg-[rgba(211,190,249,0.25)] transition-colors'
                      disabled={isLoading || isEmailUpdateMode}
                    >
                      <span className='flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-2'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Change Password
                      </span>
                    </button>
                  </>
                ) : (
                  <div className='border border-[rgba(211,190,249,0.3)] rounded-lg p-4'>
                    {!isVerifyingPassword ? (
                      <>
                        <div className='mb-4'>
                          <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                            New Password
                          </label>
                          <input
                            type='password'
                            placeholder='Enter new password'
                            className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading || profileState.otpSent}
                          />
                        </div>
                        <div className='mb-4'>
                          <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                            Confirm New Password
                          </label>
                          <input
                            type='password'
                            placeholder='Confirm new password'
                            className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading || profileState.otpSent}
                          />
                          {password &&
                            confirmPassword &&
                            password !== confirmPassword && (
                              <p className='text-red-400 text-sm mt-2'>
                                Passwords do not match
                              </p>
                            )}
                        </div>
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={() => handleRequestOtp()}
                            disabled={
                              loadingOtpRequest ||
                              !password ||
                              !confirmPassword ||
                              password !== confirmPassword ||
                              password.length < 6
                            }
                            className='py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
                          >
                            {loadingOtpRequest ? (
                              <span className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-[rgb(7,10,19)]'
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
                                Sending...
                              </span>
                            ) : (
                              <span className='flex items-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-4 w-4 mr-2'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                >
                                  <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
                                </svg>
                                Continue with Verification
                              </span>
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={handleCancelUpdate}
                            className='py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors'
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='mb-4'>
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
                              <h3 className='text-[rgb(211,190,249)] font-medium'>
                                Verification Code Sent
                              </h3>
                              <p className='text-sm text-gray-400'>
                                We sent a code to {email}
                              </p>
                            </div>
                          </div>
                          <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                            Enter Verification Code
                          </label>
                          <input
                            type='text'
                            placeholder='6-digit code'
                            className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all tracking-widest text-center font-mono'
                            value={otp}
                            onChange={(e) =>
                              setOtp(
                                e.target.value
                                  .replace(/[^0-9]/g, '')
                                  .substring(0, 6)
                              )
                            }
                            maxLength={6}
                            disabled={isLoading}
                          />
                        </div>
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={handleVerifyOtp}
                            disabled={
                              loadingOtpVerify || !otp || otp.length < 6
                            }
                            className='py-2 px-4 rounded-lg font-medium bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
                          >
                            {loadingOtpVerify ? (
                              <span className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-[rgb(7,10,19)]'
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
                                Verifying...
                              </span>
                            ) : (
                              <span className='flex items-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-4 w-4 mr-2'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                                Verify Code
                              </span>
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() => handleRequestOtp()}
                            disabled={loadingOtpRequest}
                            className='py-2 px-4 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors'
                          >
                            Resend Code
                          </button>
                          <button
                            type='button'
                            onClick={handleCancelUpdate}
                            className='py-2 px-4 rounded-lg font-medium border border-red-800 text-red-300 hover:bg-red-900 transition-colors'
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer action buttons */}
              <div className='mt-8 flex flex-wrap gap-4'>
                <button
                  type='submit'
                  disabled={
                    isLoading ||
                    !hasChanges() ||
                    (newEmail !== userInfo.email &&
                      (!profileState.otpVerified ||
                        profileState.currentUpdateType !== 'email')) ||
                    (password &&
                      (!profileState.otpVerified ||
                        profileState.currentUpdateType !== 'password'))
                  }
                  className='py-4 px-10 rounded-lg text-lg font-bold bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {isLoading ? (
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
