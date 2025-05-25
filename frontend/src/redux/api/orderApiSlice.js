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
      invalidatesTags: ['Orders', 'Sales'], // Invalidate orders and sales
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
      invalidatesTags: ['Orders', 'Sales', { type: 'Order', id: 'LIST' }], // Invalidate orders, sales, and order list
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
      providesTags: ['Orders'],
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Orders', { type: 'Order', id: 'LIST' }],
    }),

    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`,
      providesTags: ['Orders'], // Add Orders tag
    }),

    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`,
      providesTags: ['Sales'], // Add Sales tag
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`,
      providesTags: ['Sales'], // Add Sales tag
    }),

    uploadPaymentProof: builder.mutation({
      query: ({ orderId, imageUrl }) => ({
        url: `${ORDERS_URL}/${orderId}/payment-proof`,
        method: 'PUT',
        body: { imageUrl },
      }),
      invalidatesTags: ['Orders', 'Sales', { type: 'Order', id: 'LIST' }],
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
      invalidatesTags: ['Orders', 'Sales', { type: 'Order', id: 'LIST' }],
    }),

    initializeKhaltiPayment: builder.mutation({
      query: ({ orderId, website_url }) => ({
        url: `/api/orders/${orderId}/khalti/initialize`,
        method: 'POST',
        body: { website_url },
      }),
      invalidatesTags: ['Orders', 'Sales', { type: 'Order', id: 'LIST' }],
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
