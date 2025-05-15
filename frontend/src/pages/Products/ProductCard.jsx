import { Link } from 'react-router-dom'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { FaPercentage } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import HeartIcon from './HeartIcon'
import {
  useAddToCartMutation,
  useGetCartQuery,
} from '../../redux/features/cart/cartApiSlice'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setCart } from '../../redux/features/cart/cartSlice'

const ProductCard = ({ p }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.auth)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [addToCartApi] = useAddToCartMutation()
  const { data: cartData, refetch } = useGetCartQuery()

  // Check if product has an active discount
  const hasDiscount = p.discount && new Date(p.discount.endDate) >= new Date()
  // Calculate the discounted price if there's an active discount
  const discountedPrice = hasDiscount
    ? p.price - p.price * (p.discount.percentage / 100)
    : null

  const addToCartHandler = async (product, qty) => {
    if (product.quantity <= 0) {
      toast.error('This item is currently out of stock', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    if (!userInfo) {
      navigate('/login')
      return
    }

    try {
      setIsAddingToCart(true)
      await addToCartApi({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: hasDiscount ? discountedPrice : product.price,
        qty,
        product: product._id,
        countInStock: product.quantity,
        discount: hasDiscount ? product.discount : null,
      }).unwrap()

      const updatedCartData = await refetch().unwrap()
      if (updatedCartData) {
        dispatch(setCart(updatedCartData))
      }

      toast.success('Item added successfully', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      toast.error('Failed to add item to cart', {
        position: 'top-right',
        autoClose: 2000,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div
      className='w-full max-w-sm bg-[rgb(7,10,19)] border border-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[rgba(211,190,249,0.15)] hover:border-[rgb(211,190,249,0.5)]'
      style={{ height: '480px', display: 'flex', flexDirection: 'column' }}
    >
      <section className='relative' style={{ height: '240px', flex: 'none' }}>
        <Link to={`/product/${p._id}`}>
          {/* Stock indicator badge */}
          {p.quantity <= 0 && (
            <span className='absolute top-3 left-3 bg-red-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10'>
              Out of Stock
            </span>
          )}
          {p.quantity > 0 && p.quantity <= 5 && (
            <span className='absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10'>
              Low Stock: {p.quantity} left
            </span>
          )}

          {/* Discount badge - show if there's an active discount */}
          {hasDiscount && (
            <span className='absolute top-3 left-3 ml-20 bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full z-10 flex items-center'>
              <FaPercentage size={12} className='mr-1' />
              {p.discount.percentage}% OFF
            </span>
          )}

          <span className='absolute bottom-3 right-3 bg-[rgba(211,190,249,0.3)] text-[rgb(211,190,249)] text-xs font-medium px-2.5 py-0.5 rounded-full'>
            {p?.brand}
          </span>
          <div
            className='overflow-hidden'
            style={{ height: '240px', width: '100%' }}
          >
            <img
              className='rounded-t-lg w-full h-full object-cover'
              src={p.image}
              alt={p.name}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-[rgba(7,10,19,0.7)] to-transparent opacity-70'></div>
          </div>
        </Link>
        <div className='absolute top-3 right-3'>
          <HeartIcon product={p} />
        </div>
      </section>

      <div
        className='p-5'
        style={{ flex: '1', display: 'flex', flexDirection: 'column' }}
      >
        <div className='flex justify-between items-start mb-3'>
          <h5 className='text-lg font-medium text-gray-100 line-clamp-2 group-hover:text-[rgb(211,190,249)]'>
            {p?.name}
          </h5>
          <div className='ml-2 whitespace-nowrap text-right'>
            {hasDiscount ? (
              <>
                <p className='font-bold text-green-400'>
                  {discountedPrice?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
                <p className='text-gray-400 text-sm line-through'>
                  {p?.price?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </>
            ) : (
              <p className='font-bold text-[rgb(211,190,249)]'>
                {p?.price?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </p>
            )}
          </div>
        </div>

        <p className='mb-4 text-sm text-gray-400 line-clamp-2'>
          {p?.description}
        </p>

        <div className='flex justify-between items-center mt-auto'>
          <Link
            to={`/product/${p._id}`}
            className='px-4 py-2 text-sm font-medium text-[rgb(7,10,19)] bg-[rgb(211,190,249)] rounded-lg hover:bg-[rgba(211,190,249,0.85)] focus:ring-4 focus:outline-none focus:ring-[rgba(211,190,249,0.5)] transition-colors duration-300'
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
            className={`p-3 rounded-full transition-all duration-300 ${
              p.quantity <= 0
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-gray-700 text-gray-500 cursor-wait'
                : 'bg-[rgba(211,190,249,0.2)] hover:bg-[rgba(211,190,249,0.3)] text-[rgb(211,190,249)]'
            }`}
            onClick={() => addToCartHandler(p, 1)}
            disabled={p.quantity <= 0 || isAddingToCart}
            aria-label={p.quantity <= 0 ? 'Out of stock' : 'Add to cart'}
            title={p.quantity <= 0 ? 'Out of stock' : 'Add to cart'}
          >
            {isAddingToCart ? (
              <svg
                className='animate-spin h-5 w-5 text-[rgba(211,190,249,0.7)]'
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
