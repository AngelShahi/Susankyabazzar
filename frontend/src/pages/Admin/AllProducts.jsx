import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetAllProductsQuery } from '../../redux/api/productApiSlice'
import { FaTag } from 'react-icons/fa'

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useGetAllProductsQuery()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false)

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
  }, [products, searchTerm, selectedCategory, showDiscountsOnly])

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
          <h1 className='text-3xl font-bold mb-4 md:mb-0 text-white'>
            Products
          </h1>
          <div className='flex gap-3'>
            <Link
              to='/admin/discountmanager'
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
                    className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider'
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
                {filteredProducts.map((product, index) => {
                  const hasDiscount = product.discount && product.discount.percentage > 0
                  const discountActive = isDiscountActive(product.discount)
                  const finalPrice = discountActive
                    ? calculateDiscountedPrice(product.price, product.discount)
                    : product.price

                  return (
                    <tr
                      key={product._id}
                      className='transition-colors duration-150'
                      style={{
                        borderBottom: '1px solid rgba(211, 190, 249, 0.1)',
                      }}
                    >
                      <td className='py-4 px-6 text-sm text-gray-400'>
                        P{String(index + 1).padStart(3, '0')}
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
                          hasDiscount && discountActive ? 'line-through text-gray-400' : ''
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
                              {formatDate(product.discount.startDate)} - {formatDate(product.discount.endDate)}
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
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProducts