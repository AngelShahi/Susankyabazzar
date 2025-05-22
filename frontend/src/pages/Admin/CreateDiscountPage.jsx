import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
  FaPercentage,
  FaCalendarAlt,
  FaTags,
  FaStore,
  FaArrowLeft,
  FaSearch,
} from 'react-icons/fa'
import {
  useApplyBulkDiscountMutation,
  useGetAllCategoriesQuery,
  useGetAllProductsQuery,
} from '../../redux/api/productApiSlice'
import Loader from '../../components/Loader'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const CreateDiscountPage = () => {
  const navigate = useNavigate()

  // State for the form
  const [discountType, setDiscountType] = useState('specific')
  const [percentage, setPercentage] = useState(15)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30))
  )
  const [name, setName] = useState('Special Offer')
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])

  // Search and pagination state
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [brandSearchTerm, setBrandSearchTerm] = useState('')

  const [productCurrentPage, setProductCurrentPage] = useState(1)
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1)
  const [brandCurrentPage, setBrandCurrentPage] = useState(1)

  // Set items per page to 5 as requested
  const itemsPerPage = 5

  // Fetch data
  const { data: allCategories, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery()
  const { data: allProductsData, isLoading: productsLoading } =
    useGetAllProductsQuery()

  // Get all available brands from the products
  const [availableBrands, setAvailableBrands] = useState([])

  useEffect(() => {
    if (allProductsData) {
      const brands = [...new Set(allProductsData.map((p) => p.brand))]
      setAvailableBrands(brands)
    }
  }, [allProductsData])

  // Mutation
  const [applyBulkDiscount, { isLoading: isApplying }] =
    useApplyBulkDiscountMutation()

  // Filter products based on search term
  const filteredProducts = allProductsData
    ? allProductsData.filter((product) =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      )
    : []

  // Filter categories based on search term
  const filteredCategories = allCategories
    ? allCategories.filter((category) =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
      )
    : []

  // Filter brands based on search term
  const filteredBrands = availableBrands
    ? availableBrands.filter((brand) =>
        brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
      )
    : []

  // Pagination logic for products
  const indexOfLastProduct = productCurrentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  )
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Pagination logic for categories
  const indexOfLastCategory = categoryCurrentPage * itemsPerPage
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  )
  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage)

  // Pagination logic for brands
  const indexOfLastBrand = brandCurrentPage * itemsPerPage
  const indexOfFirstBrand = indexOfLastBrand - itemsPerPage
  const currentBrands = filteredBrands.slice(
    indexOfFirstBrand,
    indexOfLastBrand
  )
  const totalBrandPages = Math.ceil(filteredBrands.length / itemsPerPage)

  // Handle form submission
  const handleCreateDiscount = async (e) => {
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

      await applyBulkDiscount(discountData).unwrap()
      toast.success('Discount created successfully')
      navigate('/admin/DiscountListPage')
    } catch (error) {
      console.error('Failed to create discount:', error)
      toast.error(error?.data?.error || 'Failed to create discount')
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

  // Handle select all products on current page
  const handleSelectAllProductsOnPage = () => {
    const allSelected = currentProducts.every((product) =>
      selectedProductIds.includes(product._id)
    )

    if (allSelected) {
      // Deselect all on current page
      setSelectedProductIds((prev) =>
        prev.filter((id) => !currentProducts.map((p) => p._id).includes(id))
      )
    } else {
      // Select all on current page
      const newSelected = [
        ...new Set([
          ...selectedProductIds,
          ...currentProducts.map((product) => product._id),
        ]),
      ]
      setSelectedProductIds(newSelected)
    }
  }

  // Handle select all categories on current page
  const handleSelectAllCategoriesOnPage = () => {
    const allSelected = currentCategories.every((category) =>
      selectedCategoryIds.includes(category._id)
    )

    if (allSelected) {
      // Deselect all on current page
      setSelectedCategoryIds((prev) =>
        prev.filter((id) => !currentCategories.map((c) => c._id).includes(id))
      )
    } else {
      // Select all on current page
      const newSelected = [
        ...new Set([
          ...selectedCategoryIds,
          ...currentCategories.map((category) => category._id),
        ]),
      ]
      setSelectedCategoryIds(newSelected)
    }
  }

  // Handle select all brands on current page
  const handleSelectAllBrandsOnPage = () => {
    const allSelected = currentBrands.every((brand) =>
      selectedBrands.includes(brand)
    )

    if (allSelected) {
      // Deselect all on current page
      setSelectedBrands((prev) =>
        prev.filter((brand) => !currentBrands.includes(brand))
      )
    } else {
      // Select all on current page
      const newSelected = [...new Set([...selectedBrands, ...currentBrands])]
      setSelectedBrands(newSelected)
    }
  }

  // Pagination component
  const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
    return (
      <div className='flex justify-center mt-4'>
        <nav className='inline-flex rounded-md shadow'>
          <button
            type='button'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 rounded-l-md border border-gray-700 bg-[rgb(7,10,19)] text-white disabled:opacity-50'
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type='button'
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border-t border-b border-gray-700 ${
                currentPage === page
                  ? 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)]'
                  : 'bg-[rgb(7,10,19)] text-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type='button'
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className='px-3 py-1 rounded-r-md border border-gray-700 bg-[rgb(7,10,19)] text-white disabled:opacity-50'
          >
            Next
          </button>
        </nav>
      </div>
    )
  }

  if (categoriesLoading || productsLoading) {
    return <Loader />
  }

  return (
    <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg p-8 max-w-6xl mx-auto my-10 border border-gray-800'>
      <div className='flex items-center mb-6'>
        <button
          onClick={() => navigate('/admin/DiscountListPage')}
          className='mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors'
        >
          <FaArrowLeft className='text-white' />
        </button>
        <h2 className='text-3xl font-bold text-white'>Create New Discount</h2>
      </div>

      <form onSubmit={handleCreateDiscount}>
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
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-gray-300 font-medium'>
                  Select Products ({selectedProductIds.length} selected)
                </label>
                <div className='relative w-64'>
                  <input
                    type='text'
                    placeholder='Search products...'
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value)
                      setProductCurrentPage(1) // Reset to first page when searching
                    }}
                    className='w-full pl-10 pr-4 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
                  />
                  <FaSearch className='absolute left-3 top-3 text-gray-400' />
                </div>
              </div>

              <div className='max-h-96 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {filteredProducts.length > 0 ? (
                  <>
                    <div className='mb-3'>
                      <button
                        type='button'
                        onClick={handleSelectAllProductsOnPage}
                        className='text-sm text-[rgb(211,190,249)] hover:underline'
                      >
                        {currentProducts.every((product) =>
                          selectedProductIds.includes(product._id)
                        )
                          ? 'Deselect all on this page'
                          : 'Select all on this page'}
                      </button>
                    </div>

                    {currentProducts.map((product) => (
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
                          className='text-white cursor-pointer flex-1'
                        >
                          <div className='flex justify-between items-center'>
                            <span>
                              {product.name}
                              {product.discount?.active && (
                                <span className='ml-2 text-sm text-[rgb(211,190,249)]'>
                                  (Current: {product.discount.percentage}% off)
                                </span>
                              )}
                            </span>
                            <span className='text-gray-300'>
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}

                    {/* Products Pagination */}
                    {totalProductPages > 1 && (
                      <Pagination
                        currentPage={productCurrentPage}
                        setCurrentPage={setProductCurrentPage}
                        totalPages={totalProductPages}
                      />
                    )}
                  </>
                ) : (
                  <p className='text-gray-400'>
                    {productSearchTerm
                      ? 'No products match your search'
                      : 'No products available'}
                  </p>
                )}
              </div>
            </div>
          )}

          {discountType === 'category' && (
            <div>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-gray-300 font-medium'>
                  Select Categories ({selectedCategoryIds.length} selected)
                </label>
                <div className='relative w-64'>
                  <input
                    type='text'
                    placeholder='Search categories...'
                    value={categorySearchTerm}
                    onChange={(e) => {
                      setCategorySearchTerm(e.target.value)
                      setCategoryCurrentPage(1) // Reset to first page when searching
                    }}
                    className='w-full pl-10 pr-4 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
                  />
                  <FaSearch className='absolute left-3 top-3 text-gray-400' />
                </div>
              </div>

              <div className='max-h-96 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {filteredCategories.length > 0 ? (
                  <>
                    <div className='mb-3'>
                      <button
                        type='button'
                        onClick={handleSelectAllCategoriesOnPage}
                        className='text-sm text-[rgb(211,190,249)] hover:underline'
                      >
                        {currentCategories.every((category) =>
                          selectedCategoryIds.includes(category._id)
                        )
                          ? 'Deselect all on this page'
                          : 'Select all on this page'}
                      </button>
                    </div>

                    {currentCategories.map((category) => (
                      <div
                        key={category._id}
                        className='flex items-center mb-2'
                      >
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
                    ))}

                    {/* Categories Pagination */}
                    {totalCategoryPages > 1 && (
                      <Pagination
                        currentPage={categoryCurrentPage}
                        setCurrentPage={setCategoryCurrentPage}
                        totalPages={totalCategoryPages}
                      />
                    )}
                  </>
                ) : (
                  <p className='text-gray-400'>
                    {categorySearchTerm
                      ? 'No categories match your search'
                      : 'No categories available'}
                  </p>
                )}
              </div>
            </div>
          )}

          {discountType === 'brand' && (
            <div>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-gray-300 font-medium'>
                  Select Brands ({selectedBrands.length} selected)
                </label>
                <div className='relative w-64'>
                  <input
                    type='text'
                    placeholder='Search brands...'
                    value={brandSearchTerm}
                    onChange={(e) => {
                      setBrandSearchTerm(e.target.value)
                      setBrandCurrentPage(1) // Reset to first page when searching
                    }}
                    className='w-full pl-10 pr-4 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
                  />
                  <FaSearch className='absolute left-3 top-3 text-gray-400' />
                </div>
              </div>

              <div className='max-h-96 overflow-y-auto p-3 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg'>
                {filteredBrands.length > 0 ? (
                  <>
                    <div className='mb-3'>
                      <button
                        type='button'
                        onClick={handleSelectAllBrandsOnPage}
                        className='text-sm text-[rgb(211,190,249)] hover:underline'
                      >
                        {currentBrands.every((brand) =>
                          selectedBrands.includes(brand)
                        )
                          ? 'Deselect all on this page'
                          : 'Select all on this page'}
                      </button>
                    </div>

                    {currentBrands.map((brand) => (
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
                    ))}

                    {/* Brands Pagination */}
                    {totalBrandPages > 1 && (
                      <Pagination
                        currentPage={brandCurrentPage}
                        setCurrentPage={setBrandCurrentPage}
                        totalPages={totalBrandPages}
                      />
                    )}
                  </>
                ) : (
                  <p className='text-gray-400'>
                    {brandSearchTerm
                      ? 'No brands match your search'
                      : 'No brands available'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className='flex space-x-4'>
          <button
            type='submit'
            disabled={isApplying}
            className='flex-1 py-4 bg-[rgb(211,190,249)] text-[rgb(7,10,19)] font-medium rounded-lg hover:bg-opacity-90 transition-all'
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
                Creating...
              </span>
            ) : (
              'Create Discount'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateDiscountPage
