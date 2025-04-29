import { apiSlice } from './apiSlice'
import { USERS_URL } from '../constants'

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/send-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
    }),
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    // Password reset endpoints
    requestPasswordResetOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyResetOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-reset-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: 'POST',
        body: data,
      }),
    }),
    // Profile update OTP endpoints
    requestProfileUpdateOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/request-profile-update-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    verifyProfileUpdateOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-profile-update-otp`,
        method: 'POST',
        body: data,
      }),
    }),
    // In userApiSlice.js, add this mutation
    notifyUserStatusChange: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/notify-status-change`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useProfileMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useVerifyOtpMutation,
  useRequestPasswordResetOtpMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useRequestProfileUpdateOtpMutation,
  useVerifyProfileUpdateOtpMutation,
  useNotifyUserStatusChangeMutation,
} = userApiSlice
