import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectFavoriteProduct,
  setFavorites,
} from '../../redux/features/favorites/favoriteSlice'
import { useGetFavoritesQuery } from '../../redux/features/favorites/favoriteApiSlice'
import Product from './Product'

const Favorites = () => {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavoriteProduct) || []
  const { data, isLoading, isError, error } = useGetFavoritesQuery()

  useEffect(() => {
    if (data) {
      dispatch(setFavorites(data))
    }
  }, [data, dispatch])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12 ml-0 sm:ml-16 md:ml-40 h-64 bg-[rgb(7,10,19)] text-gray-200'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[rgb(211,190,249)]'></div>
          <span className='mt-4 text-[rgb(211,190,249)] font-medium'>
            Loading your favorites...
          </span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='bg-[rgba(211,190,249,0.1)] border-l-4 border-red-400 text-gray-200 p-6 my-6 ml-0 sm:ml-16 md:ml-40 rounded-r shadow-lg'>
        <div className='flex items-center'>
          <svg
            className='w-6 h-6 text-red-400 mr-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            ></path>
          </svg>
          <p className='font-medium'>
            {error?.data?.message || 'Error loading favorites'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-100 pt-8 pb-16 px-4 sm:px-8 ml-0 sm:ml-16 md:ml-40'>
      <div className='max-w-7xl mx-auto'>
        <div className='border-l-4 border-[rgb(211,190,249)] pl-4 mb-12'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-wide text-white'>
            FAVORITE PRODUCTS
          </h1>
          <div className='h-1 w-24 bg-[rgb(211,190,249)] mt-2 rounded opacity-75'></div>
        </div>

        {favorites.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {favorites.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-700 rounded-lg bg-[rgba(211,190,249,0.05)]'>
            <svg
              className='w-16 h-16 text-gray-500 mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              ></path>
            </svg>
            <p className='text-lg text-gray-400 mb-6'>
              No favorite products yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
