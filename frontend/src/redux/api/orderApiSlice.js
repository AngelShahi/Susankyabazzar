import { apiSlice } from './apiSlice'
import { ORDERS_URL } from '../constants'

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),

    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`,
    }),

    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`,
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`,
    }),
    // New mutation for uploading payment proof
    uploadPaymentProof: builder.mutation({
      query: ({ orderId, imageUrl }) => ({
        url: `${ORDERS_URL}/${orderId}/payment-proof`,
        method: 'PUT',
        body: { imageUrl },
      }),
    }),
    getPaymentStatus: builder.query({
      query: ({ orderId }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
      }),
    }),
    // Add this new mutation
    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
    }),

    initializeKhaltiPayment: builder.mutation({
      query: ({ orderId, website_url }) => ({
        url: `/api/orders/${orderId}/khalti/initialize`,
        method: 'POST',
        body: { website_url },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  // ------------------
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useUploadPaymentProofMutation,
  useCancelOrderMutation,

  useInitializeKhaltiPaymentMutation, // Export the new mutation
} = orderApiSlice
