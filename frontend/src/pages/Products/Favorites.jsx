// components/favorites/Favorites.jsx
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
      <div className='flex justify-center items-center py-8 ml-[10rem]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600'></div>
        <span className='ml-2'>Loading your favorites...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 ml-[13rem]'>
        <p>{error?.data?.message || 'Error loading favorites'}</p>
      </div>
    )
  }

  return (
    <div className='ml-[10rem]'>
      <h1 className='text-lg font-bold ml-[3rem] mt-[3rem]'>
        FAVORITE PRODUCTS
      </h1>

      <div className='flex flex-wrap gap-6'>
        {favorites.length > 0 ? (
          favorites.map((product) => (
            <Product key={product._id} product={product} />
          ))
        ) : (
          <p className='text-gray-500 ml-[3rem]'>No favorite products yet.</p>
        )}
      </div>
    </div>
  )
}

export default Favorites
