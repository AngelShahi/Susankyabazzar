import { PRODUCT_URL, UPLOAD_URL } from '../constants'
import { apiSlice } from './apiSlice'

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ======================================
    // PRODUCT QUERIES
    // ======================================

    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1 } = {}) => ({
        url: PRODUCT_URL,
        params: { keyword, pageNumber },
      }),
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),

    getProductById: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
      ],
    }),

    getProductDetails: builder.query({
      query: (productId) => `${PRODUCT_URL}/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
      ],
      keepUnusedDataFor: 5,
    }),

    getAllProducts: builder.query({
      query: () => `${PRODUCT_URL}/allproducts`,
      providesTags: ['Products'],
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`,
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`,
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),

    getFilteredProducts: builder.query({
      query: ({ checked, radio }) => ({
        url: `${PRODUCT_URL}/filtered-products`,
        method: 'POST',
        body: { checked, radio },
      }),
      providesTags: ['Products'],
    }),

    // ======================================
    // PRODUCT MUTATIONS
    // ======================================

    createProduct: builder.mutation({
      query: (productData) => ({
        url: PRODUCT_URL,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Products',
      ],
      transformResponse: (response) => {
        if (response?.quantity) {
          response.quantity = Number(response.quantity)
        }
        return response
      },
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),

    // ======================================
    // MEDIA UPLOAD
    // ======================================

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: UPLOAD_URL,
        method: 'POST',
        body: data,
      }),
    }),

    // ======================================
    // REVIEWS
    // ======================================

    createReview: builder.mutation({
      query: ({ productId, ...reviewData }) => ({
        url: `${PRODUCT_URL}/${productId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
      ],
    }),

    // ======================================
    // DISCOUNT MANAGEMENT
    // ======================================

    applyDiscount: builder.mutation({
      query: ({ productId, ...discountData }) => ({
        url: `${PRODUCT_URL}/${productId}/discount`,
        method: 'PUT',
        body: discountData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Products',
      ],
    }),

    removeDiscount: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}/discount`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
        'Products',
      ],
    }),

    applyBulkDiscount: builder.mutation({
      query: (discountData) => ({
        url: `${PRODUCT_URL}/bulk-discount`,
        method: 'POST',
        body: discountData,
      }),
      invalidatesTags: ['Products'],
    }),

    // ======================================
    // CATEGORIES
    // ======================================

    getAllCategories: builder.query({
      query: () => '/api/category/categories',
      providesTags: ['Categories'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductDetailsQuery,
  useGetAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useGetFilteredProductsQuery,
  useApplyDiscountMutation,
  useRemoveDiscountMutation,
  useApplyBulkDiscountMutation,
  useGetAllCategoriesQuery,
} = productApiSlice
