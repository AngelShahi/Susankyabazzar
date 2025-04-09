import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAllProductsQuery } from '../../redux/api/productApiSlice'

const AllProducts = () => {
  // Add refetch to get the function to manually refresh data
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  // Refetch data when component mounts
  useEffect(() => {
    // Force refresh data when component mounts
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

  // Filter products based on search term and selected category
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

    setFilteredProducts(result)
  }, [products, searchTerm, selectedCategory])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600'></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg shadow-sm text-center'>
        Error loading products. Please try again later.
      </div>
    )
  }

  return (
    <div className='container mx-auto px-6 py-8'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-8'>
        <h1 className='text-3xl font-bold mb-4 md:mb-0 text-gray-800'>
          Products
        </h1>
        <div className='flex gap-3'>
          <button
            onClick={() => refetch()}
            className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200'
          >
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Refresh
          </button>
          <Link
            to='/admin/productlist'
            className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200'
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
            className='w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />
          <svg
            className='w-5 h-5 absolute left-3 top-3.5 text-gray-400'
            fill='none'
            stroke='currentColor'
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

        <div className='relative w-full md:w-64'>
          <select
            className='appearance-none w-full border border-gray-300 rounded-lg p-3 pr-8 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700'>
            <svg
              className='fill-current h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
            >
              <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
            </svg>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
          <p className='text-gray-600'>
            No products match your search criteria.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto shadow-lg rounded-lg border border-gray-200'>
          <table className='min-w-full bg-white'>
            <thead>
              <tr className='bg-gray-100 border-b'>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  ID
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Name
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Category
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Price
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Stock
                </th>
                <th className='py-4 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className='hover:bg-gray-50 transition-colors duration-150'
                >
                  <td className='py-4 px-6 text-sm text-gray-500'>
                    P{String(index + 1).padStart(3, '0')}
                  </td>
                  <td className='py-4 px-6 text-sm font-medium text-gray-900'>
                    {product.name || 'Unnamed Product'}
                  </td>
                  <td className='py-4 px-6 text-sm text-gray-500'>
                    {typeof product.category === 'object'
                      ? product.category?.name || 'Uncategorized'
                      : product.category || 'Uncategorized'}
                  </td>
                  <td className='py-4 px-6 text-sm text-gray-900 font-medium'>
                    $
                    {typeof product.price === 'number'
                      ? product.price.toFixed(2)
                      : '0.00'}
                  </td>
                  <td className='py-4 px-6 text-sm text-gray-500'>
                    {product.quantity || 0}
                  </td>
                  <td className='py-4 px-6 text-sm'>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        product.stock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex space-x-4'>
                      <Link
                        to={`/admin/product/update/${product._id}`}
                        className='text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150'
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {}}
                        className='text-sm font-medium text-red-600 hover:text-red-900 transition-colors duration-150'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AllProducts
