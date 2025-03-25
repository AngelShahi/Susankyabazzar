import { useState } from 'react'
import { Link } from 'react-router-dom'
import Ratings from './Ratings'
import { useGetTopProductsQuery } from '../../redux/api/productApiSlice'
import SmallProduct from './SmallProduct'
import Loader from '../../components/Loader'

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

  return (
    <div className='w-full'>
      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='flex flex-wrap -mb-px'>
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 1
                ? 'border-gray-800 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabClick(1)}
          >
            Write Your Review
          </button>
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 2
                ? 'border-gray-800 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabClick(2)}
          >
            All Reviews ({product.reviews.length})
          </button>
          <button
            className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 3
                ? 'border-gray-800 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabClick(3)}
          >
            Related Products
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className='py-6'>
        {/* Write Review Tab */}
        {activeTab === 1 && (
          <div className='max-w-2xl'>
            {userInfo ? (
              <form onSubmit={submitHandler} className='space-y-6'>
                <div>
                  <label
                    htmlFor='rating'
                    className='block text-gray-700 font-medium mb-2'
                  >
                    Rating
                  </label>
                  <select
                    id='rating'
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800'
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
                    className='block text-gray-700 font-medium mb-2'
                  >
                    Comment
                  </label>
                  <textarea
                    id='comment'
                    rows='4'
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800'
                    placeholder='Share your thoughts about this product...'
                  ></textarea>
                </div>

                <button
                  type='submit'
                  disabled={loadingProductReview}
                  className={`px-5 py-3 rounded-lg font-medium text-white ${
                    loadingProductReview
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 transition-colors'
                  }`}
                >
                  {loadingProductReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
                <p className='text-gray-700'>
                  Please{' '}
                  <Link
                    to='/login'
                    className='text-gray-800 font-medium hover:underline'
                  >
                    sign in
                  </Link>{' '}
                  to write a review.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 2 && (
          <div className='space-y-6 max-w-4xl'>
            {product.reviews.length === 0 ? (
              <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
                <p className='text-gray-700'>
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            ) : (
              product.reviews.map((review) => (
                <div
                  key={review._id}
                  className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'
                >
                  <div className='flex flex-wrap justify-between items-center mb-3'>
                    <h4 className='font-medium text-gray-800'>{review.name}</h4>
                    <span className='text-sm text-gray-500'>
                      {review.createdAt.substring(0, 10)}
                    </span>
                  </div>
                  <Ratings value={review.rating} />
                  <p className='mt-4 text-gray-600'>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Related Products Tab */}
        {activeTab === 3 && (
          <div className='w-full overflow-x-auto'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 w-full'>
              {!data ? (
                <Loader />
              ) : (
                data.map((product) => (
                  <div key={product._id} className='w-full'>
                    <SmallProduct product={product} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs
