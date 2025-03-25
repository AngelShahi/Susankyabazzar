import { Link } from 'react-router-dom'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { toast } from 'react-toastify'
import HeartIcon from './HeartIcon'

const ProductCard = ({ p }) => {
  const dispatch = useDispatch()

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }))
    // Fix for toast configuration
    toast.success('Item added successfully', {
      position: 'top-right', // Changed from toast.POSITION.TOP_RIGHT
      autoClose: 2000,
    })
  }

  return (
    <div className='w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow transition-transform hover:scale-105 hover:shadow-lg'>
      <section className='relative'>
        <Link to={`/product/${p._id}`}>
          <span className='absolute bottom-3 right-3 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
            {p?.brand}
          </span>
          <img
            className='rounded-t-lg w-full h-48 object-cover'
            src={p.image}
            alt={p.name}
          />
        </Link>
        <div className='absolute top-3 right-3'>
          <HeartIcon product={p} />
        </div>
      </section>

      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h5 className='text-lg font-medium text-gray-800 line-clamp-2'>
            {p?.name}
          </h5>
          <p className='font-bold text-gray-700 ml-2'>
            {p?.price?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </div>

        <p className='mb-3 text-sm text-gray-600 line-clamp-2'>
          {p?.description}
        </p>

        <div className='flex justify-between items-center mt-4'>
          <Link
            to={`/product/${p._id}`}
            className='px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 transition-colors'
          >
            View Details
            <svg
              className='w-3.5 h-3.5 ml-2 inline'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 14 10'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M1 5h12m0 0L9 1m4 4L9 9'
              />
            </svg>
          </Link>

          <button
            className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors'
            onClick={() => addToCartHandler(p, 1)}
            aria-label='Add to cart'
          >
            <AiOutlineShoppingCart size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
