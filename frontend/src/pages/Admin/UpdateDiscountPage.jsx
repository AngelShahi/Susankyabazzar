import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaPercentage,
  FaCalendarAlt,
  FaTags,
  FaArrowLeft,
} from 'react-icons/fa'
import {
  useApplyDiscountMutation,
  useGetProductDetailsQuery,
} from '../../redux/api/productApiSlice'
import Loader from '../../components/Loader'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const UpdateDiscountPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()

  // State for the form
  const [percentage, setPercentage] = useState(15)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30))
  )
  const [name, setName] = useState('Special Offer')

  // Fetch product details
  const { data: productDetails, isLoading: productLoading } =
    useGetProductDetailsQuery(productId)

  // Mutation
  const [applyDiscount, { isLoading: isUpdating }] = useApplyDiscountMutation()

  // Set initial values from product details
  useEffect(() => {
    if (productDetails && productDetails.discount) {
      setName(productDetails.discount.name)
      setPercentage(productDetails.discount.percentage)
      setStartDate(new Date(productDetails.discount.startDate))
      setEndDate(new Date(productDetails.discount.endDate))
    }
  }, [productDetails])

  // Handle form submission
  const handleUpdateDiscount = async (e) => {
    e.preventDefault()

    if (percentage < 1 || percentage > 100) {
      toast.error('Discount percentage must be between 1 and 100')
      return
    }

    if (startDate >= endDate) {
      toast.error('End date must be after start date')
      return
    }

    try {
      const discountData = {
        productId,
        percentage,
        startDate,
        endDate,
        name,
      }

      await applyDiscount(discountData).unwrap()
      toast.success('Discount updated successfully')
      navigate('/admin/discounts')
    } catch (error) {
      console.error('Failed to update discount:', error)
      toast.error(error?.data?.error || 'Failed to update discount')
    }
  }

  if (productLoading) {
    return <Loader />
  }

  return (
    <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg p-8 max-w-6xl mx-auto my-10 border border-gray-800'>
      <div className='flex items-center mb-6'>
        <h2 className='text-3xl font-bold text-white'>Update Discount</h2>
      </div>

      {productDetails && (
        <div className='mb-6 p-4 bg-[rgb(7,10,19)] rounded-lg border border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Product Details
          </h3>
          <div className='flex items-center'>
            <img
              src={productDetails.image}
              alt={productDetails.name}
              className='w-16 h-16 rounded-md object-cover mr-4'
            />
            <div>
              <p className='text-white'>{productDetails.name}</p>
              <p className='text-gray-300'>Brand: {productDetails.brand}</p>
              <p className='text-gray-300'>
                Price: ${productDetails.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdateDiscount}>
        {/* Discount Name */}
        <div className='mb-6'>
          <label className='block text-gray-300 mb-2 font-medium'>
            Discount Name
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
            placeholder='E.g., Summer Sale'
            required
          />
        </div>

        {/* Discount Percentage */}
        <div className='mb-6'>
          <label className='block text-gray-300 mb-2 font-medium'>
            <FaPercentage className='inline mr-2' />
            Discount Percentage
          </label>
          <div className='flex items-center'>
            <input
              type='number'
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className='w-24 p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
              min='1'
              max='100'
              required
            />
            <span className='ml-2 text-xl text-white'>%</span>
          </div>
        </div>

        {/* Date Range */}
        <div className='mb-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-gray-300 mb-2 font-medium'>
              <FaCalendarAlt className='inline mr-2' />
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className='w-full p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
              minDate={new Date()}
              required
            />
          </div>
          <div>
            <label className='block text-gray-300 mb-2 font-medium'>
              <FaCalendarAlt className='inline mr-2' />
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className='w-full p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex space-x-4'>
          <button
            type='submit'
            disabled={isUpdating}
            className='flex-1 py-4 bg-[rgb(211,190,249)] text-[rgb(7,10,19)] font-medium rounded-lg hover:bg-opacity-90 transition-all'
          >
            {isUpdating ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-[rgb(7,10,19)]'
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
                Updating...
              </span>
            ) : (
              'Update Discount'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateDiscountPage
