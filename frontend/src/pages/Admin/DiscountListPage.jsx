import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  FaPercentage,
  FaCalendarAlt,
  FaTags,
  FaStore,
  FaTrash,
  FaEdit,
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import {
  useRemoveDiscountMutation,
  useGetAllProductsQuery,
} from '../../redux/api/productApiSlice'
import Loader from '../../components/Loader'

const DiscountListPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch all products
  const {
    data: allProductsData,
    isLoading: productsLoading,
    refetch,
  } = useGetAllProductsQuery()

  // Mutation for removing discount
  const [removeDiscount] = useRemoveDiscountMutation()

  // Get products with active discounts
  const discountedProducts =
    allProductsData?.filter((product) => product.discount?.active) || []

  // Handle discount removal
  const handleRemoveDiscount = async (productId) => {
    if (window.confirm('Are you sure you want to remove this discount?')) {
      try {
        await removeDiscount(productId).unwrap()
        toast.success('Discount removed successfully')
        refetch()
      } catch (error) {
        console.error('Failed to remove discount:', error)
        toast.error(error?.data?.error || 'Failed to remove discount')
      }
    }
  }

  // Filter discounted products by search term
  const filteredDiscountedProducts = discountedProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.discount.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalItems = filteredDiscountedProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredDiscountedProducts.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, currentPage + halfVisible)

      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages
      }

      if (currentPage > totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }

    return pageNumbers
  }

  if (productsLoading) {
    return <Loader />
  }

  return (
    <div className='bg-[rgb(13,17,29)] rounded-xl shadow-lg p-8 max-w-6xl mx-auto my-10 border border-gray-800'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-white'>Discount Management</h2>
        <Link
          to='/admin/creatediscountpage'
          className='flex items-center px-4 py-2 bg-[rgb(211,190,249)] text-[rgb(7,10,19)] rounded-lg hover:bg-opacity-90 transition-all'
        >
          <FaPlus className='mr-2' />
          Create New Discount
        </Link>
      </div>

      {/* Current Discounts List */}
      <div>
        <h3 className='text-xl font-semibold text-white mb-4'>
          Active Discounts
        </h3>

        {/* Search Bar and Items Per Page */}
        <div className='mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
          <div className='relative flex-1 max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search discounts...'
              value={searchTerm}
              onChange={handleSearchChange}
              className='w-full pl-10 pr-4 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
            />
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm text-gray-300'>Show:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className='px-3 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)]'
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className='text-sm text-gray-300'>per page</span>
          </div>
        </div>

        {/* Results info */}
        {totalItems > 0 && (
          <div className='mb-4 text-sm text-gray-400'>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
            {totalItems} discounts
          </div>
        )}

        {currentItems.length > 0 ? (
          <>
            <div className='overflow-x-auto'>
              <table className='min-w-full bg-[rgb(7,10,19)] rounded-lg overflow-hidden'>
                <thead className='bg-[rgb(13,17,29)]'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Product
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Brand
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Original Price
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Discount
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Discounted Price
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Valid Until
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700'>
                  {currentItems.map((product) => (
                    <tr key={product._id}>
                      <td className='px-6 py-4 whitespace-nowrap text-white'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10'>
                            <img
                              className='h-10 w-10 rounded-full'
                              src={product.image}
                              alt={product.name}
                            />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium'>
                              {product.name}
                            </div>
                            <div className='text-sm text-gray-400'>
                              SKU: {product._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-white'>
                        {product.brand}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-white'>
                        ${product.price.toFixed(2)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-[rgb(211,190,249)]'>
                          {product.discount.name} ({product.discount.percentage}
                          %)
                        </div>
                        <div className='text-xs text-gray-400'>
                          Started:{' '}
                          {new Date(
                            product.discount.startDate
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-[rgb(211,190,249)] font-bold'>
                        $
                        {(
                          product.price *
                          (1 - product.discount.percentage / 100)
                        ).toFixed(2)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-white'>
                        <div className='text-sm'>
                          {new Date(
                            product.discount.endDate
                          ).toLocaleDateString()}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {Math.ceil(
                            (new Date(product.discount.endDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days remaining
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <Link
                          to={`/admin/updatediscountpage/${product._id}`}
                          className='text-[rgb(211,190,249)] hover:text-[rgb(180,150,249)] mr-4'
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleRemoveDiscount(product._id)}
                          className='text-red-400 hover:text-red-600'
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between mt-6'>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='px-3 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                  >
                    <FaChevronLeft className='mr-1' />
                    Previous
                  </button>

                  <div className='flex space-x-1'>
                    {getPageNumbers().map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-[rgb(211,190,249)] text-[rgb(7,10,19)]'
                            : 'bg-[rgb(7,10,19)] border border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='px-3 py-2 bg-[rgb(7,10,19)] border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                  >
                    Next
                    <FaChevronRight className='ml-1' />
                  </button>
                </div>

                <div className='text-sm text-gray-400'>
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='text-center py-8 text-gray-400'>
            {searchTerm ? 'No matching discounts found' : 'No active discounts'}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountListPage
