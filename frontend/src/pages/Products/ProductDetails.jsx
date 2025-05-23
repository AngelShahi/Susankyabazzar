import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../../redux/api/productApiSlice'
import { useAddToCartMutation } from '../../redux/features/cart/cartApiSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
  FaArrowLeft,
  FaPercentage,
  FaRegClock,
} from 'react-icons/fa'
import moment from 'moment'
import HeartIcon from './HeartIcon'
import Ratings from './Ratings'
import ProductTabs from './ProductTabs'

const ProductDetails = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId)

  const { userInfo } = useSelector((state) => state.auth)

  // Use the addToCart mutation from the API
  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation()

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation()

  // Check if product has an active discount
  const hasDiscount =
    product &&
    product.discount &&
    new Date(product.discount.endDate) >= new Date()

  // Calculate the discounted price if there's an active discount
  const discountedPrice = hasDiscount
    ? product.price - product.price * (product.discount.percentage / 100)
    : null

  // Format time remaining for discount (if applicable)
  const formatTimeRemaining = (endDate) => {
    const end = moment(endDate)
    const now = moment()
    const diff = end.diff(now)

    if (diff <= 0) return 'Expired'

    const duration = moment.duration(diff)
    const days = Math.floor(duration.asDays())
    const hours = duration.hours()

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hr${
        hours !== 1 ? 's' : ''
      }`
    } else {
      const minutes = duration.minutes()
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${
        minutes !== 1 ? 's' : ''
      }`
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap()
      refetch()
      toast.success('Review created successfully')
      // Reset form fields after successful submission
      setRating(0)
      setComment('')
    } catch (error) {
      // Display the error message from the API
      const errorMessage =
        error?.data?.error ||
        error?.data ||
        error.message ||
        'Error submitting review'
      toast.error(errorMessage)
    }
  }

  const addToCartHandler = async () => {
    if (!userInfo) {
      navigate('/login?redirect=/cart')
      return
    }

    try {
      await addToCartApi({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: hasDiscount ? discountedPrice : product.price, // Use discounted price if available
        qty,
        product: product._id,
        countInStock: product.quantity,
        discount: hasDiscount ? product.discount : null, // Pass discount info to cart
      }).unwrap()

      toast.success(`Added ${product.name} to your cart`)
      navigate('/cart')
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.data ||
        error.message ||
        'Error adding to cart'
      toast.error(errorMessage)
    }
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-200'>
      <div className='container mx-auto px-4 py-12 max-w-7xl'>
        <div className='mb-8'>
          <Link
            to='/'
            className='text-[rgb(211,190,249)] font-medium hover:text-white flex items-center transition-colors group'
          >
            <FaArrowLeft className='mr-2 group-hover:-translate-x-1 transition-transform duration-300' />{' '}
            Back to Shop
          </Link>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[rgb(211,190,249)]'></div>
            <span className='ml-4 text-[rgb(211,190,249)] font-medium'>
              Loading product details...
            </span>
          </div>
        ) : error ? (
          <div className='bg-[rgba(211,190,249,0.1)] border-l-4 border-red-400 text-gray-200 p-6 my-6 rounded-r shadow-lg'>
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
              <p>{error?.data?.message || error.message}</p>
            </div>
          </div>
        ) : (
          <>
            <div className='flex flex-col lg:flex-row gap-10 mb-16'>
              {/* Product Image Section */}
              <div className='lg:w-1/2 relative'>
                <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg overflow-hidden border border-gray-800'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-auto object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-[rgba(7,10,19,0.4)] to-transparent pointer-events-none'></div>

                  {/* Discount badge - show if there's an active discount */}
                  {hasDiscount && (
                    <div className='absolute top-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center'>
                      <FaPercentage className='mr-2' />
                      <span className='font-bold text-lg'>
                        {product.discount.percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <div className='absolute top-4 right-4'>
                  <HeartIcon product={product} />
                </div>
              </div>

              {/* Product Details Section */}
              <div className='lg:w-1/2 flex flex-col justify-between'>
                <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg p-8 mb-6 border border-gray-800'>
                  <h2 className='text-3xl font-semibold text-white mb-4'>
                    {product.name}
                  </h2>
                  <div className='mb-6'>
                    <Ratings
                      value={product.rating}
                      text={`${product.numReviews} reviews`}
                    />
                  </div>

                  {/* Price display with discount if applicable */}
                  <div className='flex items-center mb-8'>
                    {hasDiscount ? (
                      <div>
                        <div className='flex items-center'>
                          <p className='text-4xl font-bold text-green-400'>
                            ₨ {discountedPrice}
                          </p>
                          <p className='ml-3 text-xl text-gray-400 line-through'>
                            ₨ {product.price}
                          </p>
                        </div>
                        <div className='mt-2 flex items-center text-sm text-green-400'>
                          <FaRegClock className='mr-1' />
                          <span>
                            Offer ends in{' '}
                            {formatTimeRemaining(product.discount.endDate)}
                            {product.discount.name &&
                              ` • ${product.discount.name}`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className='text-4xl font-bold text-white'>
                        ₨ {product.price}
                      </p>
                    )}

                    {product.quantity > 0 ? (
                      <span className='ml-4 px-3 py-1 bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] text-sm font-medium rounded-full'>
                        In Stock
                      </span>
                    ) : (
                      <span className='ml-4 px-3 py-1 bg-[rgba(255,82,82,0.15)] text-red-400 text-sm font-medium rounded-full'>
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <p className='text-gray-300 mb-8 leading-relaxed'>
                    {product.description}
                  </p>

                  {/* Product Information Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 border-t border-b border-gray-700 py-8'>
                    <div className='flex items-center'>
                      <div className='mr-4 w-10 h-10 rounded-lg bg-[rgba(211,190,249,0.1)] flex items-center justify-center text-[rgb(211,190,249)]'>
                        <FaStore />
                      </div>
                      <div>
                        <span className='text-gray-400 text-sm'>Brand</span>
                        <p className='text-white font-medium'>
                          {product.brand}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='mr-4 w-10 h-10 rounded-lg bg-[rgba(211,190,249,0.1)] flex items-center justify-center text-[rgb(211,190,249)]'>
                        <FaClock />
                      </div>
                      <div>
                        <span className='text-gray-400 text-sm'>Added</span>
                        <p className='text-white font-medium'>
                          {moment(product.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='mr-4 w-10 h-10 rounded-lg bg-[rgba(211,190,249,0.1)] flex items-center justify-center text-[rgb(211,190,249)]'>
                        <FaStar />
                      </div>
                      <div>
                        <span className='text-gray-400 text-sm'>Reviews</span>
                        <p className='text-white font-medium'>
                          {product.numReviews}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='mr-4 w-10 h-10 rounded-lg bg-[rgba(211,190,249,0.1)] flex items-center justify-center text-[rgb(211,190,249)]'>
                        <FaBox />
                      </div>
                      <div>
                        <span className='text-gray-400 text-sm'>
                          Availability
                        </span>
                        <p className='text-white font-medium'>
                          {product.quantity > 0
                            ? `${product.quantity} in stock`
                            : 'Out of Stock'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Section */}
                  <div className='flex flex-wrap items-center gap-4'>
                    {product.quantity > 0 && (
                      <div className='w-24'>
                        <select
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                          className='w-full p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] focus:border-transparent'
                        >
                          {[
                            ...Array(Math.min(product.quantity, 20)).keys(),
                          ].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={addToCartHandler}
                      disabled={product.quantity === 0 || isAddingToCart}
                      className={`flex-1 py-4 px-6 rounded-lg font-medium text-white flex items-center justify-center ${
                        product.quantity === 0 || isAddingToCart
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-opacity-90 shadow-lg hover:shadow-[0_0_15px_rgba(211,190,249,0.4)] transition-all duration-300'
                      }`}
                    >
                      {isAddingToCart ? (
                        <span className='flex items-center justify-center'>
                          <svg
                            className='animate-spin -ml-1 mr-3 h-5 w-5'
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
                          Adding to Cart...
                        </span>
                      ) : product.quantity === 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <FaShoppingCart className='mr-2' /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Tabs Section */}
            <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg mb-12 border border-gray-800'>
              <ProductTabs
                loadingProductReview={loadingProductReview}
                userInfo={userInfo}
                submitHandler={submitHandler}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                product={product}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
