import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../../redux/api/productApiSlice'
import Rating from './Rating'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { FaBox, FaClock, FaShoppingCart, FaStar, FaStore } from 'react-icons/fa'
import moment from 'moment'

const Product = () => {
  const { id: productId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation()

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }))
    navigate('/cart')
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
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <>
      <div>
        <Link className='text-black font-semibold hover:underline ml-40' to='/'>
          Go Back
        </Link>
      </div>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className='flex flex-wrap relative items-between mt-8 ml-40'>
            <div>
              <img
                src={product.image}
                alt={product.name}
                className='w-full xl:w-96 lg:w-80 md:w-60 sm:w-40 mr-8'
              />
              <HeartIcon product={product} />
            </div>
            <div className='flex flex-col justify-between'>
              <h2 className='text-2xl font-semibold text-black'>
                {product.name}
              </h2>
              <p className='my-4 xl:w-96 lg:w-80 md:w-60 text-gray-700'>
                {product.description}
              </p>
              <p className='text-5xl my-4 font-extrabold text-black'>
                ₨ {product.price}
              </p>
              <div className='flex items-center justify-between w-80'>
                <div>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaStore className='mr-2 text-gray-700' /> Brand:{' '}
                    {product.brand}
                  </h1>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaClock className='mr-2 text-gray-700' /> Added:{' '}
                    {moment(product.createdAt).fromNow()}
                  </h1>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaStar className='mr-2 text-gray-700' /> Reviews:{' '}
                    {product.numReviews}
                  </h1>
                </div>
                <div>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaStar className='mr-2 text-gray-700' /> Ratings: {rating}
                  </h1>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaShoppingCart className='mr-2 text-gray-700' /> Quantity:{' '}
                    {product.quantity}
                  </h1>
                  <h1 className='flex items-center mb-6 text-gray-800'>
                    <FaBox className='mr-2 text-gray-700' /> In Stock:{' '}
                    {product.countInStock}
                  </h1>
                </div>
              </div>
              <div className='flex justify-between flex-wrap'>
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                />
                {product.countInStock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className='p-2 w-24 rounded-lg text-black'
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className='bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 md:mt-0 hover:bg-blue-700'
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
          <div className='mt-20 container flex flex-wrap items-start justify-between ml-40'>
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
    </>
  )
}

export default Product
