import { apiSlice } from '../../api/apiSlice'
import { CARTS_URL } from '../../constants'

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({
        url: CARTS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: CARTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `${CARTS_URL}/item/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    saveShippingAddress: builder.mutation({
      query: (data) => ({
        url: `${CARTS_URL}/shipping`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    savePaymentMethod: builder.mutation({
      query: (data) => ({
        url: `${CARTS_URL}/payment`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: CARTS_URL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useSaveShippingAddressMutation,
  useSavePaymentMethodMutation,
  useClearCartMutation,
} = cartApiSlice
