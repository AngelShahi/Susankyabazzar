import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useGetMyOrdersQuery,
  useUploadPaymentProofMutation,
  useCancelOrderMutation,
} from '../../redux/api/orderApiSlice'
import { toast } from 'react-toastify'
import Message from '../../components/Message'
import Loader from '../../components/Loader'

const OrderHistoryScreen = () => {
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery()

  const [uploadPaymentProof] = useUploadPaymentProofMutation()
  const [cancelOrder] = useCancelOrderMutation()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const ordersPerPage = 5

  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Custom styles matching the Login component
  const styles = {
    backgroundColor: 'rgb(7, 10, 19)',
    accentColor: 'rgb(211, 190, 249)',
    darkAccent: 'rgb(161, 140, 199)',
    darkBg: 'rgb(13, 17, 30)',
    lighterBg: 'rgb(20, 25, 40)',
  }

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)

    try {
      setTimeout(() => {
        const fileUrl = URL.createObjectURL(file)
        setImage(fileUrl)
        setUploading(false)
      }, 1000)
    } catch (error) {
      console.error(error)
      setUploading(false)
    }
  }

  const submitPaymentProof = async () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    try {
      const res = await uploadPaymentProof({
        orderId: selectedOrder._id,
        imageUrl: image,
      }).unwrap()

      toast.success('Payment proof uploaded successfully')
      setShowUploadModal(false)
      setImage('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Something went wrong')
    }
  }

  const handleCancelOrder = async () => {
    try {
      await cancelOrder({
        orderId: selectedOrder._id,
        reason: cancelReason,
      }).unwrap()

      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      setCancelReason('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to cancel order')
    }
  }

  const getFilteredOrders = () => {
    if (!orders) return []

    let filtered = [...orders]

    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.orderItems.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (filterStatus === 'paid') {
      filtered = filtered.filter((order) => order.isPaid)
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter((order) => !order.isPaid)
    } else if (filterStatus === 'delivered') {
      filtered = filtered.filter((order) => order.isDelivered)
    } else if (filterStatus === 'processing') {
      filtered = filtered.filter((order) => order.isPaid && !order.isDelivered)
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter((order) => order.isCancelled)
    }

    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortOrder === 'highest') {
      filtered.sort((a, b) => b.totalPrice - a.totalPrice)
    } else if (sortOrder === 'lowest') {
      filtered.sort((a, b) => a.totalPrice - b.totalPrice)
    }

    return filtered
  }

  const filteredOrders = getFilteredOrders()
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  )

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const renderStatusBadge = (order) => {
    const badgeStyles = {
      cancelled: { backgroundColor: 'rgba(220, 38, 38, 0.8)', color: 'white' },
      delivered: { backgroundColor: 'rgba(16, 185, 129, 0.8)', color: 'white' },
      processing: {
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        color: 'white',
      },
      paymentProof: {
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        color: 'white',
      },
      awaiting: { backgroundColor: 'rgba(156, 163, 175, 0.8)', color: 'white' },
    }

    let status
    if (order.isCancelled) status = 'cancelled'
    else if (order.isDelivered) status = 'delivered'
    else if (order.isPaid) status = 'processing'
    else if (order.paymentProofImage) status = 'paymentProof'
    else status = 'awaiting'

    return (
      <span
        className='px-3 py-1 rounded text-sm font-medium'
        style={badgeStyles[status]}
      >
        {status === 'cancelled' && 'Cancelled'}
        {status === 'delivered' && 'Delivered'}
        {status === 'processing' && 'Processing'}
        {status === 'paymentProof' && 'Payment Proof Uploaded'}
        {status === 'awaiting' && 'Payment due'}
      </span>
    )
  }

  const getProductNames = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return 'No items'
    return order.orderItems.map((item) => item.name).join(', ')
  }

  return (
    <div
      className='min-h-screen py-8'
      style={{ backgroundColor: styles.backgroundColor }}
    >
      <div className='container mx-auto px-4 max-w-6xl'>
        <h2
          className='text-3xl font-bold mb-6'
          style={{ color: styles.accentColor }}
        >
          My Order History
        </h2>

        {isLoading ? (
          <div className='flex justify-center items-center py-10'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <div className='grid md:grid-cols-3 gap-4 mb-6'>
              <div>
                <label
                  className='block mb-1 text-sm font-medium'
                  style={{ color: styles.accentColor }}
                >
                  Search by Product
                </label>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder='Search by product name...'
                  className='w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2'
                  style={{
                    backgroundColor: styles.lighterBg,
                    borderColor: 'rgba(211, 190, 249, 0.3)',
                    color: 'white',
                  }}
                />
              </div>
              <div>
                <label
                  className='block mb-1 text-sm font-medium'
                  style={{ color: styles.accentColor }}
                >
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className='w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2'
                  style={{
                    backgroundColor: styles.lighterBg,
                    borderColor: 'rgba(211, 190, 249, 0.3)',
                    color: 'white',
                  }}
                >
                  <option value='all'>All Orders</option>
                  <option value='paid'>Paid</option>
                  <option value='unpaid'>Awaiting Payment</option>
                  <option value='delivered'>Delivered</option>
                  <option value='processing'>Processing</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>
              <div>
                <label
                  className='block mb-1 text-sm font-medium'
                  style={{ color: styles.accentColor }}
                >
                  Sort By
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value)
                    setCurrentPage(1)
                  }}
                  className='w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2'
                  style={{
                    backgroundColor: styles.lighterBg,
                    borderColor: 'rgba(211, 190, 249, 0.3)',
                    color: 'white',
                  }}
                >
                  <option value='newest'>Newest First</option>
                  <option value='oldest'>Oldest First</option>
                  <option value='highest'>Highest Price</option>
                  <option value='lowest'>Lowest Price</option>
                </select>
              </div>
            </div>

            <div
              className='mt-8 overflow-x-auto rounded-lg shadow-lg'
              style={{
                backgroundColor: styles.darkBg,
                borderColor: 'rgba(211, 190, 249, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <table className='w-full border-collapse'>
                <thead>
                  <tr
                    className='border-b'
                    style={{
                      borderColor: 'rgba(211, 190, 249, 0.2)',
                      backgroundColor: styles.backgroundColor,
                    }}
                  >
                    {[
                      'ORDER ID',
                      'DATE',
                      'PRODUCTS',
                      'TOTAL',
                      'STATUS',
                      'ACTIONS',
                    ].map((header, index) => (
                      <th
                        key={index}
                        className='px-6 py-4 text-left text-sm font-medium'
                        style={{ color: styles.accentColor, width: '16.67%' }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan='6' className='p-6 text-center text-gray-300'>
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, index) => (
                      <tr
                        key={order._id}
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? 'transparent'
                              : 'rgba(211, 190, 249, 0.05)',
                        }}
                      >
                        <td className='p-6 text-white'>{order._id}</td>
                        <td className='p-6 text-white'>
                          {order.createdAt.substring(0, 10)}
                        </td>
                        <td className='p-6 text-white'>
                          {getProductNames(order)}
                        </td>
                        <td className='p-6 text-white'>${order.totalPrice}</td>
                        <td className='p-6'>{renderStatusBadge(order)}</td>
                        <td className='p-6'>
                          <div className='md:flex md:flex-col md:space-y-2 hidden'>
                            <Link to={`/order/${order._id}`}>
                              <button
                                className='w-full py-2 px-3 rounded text-sm transition-all duration-300'
                                style={{
                                  backgroundColor: 'rgba(211, 190, 249, 0.2)',
                                  color: styles.accentColor,
                                  border: '1px solid rgba(211, 190, 249, 0.3)',
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    styles.darkAccent
                                  e.currentTarget.style.transform =
                                    'translateY(-2px)'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    'rgba(211, 190, 249, 0.2)'
                                  e.currentTarget.style.transform =
                                    'translateY(0)'
                                }}
                              >
                                Details
                              </button>
                            </Link>
                            {!order.isPaid &&
                              !order.isCancelled &&
                              !order.paymentProofImage && (
                                <button
                                  className='w-full py-2 px-3 rounded text-sm transition-all duration-300'
                                  style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    color: 'rgb(59, 130, 246)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                                  }}
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowUploadModal(true)
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      'rgba(59, 130, 246, 0.3)'
                                    e.currentTarget.style.transform =
                                      'translateY(-2px)'
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      'rgba(59, 130, 246, 0.2)'
                                    e.currentTarget.style.transform =
                                      'translateY(0)'
                                  }}
                                >
                                  Upload Payment
                                </button>
                              )}
                            {!order.isPaid && !order.isCancelled && (
                              <button
                                className='w-full py-2 px-3 rounded text-sm transition-all duration-300'
                                style={{
                                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                  color: 'rgb(220, 38, 38)',
                                  border: '1px solid rgba(220, 38, 38, 0.3)',
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                                }}
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowCancelModal(true)
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    'rgba(220, 38, 38, 0.3)'
                                  e.currentTarget.style.transform =
                                    'translateY(-2px)'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    'rgba(220, 38, 38, 0.2)'
                                  e.currentTarget.style.transform =
                                    'translateY(0)'
                                }}
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                          <details className='md:hidden'>
                            <summary
                              className='w-full py-2 px-3 rounded text-sm cursor-pointer'
                              style={{
                                backgroundColor: 'rgba(211, 190, 249, 0.2)',
                                color: styles.accentColor,
                                border: '1px solid rgba(211, 190, 249, 0.3)',
                              }}
                            >
                              Actions
                            </summary>
                            <div className='flex flex-col space-y-2 mt-2'>
                              <Link to={`/order/${order._id}`}>
                                <button
                                  className='w-full py-2 px-3 rounded text-sm'
                                  style={{
                                    backgroundColor: 'rgba(211, 190, 249, 0.2)',
                                    color: styles.accentColor,
                                    border:
                                      '1px solid rgba(211, 190, 249, 0.3)',
                                  }}
                                >
                                  Details
                                </button>
                              </Link>
                              {!order.isPaid &&
                                !order.isCancelled &&
                                !order.paymentProofImage && (
                                  <button
                                    className='w-full py-2 px-3 rounded text-sm'
                                    style={{
                                      backgroundColor:
                                        'rgba(59, 130, 246, 0.2)',
                                      color: 'rgb(59, 130, 246)',
                                      border:
                                        '1px solid rgba(59, 130, 246, 0.3)',
                                    }}
                                    onClick={() => {
                                      setSelectedOrder(order)
                                      setShowUploadModal(true)
                                    }}
                                  >
                                    Upload Payment
                                  </button>
                                )}
                              {!order.isPaid && !order.isCancelled && (
                                <button
                                  className='w-full py-2 px-3 rounded text-sm'
                                  style={{
                                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                    color: 'rgb(220, 38, 38)',
                                    border: '1px solid rgba(220, 38, 38, 0.3)',
                                  }}
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowCancelModal(true)
                                  }}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className='mt-6 flex justify-center items-center space-x-2'>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='px-4 py-2 rounded text-sm transition-all duration-300'
                  style={{
                    backgroundColor: styles.lighterBg,
                    color: 'white',
                    border: '1px solid rgba(211, 190, 249, 0.3)',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    boxShadow:
                      currentPage !== 1
                        ? '0 4px 6px rgba(0, 0, 0, 0.25)'
                        : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = styles.darkAccent
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = styles.lighterBg
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className='px-4 py-2 rounded text-sm transition-all duration-300'
                      style={{
                        backgroundColor:
                          currentPage === page
                            ? styles.accentColor
                            : styles.lighterBg,
                        color:
                          currentPage === page
                            ? styles.backgroundColor
                            : 'white',
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow:
                          currentPage === page
                            ? '0 4px 6px rgba(0, 0, 0, 0.25)'
                            : 'none',
                      }}
                      onMouseOver={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor =
                            styles.darkAccent
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor =
                            styles.lighterBg
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 rounded text-sm transition-all duration-300'
                  style={{
                    backgroundColor: styles.lighterBg,
                    color: 'white',
                    border: '1px solid rgba(211, 190, 249, 0.3)',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages ? 'not-allowed' : 'pointer',
                    boxShadow:
                      currentPage !== totalPages
                        ? '0 4px 6px rgba(0, 0, 0, 0.25)'
                        : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = styles.darkAccent
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = styles.lighterBg
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showUploadModal && (
        <div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center'>
          <div
            className='relative rounded-lg max-w-md w-full p-6 mx-4'
            style={{
              backgroundColor: styles.darkBg,
              border: '1px solid rgba(211, 190, 249, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              className='flex justify-between items-center mb-4 pb-2 border-b'
              style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
            >
              <h3
                className='text-xl font-bold'
                style={{ color: styles.accentColor }}
              >
                Upload Payment Proof
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setImage('')
                }}
                className='text-gray-400 hover:text-white text-xl'
              >
                ×
              </button>
            </div>

            <div className='mb-4'>
              <p className='mb-2 text-gray-300'>
                Order ID:{' '}
                <span style={{ color: styles.accentColor }}>
                  {selectedOrder?._id}
                </span>
              </p>
              <p className='mb-4 text-gray-300'>
                Total Amount:{' '}
                <span style={{ color: styles.accentColor }}>
                  ${selectedOrder?.totalPrice}
                </span>
              </p>

              <div className='mb-4'>
                <label
                  className='block mb-1 text-sm font-medium'
                  style={{ color: styles.accentColor }}
                >
                  Upload Image
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={uploadFileHandler}
                  className='block w-full text-sm rounded-lg'
                  style={{
                    backgroundColor: styles.lighterBg,
                    color: 'white',
                    border: '1px solid rgba(211, 190, 249, 0.3)',
                    padding: '0.5rem',
                  }}
                  disabled={uploading}
                />
                {uploading && (
                  <p
                    className='mt-2 text-sm'
                    style={{ color: styles.accentColor }}
                  >
                    Uploading...
                  </p>
                )}
              </div>

              {image && (
                <div className='mt-4'>
                  <p className='mb-2' style={{ color: styles.accentColor }}>
                    Preview:
                  </p>
                  <img
                    src={image}
                    alt='Payment proof'
                    className='max-w-full h-auto rounded border'
                    style={{ borderColor: 'rgba(211, 190, 249, 0.3)' }}
                  />
                </div>
              )}
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setImage('')
                }}
                className='py-2 px-4 rounded text-sm transition-all duration-300'
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(107, 114, 128, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(107, 114, 128, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Close
              </button>
              <button
                onClick={submitPaymentProof}
                disabled={!image || uploading}
                className='py-2 px-4 rounded text-sm transition-all duration-300'
                style={{
                  backgroundColor:
                    !image || uploading
                      ? 'rgba(211, 190, 249, 0.4)'
                      : styles.accentColor,
                  color: !image || uploading ? 'white' : styles.backgroundColor,
                  cursor: !image || uploading ? 'not-allowed' : 'pointer',
                  boxShadow:
                    !image || uploading
                      ? 'none'
                      : '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
                onMouseOver={(e) => {
                  if (image && !uploading) {
                    e.currentTarget.style.backgroundColor = styles.darkAccent
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (image && !uploading) {
                    e.currentTarget.style.backgroundColor = styles.accentColor
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center'>
          <div
            className='relative rounded-lg max-w-md w-full p-6 mx-4'
            style={{
              backgroundColor: styles.darkBg,
              border: '1px solid rgba(211, 190, 249, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              className='flex justify-between items-center mb-4 pb-2 border-b'
              style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
            >
              <h3
                className='text-xl font-bold'
                style={{ color: styles.accentColor }}
              >
                Cancel Order
              </h3>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className='text-gray-400 hover:text-white text-xl'
              >
                ×
              </button>
            </div>

            <div className='mb-4'>
              <p className='mb-4 text-gray-300'>
                Are you sure you want to cancel order #{selectedOrder?._id}?
              </p>
              <div className='mb-4'>
                <label
                  className='block mb-1 text-sm font-medium'
                  style={{ color: styles.accentColor }}
                >
                  Reason for cancellation
                </label>
                <textarea
                  rows='3'
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder='Please provide a reason for cancellation...'
                  className='block w-full text-sm rounded-lg'
                  style={{
                    backgroundColor: styles.lighterBg,
                    color: 'white',
                    border: '1px solid rgba(211, 190, 249, 0.3)',
                    padding: '0.5rem',
                  }}
                />
              </div>
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className='py-2 px-4 rounded text-sm transition-all duration-300'
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(107, 114, 128, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(107, 114, 128, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                className='py-2 px-4 rounded text-sm transition-all duration-300'
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.8)',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(220, 38, 38, 0.9)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(220, 38, 38, 0.8)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistoryScreen
