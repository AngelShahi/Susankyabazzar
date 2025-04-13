import { Link } from 'react-router-dom'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import HeartIcon from './HeartIcon'
import { useAddToCartMutation } from '../../redux/features/cart/cartApiSlice'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ProductCard = ({ p }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.auth)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [addToCartApi] = useAddToCartMutation()

  const addToCartHandler = async (product, qty) => {
    // Check if product is out of stock
    if (product.quantity <= 0) {
      toast.error('This item is currently out of stock', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!userInfo) {
      // If user is not logged in, redirect to login
      navigate('/login')
      return
    }

    try {
      setIsAddingToCart(true)
      await addToCartApi({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty,
        product: product._id,
        countInStock: product.quantity, // Using quantity as countInStock
      })

      toast.success('Item added successfully', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      toast.error('Failed to add item to cart', {
        position: 'top-right',
        autoClose: 2000,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className='w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow transition-transform hover:scale-105 hover:shadow-lg'>
      <section className='relative'>
        <Link to={`/product/${p._id}`}>
          {/* Stock indicator badge */}
          {p.quantity <= 0 && (
            <span className='absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10'>
              Out of Stock
            </span>
          )}
          {p.quantity > 0 && p.quantity <= 5 && (
            <span className='absolute top-3 left-3 bg-yellow-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10'>
              Low Stock: {p.quantity} left
            </span>
          )}

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

          {/* Conditional rendering of Add to Cart button based on stock */}
          <button
            className={`p-2 rounded-full ${
              p.quantity <= 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-gray-300 text-gray-500 cursor-wait'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors'
            }`}
            onClick={() => addToCartHandler(p, 1)}
            disabled={p.quantity <= 0 || isAddingToCart}
            aria-label={p.quantity <= 0 ? 'Out of stock' : 'Add to cart'}
            title={p.quantity <= 0 ? 'Out of stock' : 'Add to cart'}
          >
            {isAddingToCart ? (
              <svg
                className='animate-spin h-5 w-5 text-gray-500'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            ) : (
              <AiOutlineShoppingCart size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
