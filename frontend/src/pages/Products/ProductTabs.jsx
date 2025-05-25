import { useState } from 'react'
import { Link } from 'react-router-dom'
import Ratings from './Ratings'
import { useGetTopProductsQuery } from '../../redux/api/productApiSlice'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopProductsQuery()

  const [activeTab, setActiveTab] = useState(1)

  if (isLoading) {
    return <Loader />
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber)
  }

  // Check if the current user has already reviewed this product
  const hasUserReviewed =
    userInfo &&
    product.reviews.some(
      (review) =>
        review.user === userInfo._id || review.user?._id === userInfo._id
    )

  return (
    <div className='w-full bg-[rgb(7,10,19)] text-gray-200 rounded-lg shadow-xl p-6'>
      {/* Tab Navigation */}
      <div className='border-b border-gray-700'>
        <nav className='flex flex-wrap -mb-px'>
          <button
            className={`mr-6 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 1
                ? 'border-[rgb(211,190,249)] text-[rgb(211,190,249)]'
                : 'border-transparent text-gray-400 hover:text-[rgb(211,190,249)] hover:border-gray-600'
            }`}
            onClick={() => handleTabClick(1)}
          >
            Write Your Review
          </button>
          <button
            className={`mr-6 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 2
                ? 'border-[rgb(211,190,249)] text-[rgb(211,190,249)]'
                : 'border-transparent text-gray-400 hover:text-[rgb(211,190,249)] hover:border-gray-600'
            }`}
            onClick={() => handleTabClick(2)}
          >
            All Reviews ({product.reviews.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className='py-8'>
        {/* Write Review Tab */}
        {activeTab === 1 && (
          <div className='max-w-2xl'>
            {!userInfo ? (
              <div className='bg-[rgba(211,190,249,0.1)] p-6 rounded-lg border border-[rgba(211,190,249,0.3)]'>
                <p className='text-gray-300'>
                  Please{' '}
                  <Link
                    to='/login'
                    className='text-[rgb(211,190,249)] font-medium hover:underline'
                  >
                    sign in
                  </Link>{' '}
                  to write a review.
                </p>
              </div>
            ) : hasUserReviewed ? (
              <div className='bg-[rgba(211,190,249,0.1)] p-6 rounded-lg border border-[rgba(211,190,249,0.3)]'>
                <p className='text-gray-300'>
                  You have already submitted a review for this product. Thank
                  you for your feedback!
                </p>
              </div>
            ) : (
              <form onSubmit={submitHandler} className='space-y-6'>
                <div>
                  <label
                    htmlFor='rating'
                    className='block text-gray-300 font-medium mb-2'
                  >
                    Rating
                  </label>
                  <select
                    id='rating'
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className='w-full p-3 border border-gray-700 rounded-lg bg-[rgba(7,10,19,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] text-gray-200'
                  >
                    <option value=''>Select a rating</option>
                    <option value='1'>1 - Inferior</option>
                    <option value='2'>2 - Decent</option>
                    <option value='3'>3 - Great</option>
                    <option value='4'>4 - Excellent</option>
                    <option value='5'>5 - Exceptional</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='comment'
                    className='block text-gray-300 font-medium mb-2'
                  >
                    Comment
                  </label>
                  <textarea
                    id='comment'
                    rows='4'
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='w-full p-3 border border-gray-700 rounded-lg bg-[rgba(7,10,19,0.8)] focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] text-gray-200'
                    placeholder='Share your thoughts about this product...'
                  ></textarea>
                </div>

                <button
                  type='submit'
                  disabled={loadingProductReview}
                  className={`px-5 py-3 rounded-lg font-medium text-[rgb(7,10,19)] ${
                    loadingProductReview
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[rgb(211,190,249)] hover:bg-[rgba(211,190,249,0.8)] transition-colors'
                  }`}
                >
                  {loadingProductReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 2 && (
          <div className='space-y-6 max-w-4xl'>
            {product.reviews.length === 0 ? (
              <div className='bg-[rgba(211,190,249,0.1)] p-6 rounded-lg border border-[rgba(211,190,249,0.3)]'>
                <p className='text-gray-300'>
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            ) : (
              product.reviews.map((review) => (
                <div
                  key={review._id}
                  className='bg-[rgba(7,10,19,0.7)] p-6 rounded-lg border border-gray-700 shadow-md hover:shadow-[rgb(211,190,249,0.1)] transition-shadow'
                >
                  <div className='flex flex-wrap justify-between items-center mb-3'>
                    <h4 className='font-medium text-[rgb(211,190,249)]'>
                      {review.name}
                    </h4>
                    <span className='text-sm text-gray-400'>
                      {review.createdAt.substring(0, 10)}
                    </span>
                  </div>
                  <Ratings value={review.rating} />
                  <p className='mt-4 text-gray-300'>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs
