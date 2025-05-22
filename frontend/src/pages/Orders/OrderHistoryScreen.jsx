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

  // For filtering and sorting
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Handle payment proof upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)

    try {
      // Simulate file upload since we're not implementing the actual FileUpload component
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

  // Handle order cancellation
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

  // Filter orders based on status
  const getFilteredOrders = () => {
    if (!orders) return []

    let filtered = [...orders]

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

    // Sort orders
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortOrder === 'highest') {
      filtered.sort((a, b) => b.totalPrice - a.totalPrice)
    } else if (sortOrder === 'lowest') {
      filtered.sort((a, b) => a.totalPrice - a.totalPrice)
    }

    return filtered
  }

  // Helper function to render the appropriate badge based on order status
  const renderStatusBadge = (order) => {
    if (order.isCancelled) {
      return (
        <span
          className='px-2 py-1 rounded text-xs font-medium'
          style={{ backgroundColor: 'rgba(220, 38, 38, 0.8)', color: 'white' }}
        >
          Cancelled
        </span>
      )
    } else if (order.isDelivered) {
      return (
        <span
          className='px-2 py-1 rounded text-xs font-medium'
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)', color: 'white' }}
        >
          Delivered
        </span>
      )
    } else if (order.isPaid) {
      return (
        <span
          className='px-2 py-1 rounded text-xs font-medium'
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white' }}
        >
          Processing
        </span>
      )
    } else if (order.paymentProofImage) {
      return (
        <span
          className='px-2 py-1 rounded text-xs font-medium'
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.8)', color: 'white' }}
        >
          Payment Proof Uploaded
        </span>
      )
    } else {
      return (
        <span
          className='px-2 py-1 rounded text-xs font-medium'
          style={{
            backgroundColor: 'rgba(156, 163, 175, 0.8)',
            color: 'white',
          }}
        >
          Awaiting Payment
        </span>
      )
    }
  }

  // Helper function to get product names from order items
  const getProductNames = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return 'No items'
    return order.orderItems.map((item) => item.name).join(', ')
  }

  return (
    <div
      style={{ backgroundColor: 'rgb(7, 10, 19)', minHeight: '100vh' }}
      className='py-8'
    >
      <div className='container mx-auto px-4 max-w-6xl'>
        <h2
          className='text-2xl font-semibold mb-6'
          style={{ color: 'rgba(211, 190, 249, 0.9)' }}
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
            <div className='grid md:grid-cols-2 gap-4 mb-6'>
              {/* Filter dropdown */}
              <div className='mb-4'>
                <label
                  className='block mb-2 text-sm font-medium'
                  style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                >
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className='w-full p-2.5 rounded-lg border text-sm outline-none'
                  style={{
                    backgroundColor: 'rgba(15, 20, 35, 0.8)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
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

              {/* Sort dropdown */}
              <div className='mb-4'>
                <label
                  className='block mb-2 text-sm font-medium'
                  style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                >
                  Sort By
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className='w-full p-2.5 rounded-lg border text-sm outline-none'
                  style={{
                    backgroundColor: 'rgba(15, 20, 35, 0.8)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
                  }}
                >
                  <option value='newest'>Newest First</option>
                  <option value='oldest'>Oldest First</option>
                  <option value='highest'>Highest Price</option>
                  <option value='lowest'>Lowest Price</option>
                </select>
              </div>
            </div>

            {getFilteredOrders().length === 0 ? (
              <div
                className='mt-8 p-6 rounded-lg shadow-lg'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(211, 190, 249, 0.2)',
                }}
              >
                No orders found
              </div>
            ) : (
              <div
                className='mt-8 overflow-x-auto rounded-lg shadow-lg border'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
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
                        backgroundColor: 'rgba(7, 10, 19, 0.6)',
                      }}
                    >
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        ORDER ID
                      </th>
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        DATE
                      </th>
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        PRODUCTS
                      </th>
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        TOTAL
                      </th>
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        STATUS
                      </th>
                      <th
                        className='px-4 py-3 text-left'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map((order, index) => (
                      <tr
                        key={order._id}
                        className={index % 2 === 0 ? '' : 'bg-opacity-10'}
                        style={{
                          backgroundColor:
                            index % 2 === 0
                              ? 'transparent'
                              : 'rgba(211, 190, 249, 0.05)',
                        }}
                      >
                        <td
                          className='p-4'
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {order._id}
                        </td>
                        <td
                          className='p-4'
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {order.createdAt.substring(0, 10)}
                        </td>
                        <td
                          className='p-4'
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {getProductNames(order)}
                        </td>
                        <td
                          className='p-4'
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          ${order.totalPrice}
                        </td>
                        <td className='p-4'>{renderStatusBadge(order)}</td>
                        <td className='p-4'>
                          <div className='space-y-2'>
                            <Link to={`/order/${order._id}`}>
                              <button
                                className='w-full text-center py-2 px-4 rounded text-sm transition-all'
                                style={{
                                  backgroundColor: 'rgba(211, 190, 249, 0.2)',
                                  color: 'rgba(211, 190, 249, 0.9)',
                                  border: '1px solid rgba(211, 190, 249, 0.3)',
                                }}
                              >
                                Details
                              </button>
                            </Link>

                            {!order.isPaid &&
                              !order.isCancelled &&
                              !order.paymentProofImage && (
                                <button
                                  className='w-full text-center py-2 px-4 rounded text-sm transition-all'
                                  style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: 'rgba(59, 130, 246, 0.9)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
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
                                className='w-full text-center py-2 px-4 rounded text-sm transition-all'
                                style={{
                                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                  color: 'rgba(220, 38, 38, 0.9)',
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Proof Upload Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center'>
          <div
            className='relative bg-opacity-100 rounded-lg shadow-lg max-w-md w-full p-6 mx-4'
            style={{
              backgroundColor: 'rgba(15, 20, 35, 0.95)',
              border: '1px solid rgba(211, 190, 249, 0.2)',
            }}
          >
            <div
              className='flex justify-between items-center mb-4 pb-2 border-b'
              style={{
                borderColor: 'rgba(211, 190, 249, 0.2)',
              }}
            >
              <h3
                className='text-xl font-semibold'
                style={{ color: 'rgba(211, 190, 249, 0.9)' }}
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
              <p className='mb-2' style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Order ID:{' '}
                <span style={{ color: 'rgba(211, 190, 249, 0.9)' }}>
                  {selectedOrder?._id}
                </span>
              </p>
              <p className='mb-4' style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Total Amount:{' '}
                <span style={{ color: 'rgba(211, 190, 249, 0.9)' }}>
                  ${selectedOrder?.totalPrice}
                </span>
              </p>

              <div className='mb-4'>
                <label
                  className='block mb-2 text-sm font-medium'
                  style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                >
                  Upload Image
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={uploadFileHandler}
                  className='block w-full text-sm rounded-lg cursor-pointer'
                  style={{
                    backgroundColor: 'rgba(15, 20, 35, 0.8)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(211, 190, 249, 0.2)',
                    padding: '0.5rem',
                  }}
                  disabled={uploading}
                />
                {uploading && (
                  <p
                    className='mt-2 text-sm'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
                    Uploading...
                  </p>
                )}
              </div>

              {image && (
                <div className='mt-4'>
                  <p
                    className='mb-2'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
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
                className='py-2 px-4 rounded transition-all'
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                }}
              >
                Close
              </button>
              <button
                onClick={submitPaymentProof}
                disabled={!image || uploading}
                className='py-2 px-4 rounded transition-all'
                style={{
                  backgroundColor:
                    !image || uploading
                      ? 'rgba(211, 190, 249, 0.4)'
                      : 'rgba(211, 190, 249, 0.9)',
                  color: 'rgb(7, 10, 19)',
                  cursor: !image || uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center'>
          <div
            className='relative bg-opacity-100 rounded-lg shadow-lg max-w-md w-full p-6 mx-4'
            style={{
              backgroundColor: 'rgba(15, 20, 35, 0.95)',
              border: '1px solid rgba(211, 190, 249, 0.2)',
            }}
          >
            <div
              className='flex justify-between items-center mb-4 pb-2 border-b'
              style={{
                borderColor: 'rgba(211, 190, 249, 0.2)',
              }}
            >
              <h3
                className='text-xl font-semibold'
                style={{ color: 'rgba(211, 190, 249, 0.9)' }}
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
              <p className='mb-4' style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Are you sure you want to cancel order #{selectedOrder?._id}?
              </p>

              <div className='mb-4'>
                <label
                  className='block mb-2 text-sm font-medium'
                  style={{ color: 'rgba(211, 190, 249, 0.9)' }}
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
                    backgroundColor: 'rgba(15, 20, 35, 0.8)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(211, 190, 249, 0.2)',
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
                className='py-2 px-4 rounded transition-all'
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                }}
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                className='py-2 px-4 rounded transition-all'
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.8)',
                  color: 'rgba(255, 255, 255, 0.9)',
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
