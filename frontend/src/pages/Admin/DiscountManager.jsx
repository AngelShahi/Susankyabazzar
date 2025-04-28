import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaPercentage, FaCalendarAlt, FaTags, FaStore } from 'react-icons/fa'
import {
  useApplyDiscountMutation,
  useApplyBulkDiscountMutation,
  useAllProductsQuery,
  useAllCategoriesQuery,
} from '../../redux/api/productApiSlice'
import Loader from '../../components/Loader'
import DatePicker from 'react-datepicker' // You'll need to install this package
import 'react-datepicker/dist/react-datepicker.css'

const DiscountManager = () => {
  // State for the form
  const [discountType, setDiscountType] = useState('specific') // 'specific', 'category', 'brand'
  const [percentage, setPercentage] = useState(15)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30))
  )
  const [name, setName] = useState('Special Offer')
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])

  // Fetch all products for selection
  const { data: allProducts, isLoading: productsLoading } =
    useAllProductsQuery()
  const { data: allCategories, isLoading: categoriesLoading } =
    useAllCategoriesQuery()

  // Get all available brands from the products
  const [availableBrands, setAvailableBrands] = useState([])

  useEffect(() => {
    if (allProducts) {
      const brands = [...new Set(allProducts.map((p) => p.brand))]
      setAvailableBrands(brands)
    }
  }, [allProducts])

  // Mutations
  const [applyBulkDiscount, { isLoading: isApplying }] =
    useApplyBulkDiscountMutation()

  // Handle discount application
  const handleApplyDiscount = async (e) => {
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
      let discountData = {
        percentage,
        startDate,
        endDate,
        name,
      }

      // Add specific selection criteria based on discount type
      if (discountType === 'specific') {
        if (selectedProductIds.length === 0) {
          toast.error('Please select at least one product')
          return
        }
        discountData.productIds = selectedProductIds
      } else if (discountType === 'category') {
        if (selectedCategoryIds.length === 0) {
          toast.error('Please select at least one category')
          return
        }
        discountData.categoryIds = selectedCategoryIds
      } else if (discountType === 'brand') {
        if (selectedBrands.length === 0) {
          toast.error('Please select at least one brand')
          return
        }
        discountData.brandNames = selectedBrands
      }

      const result = await applyBulkDiscount(discountData).unwrap()
      toast.success(result.message)
    } catch (error) {
      console.error('Failed to apply discount:', error)
      toast.error(error?.data?.error || 'Failed to apply discount')
    }
  }

  // Handle product selection
  const handleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Handle category selection
  const handleCategorySelection = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Handle brand selection
  const handleBrandSelection = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  if (productsLoading || categoriesLoading) {
    return <Loader />
  }

  return (
    <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-10 border border-gray-800'>
      <h2 className='text-3xl font-bold text-white mb-6'>Discount Manager</h2>

      <form onSubmit={handleApplyDiscount}>
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
            placeholder='E.g., Dashain Discount'
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

        {/* Discount Type Selection */}
        <div className='mb-6'>
          <label className='block text-gray-300 mb-2 font-medium'>
            Apply Discount To:
          </label>
          <div className='grid grid-cols-3 gap-3'>
            <button
              type='button'
              onClick={() => setDiscountType('specific')}
              className={`p-3 rounded-lg flex flex-col items-center justify-center transition-colors ${
                discountType === 'specific'
                  ? 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)]'
                  : 'bg-[rgba(211,190,249,0.1)] text-[rgb(211,190,249)]'
              }`}
            >
              <FaTags size={20} className='mb-2' />
              <span>Specific Products</span>
            </button>
            <button
              type='button'
              onClick={() => setDiscountType('category')}
              className={`p-3 rounded-lg flex flex-col items-center justify-center transition-colors ${
                discountType === 'category'
                  ? 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)]'
                  : 'bg-[rgba(211,190,249,0.1)] text-[rgb(211,190,249)]'
              }`}
            >
              <FaStore size={20} className='mb-2' />
              <span>Categories</span>
            </button>
            <button
              type='button'
              onClick={() => setDiscountType('brand')}
              className={`p-3 rounded-lg flex flex-col items-center justify-center transition-colors ${
                discountType === 'brand'
                  ? 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)]'
                  : 'bg-[rgba(211,190,249,0.1)] text-[rgb(211,190,249)]'
              }`}
            >
              <FaStore size={20} className='mb-2' />
              <span>Brands</span>
            </button>
          </div>
        </div>

        {/* Selection Area based on discount type */}
        <div className='mb-6'>
          {discountType === 'specific' && (
            <div>
              <label className='block text-gray-300 mb-2 font-medium'>
                Select Products:
              </label>
              <div className='max-h-64 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {allProducts && allProducts.length > 0 ? (
                  allProducts.map((product) => (
                    <div key={product._id} className='flex items-center mb-2'>
                      <input
                        type='checkbox'
                        id={`product-${product._id}`}
                        checked={selectedProductIds.includes(product._id)}
                        onChange={() => handleProductSelection(product._id)}
                        className='mr-2 h-5 w-5 text-[rgb(211,190,249)]'
                      />
                      <label
                        htmlFor={`product-${product._id}`}
                        className='text-white cursor-pointer'
                      >
                        {product.name} - ${product.price.toFixed(2)}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-400'>No products available</p>
                )}
              </div>
            </div>
          )}

          {discountType === 'category' && (
            <div>
              <label className='block text-gray-300 mb-2 font-medium'>
                Select Categories:
              </label>
              <div className='max-h-64 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {allCategories && allCategories.length > 0 ? (
                  allCategories.map((category) => (
                    <div key={category._id} className='flex items-center mb-2'>
                      <input
                        type='checkbox'
                        id={`category-${category._id}`}
                        checked={selectedCategoryIds.includes(category._id)}
                        onChange={() => handleCategorySelection(category._id)}
                        className='mr-2 h-5 w-5 text-[rgb(211,190,249)]'
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className='text-white cursor-pointer'
                      >
                        {category.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-400'>No categories available</p>
                )}
              </div>
            </div>
          )}

          {discountType === 'brand' && (
            <div>
              <label className='block text-gray-300 mb-2 font-medium'>
                Select Brands:
              </label>
              <div className='max-h-64 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {availableBrands && availableBrands.length > 0 ? (
                  availableBrands.map((brand) => (
                    <div key={brand} className='flex items-center mb-2'>
                      <input
                        type='checkbox'
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandSelection(brand)}
                        className='mr-2 h-5 w-5 text-[rgb(211,190,249)]'
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className='text-white cursor-pointer'
                      >
                        {brand}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-400'>No brands available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isApplying}
          className='w-full py-4 bg-[rgb(211,190,249)] text-[rgb(7,10,19)] font-medium rounded-lg hover:bg-opacity-90 transition-all'
        >
          {isApplying ? (
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
              Applying Discount...
            </span>
          ) : (
            'Apply Discount'
          )}
        </button>
      </form>
    </div>
  )
}

export default DiscountManager
