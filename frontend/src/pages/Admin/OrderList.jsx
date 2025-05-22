import Message from '../../components/Message'
import Loader from '../../components/Loader'
import { Link } from 'react-router-dom'
import { useGetOrdersQuery } from '../../redux/api/orderApiSlice'
import { useState, useMemo } from 'react'

const OrderList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10) // You can make this configurable
  const [hoveredRow, setHoveredRow] = useState(null)
  const [sortOrder, setSortOrder] = useState('newest') // newest or oldest
  const [searchTerm, setSearchTerm] = useState('')

  const { data: orders, isLoading, error } = useGetOrdersQuery()

  // Filter and sort orders based on search term and sort order
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return []

    // First, filter orders based on search term
    let filteredOrders = orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.user?.username?.toLowerCase().includes(searchLower) ||
        order.totalPrice.toString().includes(searchTerm) ||
        (order.isPaid && 'paid completed'.includes(searchLower)) ||
        (order.isDelivered && 'delivered completed'.includes(searchLower)) ||
        (order.isCancelled && 'cancelled'.includes(searchLower)) ||
        (!order.isPaid && 'pending unpaid'.includes(searchLower)) ||
        (!order.isDelivered && 'pending undelivered'.includes(searchLower))
      )
    })

    // Then, sort the filtered orders
    return filteredOrders.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)

      if (sortOrder === 'newest') {
        return dateB - dateA // Newest first
      } else {
        return dateA - dateB // Oldest first
      }
    })
  }, [orders, searchTerm, sortOrder])

  // Calculate pagination based on filtered orders
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredAndSortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  )
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage)

  // Reset to first page when search term or sort order changes
  useState(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOrder])

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

  const handleSortChange = (e) => {
    setSortOrder(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
          <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
            Order Management
          </h1>

          {/* Search and Sort Controls */}
          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            {/* Search Bar */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <input
                type='text'
                placeholder='Search orders...'
                value={searchTerm}
                onChange={handleSearchChange}
                className='w-full sm:w-64 pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] focus:border-transparent'
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  <svg
                    className='h-5 w-5 text-gray-400 hover:text-gray-300'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className='py-2 px-3 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] focus:border-transparent'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        {filteredAndSortedOrders && filteredAndSortedOrders.length > 0 && (
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2'>
            <div className='text-sm text-gray-400'>
              Showing {indexOfFirstOrder + 1}-
              {Math.min(indexOfLastOrder, filteredAndSortedOrders.length)} of{' '}
              {filteredAndSortedOrders.length} {searchTerm ? 'filtered ' : ''}
              orders
              {orders &&
                searchTerm &&
                filteredAndSortedOrders.length !== orders.length && (
                  <span className='ml-1'>(from {orders.length} total)</span>
                )}
            </div>
            {searchTerm && (
              <div className='text-sm text-gray-400'>
                Search: "{searchTerm}"
                <button
                  onClick={clearSearch}
                  className='ml-2 text-[rgb(211,190,249)] hover:text-[rgb(191,170,229)] underline'
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className='flex justify-center my-12'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <div className='bg-gray-900 bg-opacity-50 rounded-lg shadow-lg overflow-hidden border border-gray-800'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-full divide-y divide-gray-800'>
                <thead className='bg-gray-800 text-gray-300'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Items
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      ID
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Total
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Paid
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Delivered
                    </th>
                    <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className='divide-y divide-gray-800 bg-gray-900 bg-opacity-40'>
                  {currentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onMouseEnter={() => setHoveredRow(order._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`transition-colors duration-150 ${
                        hoveredRow === order._id
                          ? 'bg-gray-800 bg-opacity-70'
                          : ''
                      }`}
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center'>
                          <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-700'>
                            <img
                              src={order.orderItems[0].image}
                              alt={order._id}
                              className='h-full w-full object-cover object-center'
                            />
                          </div>
                          <div className='ml-3'>
                            <p className='text-sm text-gray-400'>
                              {order.orderItems.length} item(s)
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-4 py-3 text-sm text-gray-400'>
                        <span className='font-mono'>
                          {order._id.substring(0, 8)}...
                        </span>
                      </td>

                      <td className='px-4 py-3 text-sm'>
                        {order.user ? order.user.username : 'N/A'}
                      </td>

                      <td className='px-4 py-3 text-sm text-gray-400'>
                        {order.createdAt
                          ? order.createdAt.substring(0, 10)
                          : 'N/A'}
                      </td>

                      <td className='px-4 py-3 text-sm font-medium'>
                        ${order.totalPrice.toFixed(2)}
                      </td>

                      <td className='px-4 py-3 text-sm'>
                        {order.isCancelled ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300'>
                            Cancelled
                          </span>
                        ) : (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-300'>
                            Active
                          </span>
                        )}
                      </td>

                      <td className='px-4 py-3 text-sm'>
                        {order.isPaid ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300'>
                            Completed
                          </span>
                        ) : order.isCancelled ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300'>
                            N/A
                          </span>
                        ) : (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'>
                            Pending
                          </span>
                        )}
                      </td>

                      <td className='px-4 py-3 text-sm'>
                        {order.isDelivered ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300'>
                            Completed
                          </span>
                        ) : order.isCancelled ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300'>
                            N/A
                          </span>
                        ) : (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'>
                            Pending
                          </span>
                        )}
                      </td>

                      <td className='px-4 py-3 text-sm text-right'>
                        <Link to={`/order/${order._id}`}>
                          <button
                            className={`px-4 py-1 rounded font-medium text-sm transition-colors duration-200 ${
                              order.isCancelled
                                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                : 'bg-[rgb(211,190,249)] hover:bg-[rgb(191,170,229)] text-gray-900'
                            }`}
                          >
                            {order.isCancelled ? 'View Reason' : 'View Details'}
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAndSortedOrders &&
                filteredAndSortedOrders.length === 0 && (
                  <div className='text-center py-8 text-gray-400'>
                    {searchTerm ? (
                      <div>
                        <p>No orders found matching "{searchTerm}"</p>
                        <button
                          onClick={clearSearch}
                          className='mt-2 text-[rgb(211,190,249)] hover:text-[rgb(191,170,229)] underline'
                        >
                          Clear search to see all orders
                        </button>
                      </div>
                    ) : (
                      'No orders found.'
                    )}
                  </div>
                )}
            </div>

            {/* Pagination */}
            {filteredAndSortedOrders &&
              filteredAndSortedOrders.length > 0 &&
              totalPages > 1 && (
                <div className='bg-gray-800 bg-opacity-50 px-4 py-3 border-t border-gray-700'>
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
                            {indexOfFirstOrder + 1}
                          </span>{' '}
                          to{' '}
                          <span className='font-medium'>
                            {Math.min(
                              indexOfLastOrder,
                              filteredAndSortedOrders.length
                            )}
                          </span>{' '}
                          of{' '}
                          <span className='font-medium'>
                            {filteredAndSortedOrders.length}
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

export default OrderList
