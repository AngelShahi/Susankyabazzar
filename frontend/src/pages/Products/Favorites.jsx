import { useSelector } from 'react-redux'
import { selectFavoriteProduct } from '../../redux/features/favorites/favoriteSlice'
import Product from './Product'

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct) || [] // Ensure favorites is always an array

  return (
    <div className='ml-[10rem]'>
      <h1 className='text-lg font-bold ml-[3rem] mt-[3rem]'>
        FAVORITE PRODUCTS
      </h1>

      <div className='flex flex-wrap gap-6'>
        {' '}
        {/* Added gap between images */}
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
