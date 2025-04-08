import { createSlice } from '@reduxjs/toolkit'

// Safely parse userInfo from localStorage
let userInfo = null
try {
  const stored = localStorage.getItem('userInfo')
  if (stored && stored !== 'undefined') {
    userInfo = JSON.parse(stored)
  }
} catch (error) {
  console.error('Error parsing userInfo from localStorage:', error)
}

const initialState = {
  userInfo,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
      localStorage.setItem('expirationTime', expirationTime)
    },
    logout: (state) => {
      state.userInfo = null
      localStorage.clear()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

// ✅ Add this selector
export const selectCurrentUser = (state) => state.auth.userInfo

export default authSlice.reducer
