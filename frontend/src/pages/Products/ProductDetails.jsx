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
        price: product.price,
        qty,
        product: product._id,
        countInStock: product.quantity,
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
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='mb-6'>
        <Link
          to='/'
          className='text-gray-600 font-medium hover:text-gray-900 flex items-center transition-colors'
        >
          <FaArrowLeft className='mr-2' /> Go Back
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          <div className='flex flex-col lg:flex-row gap-8 mb-12'>
            {/* Product Image Section */}
            <div className='lg:w-1/2 relative'>
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-auto object-cover'
                />
              </div>
              <div className='absolute top-4 right-4'>
                <HeartIcon product={product} />
              </div>
            </div>

            {/* Product Details Section */}
            <div className='lg:w-1/2 flex flex-col justify-between'>
              <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <h2 className='text-3xl font-semibold text-gray-800 mb-4'>
                  {product.name}
                </h2>
                <div className='mb-4'>
                  <Ratings
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </div>
                <p className='text-4xl font-bold text-gray-800 mb-6'>
                  ${product.price}
                </p>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  {product.description}
                </p>

                {/* Product Information Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 border-t border-b border-gray-200 py-6'>
                  <div className='flex items-center'>
                    <FaStore className='mr-3 text-gray-500' />
                    <div>
                      <span className='text-gray-500 text-sm'>Brand</span>
                      <p className='text-gray-800 font-medium'>
                        {product.brand}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FaClock className='mr-3 text-gray-500' />
                    <div>
                      <span className='text-gray-500 text-sm'>Added</span>
                      <p className='text-gray-800 font-medium'>
                        {moment(product.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FaStar className='mr-3 text-gray-500' />
                    <div>
                      <span className='text-gray-500 text-sm'>Reviews</span>
                      <p className='text-gray-800 font-medium'>
                        {product.numReviews}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <FaBox className='mr-3 text-gray-500' />
                    <div>
                      <span className='text-gray-500 text-sm'>
                        Availability
                      </span>
                      <p className='text-gray-800 font-medium'>
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
                        className='w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500'
                      >
                        {[...Array(Math.min(product.quantity, 20)).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={addToCartHandler}
                    disabled={product.quantity === 0 || isAddingToCart}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium text-white ${
                      product.quantity === 0 || isAddingToCart
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700 transition-colors'
                    }`}
                  >
                    {isAddingToCart ? (
                      <span className='flex items-center justify-center'>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                        Adding...
                      </span>
                    ) : product.quantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs Section */}
          <div className='bg-white rounded-lg shadow-sm mb-12'>
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
  )
}

export default ProductDetails
