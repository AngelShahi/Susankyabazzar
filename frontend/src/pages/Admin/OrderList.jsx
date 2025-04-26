import Message from '../../components/Message'
import Loader from '../../components/Loader'
import { Link } from 'react-router-dom'
import { useGetOrdersQuery } from '../../redux/api/orderApiSlice'
import { useState } from 'react'

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery()
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-[rgb(211,190,249)]'>
          Order Management
        </h1>

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
                  {orders.map((order) => (
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

              {orders && orders.length === 0 && (
                <div className='text-center py-8 text-gray-400'>
                  No orders found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderList
