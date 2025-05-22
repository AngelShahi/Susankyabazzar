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
      invalidatesTags: ['Orders'], // Invalidate orders list when a new order is created
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }], // Invalidate orders list and specific order
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      providesTags: ['Orders'],
      keepUnusedDataFor: 5,
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ['Orders'], // Tag the orders list
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }], // Invalidate orders list and specific order
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

    uploadPaymentProof: builder.mutation({
      query: ({ orderId, imageUrl }) => ({
        url: `${ORDERS_URL}/${orderId}/payment-proof`,
        method: 'PUT',
        body: { imageUrl },
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }], // Invalidate orders list and specific order
    }),

    getPaymentStatus: builder.query({
      query: ({ orderId }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
      }),
    }),

    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }], // Invalidate orders list and specific order
    }),

    initializeKhaltiPayment: builder.mutation({
      query: ({ orderId, website_url }) => ({
        url: `/api/orders/${orderId}/khalti/initialize`,
        method: 'POST',
        body: { website_url },
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useUploadPaymentProofMutation,
  useCancelOrderMutation,
  useInitializeKhaltiPaymentMutation,
} = orderApiSlice
