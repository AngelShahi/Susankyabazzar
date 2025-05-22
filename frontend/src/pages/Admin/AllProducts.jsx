import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetAllProductsQuery } from '../../redux/api/productApiSlice'
import { FaTag } from 'react-icons/fa'

const AllProducts = () => {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useGetAllProductsQuery()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10) // You can make this configurable

  // Refetch data when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  // Extract unique categories from products
  const categories = products
    ? [
        'All Categories',
        ...new Set(
          products.map((product) =>
            typeof product.category === 'object'
              ? product.category?.name || 'Uncategorized'
              : product.category || 'Uncategorized'
          )
        ),
      ]
    : ['All Categories']

  // Filter products based on search term, selected category, and discount filter
  useEffect(() => {
    if (!products) return

    let result = [...products]

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (product) =>
          (product.name || '').toLowerCase().includes(searchLower) ||
          (typeof product.category === 'object'
            ? (product.category?.name || '').toLowerCase().includes(searchLower)
            : (product.category || '').toLowerCase().includes(searchLower))
      )
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      result = result.filter((product) => {
        const productCategory =
          typeof product.category === 'object'
            ? product.category?.name || 'Uncategorized'
            : product.category || 'Uncategorized'
        return productCategory === selectedCategory
      })
    }

    // Filter by discount
    if (showDiscountsOnly) {
      result = result.filter(
        (product) => product.discount && product.discount.percentage > 0
      )
    }

    setFilteredProducts(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [products, searchTerm, selectedCategory, showDiscountsOnly])

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  )
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate discounted price
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || !discount.percentage) return price
    return price - (price * discount.percentage) / 100
  }

  // Check if discount is active
  const isDiscountActive = (discount) => {
    if (!discount) return false
    const now = new Date()
    const startDate = new Date(discount.startDate)
    const endDate = new Date(discount.endDate)
    return now >= startDate && now <= endDate
  }

  if (isLoading) {
    return (
      <div
        className='flex items-center justify-center h-64'
        style={{ backgroundColor: 'rgb(7, 10, 19)' }}
      >
        <div
          className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2'
          style={{ borderColor: 'rgb(211, 190, 249)' }}
        ></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className='p-4 rounded-lg shadow-sm text-center border'
        style={{
          backgroundColor: 'rgba(255, 87, 87, 0.1)',
          borderColor: 'rgba(255, 87, 87, 0.3)',
          color: '#ff5757',
        }}
      >
        Error loading products. Please try again later.
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'rgb(7, 10, 19)',
        color: '#fff',
        minHeight: '100vh',
      }}
      className='py-8'
    >
      <div className='container mx-auto px-6'>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-8'>
          <div className='flex flex-col'>
            <h1 className='text-3xl font-bold mb-2 text-white'>Products</h1>
            {filteredProducts.length > 0 && (
              <div className='text-sm text-gray-400'>
                Showing {indexOfFirstProduct + 1}-
                {Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
              </div>
            )}
          </div>
          <div className='flex gap-3 mt-4 md:mt-0'>
            <Link
              to='/admin/DiscountListPage'
              className='font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 mr-2'
              style={{
                backgroundColor: 'rgba(211, 190, 249, 0.2)',
                color: 'rgb(211, 190, 249)',
              }}
            >
              <FaTag className='mr-2' /> Manage Discounts
            </Link>
            <Link
              to='/admin/productlist'
              className='font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200'
              style={{
                backgroundColor: 'rgb(211, 190, 249)',
                color: 'rgb(7, 10, 19)',
              }}
            >
              <span className='mr-1 text-lg'>+</span> Create Product
            </Link>
          </div>
        </div>

        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4'>
          <div className='relative w-full md:max-w-md'>
            <input
              type='text'
              placeholder='Search products...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full p-3 pl-10 rounded-lg shadow-sm focus:outline-none'
              style={{
                backgroundColor: 'rgba(23, 27, 40, 0.8)',
                border: '1px solid rgba(211, 190, 249, 0.3)',
                color: 'white',
              }}
            />
            <svg
              className='w-5 h-5 absolute left-3 top-3.5'
              fill='none'
              stroke='rgb(211, 190, 249)'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <div className='flex gap-4'>
            {/* Discount Filter Toggle */}
            <div className='flex items-center'>
              <label className='flex items-center cursor-pointer'>
                <div className='relative'>
                  <input
                    type='checkbox'
                    className='sr-only'
                    checked={showDiscountsOnly}
                    onChange={() => setShowDiscountsOnly(!showDiscountsOnly)}
                  />
                  <div
                    className='block w-10 h-6 rounded-full'
                    style={{
                      backgroundColor: showDiscountsOnly
                        ? 'rgb(211, 190, 249)'
                        : 'rgba(211, 190, 249, 0.2)',
                    }}
                  ></div>
                  <div
                    className='dot absolute left-1 top-1 w-4 h-4 rounded-full transition'
                    style={{
                      backgroundColor: 'white',
                      transform: showDiscountsOnly
                        ? 'translateX(16px)'
                        : 'translateX(0)',
                    }}
                  ></div>
                </div>
                <div className='ml-3 text-gray-300 text-sm font-medium'>
                  Show Discounted Only
                </div>
              </label>
            </div>

            {/* Category Filter */}
            <div className='relative w-full md:w-64'>
              <select
                className='appearance-none w-full rounded-lg p-3 pr-8 shadow-sm focus:outline-none'
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  backgroundColor: 'rgba(23, 27, 40, 0.8)',
                  border: '1px solid rgba(211, 190, 249, 0.3)',
                  color: 'white',
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3'>
                <svg
                  className='h-4 w-4'
                  fill='rgb(211, 190, 249)'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            className='rounded-lg p-8 text-center'
            style={{
              backgroundColor: 'rgba(23, 27, 40, 0.8)',
              border: '1px solid rgba(211, 190, 249, 0.2)',
            }}
          >
            <p className='text-gray-400'>
              No products match your search criteria.
            </p>
          </div>
        ) : (
          <div
            className='overflow-x-auto rounded-lg shadow-lg'
            style={{ border: '1px solid rgba(211, 190, 249, 0.2)' }}
          >
            <table
              className='min-w-full'
              style={{ backgroundColor: 'rgba(15, 18, 30, 0.8)' }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(211, 190, 249, 0.2)',
                    backgroundColor: 'rgba(23, 27, 40, 0.9)',
                  }}
                >
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    ID
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Name
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Category
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-medium uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Price
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Discount
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Final Price
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Quantity
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Stock
                  </th>
                  <th
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
                    style={{ color: 'rgb(211, 190, 249)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => {
                  const hasDiscount =
                    product.discount && product.discount.percentage > 0
                  const discountActive = isDiscountActive(product.discount)
                  const finalPrice = discountActive
                    ? calculateDiscountedPrice(product.price, product.discount)
                    : product.price
                  // Calculate actual index based on current page
                  const actualIndex = indexOfFirstProduct + index

                  return (
                    <tr
                      key={product._id}
                      className='transition-colors duration-150'
                      style={{
                        borderBottom: '1px solid rgba(211, 190, 249, 0.1)',
                      }}
                    >
                      <td className='py-4 px-6 text-sm text-gray-400'>
                        P{String(actualIndex + 1).padStart(3, '0')}
                      </td>
                      <td className='py-4 px-6 text-sm font-medium text-white'>
                        {product.name || 'Unnamed Product'}
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-400'>
                        {typeof product.category === 'object'
                          ? product.category?.name || 'Uncategorized'
                          : product.category || 'Uncategorized'}
                      </td>
                      <td
                        className={`py-4 px-6 text-sm font-medium ${
                          hasDiscount && discountActive
                            ? 'line-through text-gray-400'
                            : ''
                        }`}
                        style={
                          !hasDiscount || !discountActive
                            ? { color: 'rgb(211, 190, 249)' }
                            : {}
                        }
                      >
                        $
                        {typeof product.price === 'number'
                          ? product.price.toFixed(2)
                          : '0.00'}
                      </td>
                      <td className='py-4 px-6 text-sm'>
                        {hasDiscount ? (
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                discountActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <FaTag className='mr-1' />
                              {product.discount.percentage}%
                            </span>
                            <div className='text-xs text-gray-400 mt-1'>
                              {product.discount.name || 'Discount'}
                            </div>
                            <div className='text-xs text-gray-400 mt-0.5'>
                              {formatDate(product.discount.startDate)} -{' '}
                              {formatDate(product.discount.endDate)}
                            </div>
                          </div>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                      <td
                        className='py-4 px-6 text-sm font-medium'
                        style={{ color: 'rgb(211, 190, 249)' }}
                      >
                        ${finalPrice.toFixed(2)}
                      </td>
                      <td className='py-4 px-6 text-sm text-gray-400'>
                        {product.quantity || 0}
                      </td>
                      <td className='py-4 px-6 text-sm'>
                        <span
                          className='px-3 py-1 text-xs font-medium rounded-full'
                          style={{
                            backgroundColor: product.stock
                              ? 'rgba(72, 187, 120, 0.2)'
                              : 'rgba(245, 101, 101, 0.2)',
                            color: product.stock
                              ? 'rgb(72, 187, 120)'
                              : 'rgb(245, 101, 101)',
                          }}
                        >
                          {product.stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className='py-4 px-6'>
                        <div className='flex space-x-4'>
                          <Link
                            to={`/admin/product/update/${product._id}`}
                            className='text-sm font-medium transition-colors duration-150'
                            style={{ color: 'rgb(211, 190, 249)' }}
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div
                className='px-4 py-3 border-t'
                style={{
                  backgroundColor: 'rgba(23, 27, 40, 0.9)',
                  borderColor: 'rgba(211, 190, 249, 0.2)',
                }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1 flex justify-between sm:hidden'>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Next
                    </button>
                  </div>
                  <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                    <div>
                      <p className='text-sm text-gray-400'>
                        Showing{' '}
                        <span className='font-medium'>
                          {indexOfFirstProduct + 1}
                        </span>{' '}
                        to{' '}
                        <span className='font-medium'>
                          {Math.min(
                            indexOfLastProduct,
                            filteredProducts.length
                          )}
                        </span>{' '}
                        of{' '}
                        <span className='font-medium'>
                          {filteredProducts.length}
                        </span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                        aria-label='Pagination'
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <span className='sr-only'>Previous</span>
                          <svg
                            className='h-5 w-5'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            aria-hidden='true'
                          >
                            <path
                              fillRule='evenodd'
                              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>

                        {getPageNumbers().map((number, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              number !== '...' && handlePageChange(number)
                            }
                            disabled={number === '...'}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              number === currentPage
                                ? 'z-10 bg-[rgb(211,190,249)] border-[rgb(211,190,249)] text-gray-900'
                                : number === '...'
                                ? 'border-gray-600 bg-gray-800 text-gray-400 cursor-default'
                                : 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <span className='sr-only'>Next</span>
                          <svg
                            className='h-5 w-5'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            aria-hidden='true'
                          >
                            <path
                              fillRule='evenodd'
                              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProducts
