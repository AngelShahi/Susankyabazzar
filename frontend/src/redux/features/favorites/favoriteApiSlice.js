// redux/features/favorites/favoriteApiSlice.js
import { apiSlice } from '../../../redux/api/apiSlice'

const FAVORITES_URL = '/api/favorites'

export const favoriteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: () => ({
        url: FAVORITES_URL,
      }),
      providesTags: ['Favorites'],
    }),

    addToFavorites: builder.mutation({
      query: (productId) => ({
        url: FAVORITES_URL,
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Favorites'],
    }),

    removeFromFavorites: builder.mutation({
      query: (productId) => ({
        url: `${FAVORITES_URL}/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
})

export const {
  useGetFavoritesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = favoriteApiSlice
