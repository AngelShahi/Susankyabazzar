import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useUploadPaymentProofMutation,
  useCancelOrderMutation,
  useInitializeKhaltiPaymentMutation,
} from '../../redux/api/orderApiSlice'
import { useUploadProductImageMutation } from '../../redux/api/productApiSlice'
import { FaPercentage } from 'react-icons/fa'

const Order = () => {
  const { id: orderId } = useParams()
  const location = useLocation()
  const [paymentProofImage, setPaymentProofImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId)

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation()
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation()
  const [uploadPaymentProof, { isLoading: loadingProofUpload }] =
    useUploadPaymentProofMutation()
  const [uploadProductImage] = useUploadProductImageMutation()
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation()
  const [initializeKhaltiPayment, { isLoading: loadingKhalti }] =
    useInitializeKhaltiPaymentMutation()

  const { userInfo } = useSelector((state) => state.auth)

  // Handle payment success notification
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    if (query.get('paymentSuccess') === 'true') {
      toast.success('Payment successful! Your order is now paid.')
      refetch() // Refresh order details to reflect paid status
    }
  }, [location, refetch])

  // Helper function to check if discount is active
  const isDiscountActive = (discount) => {
    if (!discount || !discount.active || !discount.endDate) return false
    try {
      return new Date(discount.endDate) >= new Date()
    } catch {
      return false // Invalid date format
    }
  }

  // Helper function to calculate original price
  const getOriginalPrice = (price, discount) => {
    if (!isDiscountActive(discount)) return price
    return price / (1 - discount.percentage / 100)
  }

  // Calculate total savings
  const totalSavings =
    order?.orderItems?.reduce((savings, item) => {
      if (isDiscountActive(item.discount)) {
        const originalPrice = getOriginalPrice(item.price, item.discount)
        const savingsPerItem = (originalPrice - item.price) * item.qty
        return savings + savingsPerItem
      }
      return savings
    }, 0) || 0

  const uploadFileHandler = async (e) => {
    const formData = new FormData()
    formData.append('image', e.target.files[0])
    try {
      setUploading(true)
      const res = await uploadProductImage(formData).unwrap()
      setPaymentProofImage(res.image)
      setUploading(false)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error(error?.data?.message || error.message)
      setUploading(false)
    }
  }

  const handlePaymentProofSubmit = async () => {
    if (!paymentProofImage) {
      toast.error('Please upload a payment proof image')
      return
    }

    try {
      await uploadPaymentProof({
        orderId,
        imageUrl: paymentProofImage,
      }).unwrap()
      refetch()
      toast.success('Payment proof uploaded successfully')
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

  const handlePayment = async () => {
    try {
      await payOrder({
        orderId,
        email_address: order.user?.email || '',
      }).unwrap()
      refetch()
      toast.success('Order has been marked as paid')
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap()
      refetch()
      toast.success('Order has been marked as delivered')
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

  const handleCancelOrder = async () => {
    try {
      await cancelOrder({
        orderId,
        reason: cancelReason,
      }).unwrap()
      refetch()
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      setCancelReason('')
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

  // Handle Khalti payment initiation
  const handleKhaltiPayment = async () => {
    try {
      const website_url = window.location.origin // Use current origin as website_url
      const res = await initializeKhaltiPayment({
        orderId,
        website_url,
      }).unwrap()
      if (res.payment?.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = res.payment.payment_url
      } else {
        toast.error('Failed to initialize Khalti payment')
      }
    } catch (error) {
      toast.error(error?.data?.message || error.message)
    }
  }

  // Determine payment details based on payment method
  const renderPaymentDetails = () => {
    switch (order.paymentMethod) {
      case 'Khalti':
        return (
          <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
            <p className='text-sm text-gray-400'>Payment Method</p>
            <p className='text-white'>Khalti Digital Wallet</p>
            {order.paymentResult?.transaction_id && (
              <>
                <p className='text-sm text-gray-400 mt-2'>Transaction ID</p>
                <p className='font-mono text-white truncate'>
                  {order.paymentResult.transaction_id}
                </p>
              </>
            )}
            {order.paymentResult?.status && (
              <>
                <p className='text-sm text-gray-400 mt-2'>Payment Status</p>
                <p className='text-white'>{order.paymentResult.status}</p>
              </>
            )}
          </div>
        )
      case 'QRPayment':
        return (
          <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
            <p className='text-sm text-gray-400'>Payment Method</p>
            <p className='text-white'>QR Code Payment</p>
            {order.paymentProofImage ? (
              <>
                <p className='text-sm text-gray-400 mt-2'>Payment Proof</p>
                <div className='border border-[rgba(211,190,249,0.3)] rounded-lg overflow-hidden mt-2'>
                  <img
                    src={order.paymentProofImage}
                    alt='QR Payment Proof'
                    className='w-full h-auto'
                  />
                </div>
              </>
            ) : (
              <p className='text-sm text-gray-400 mt-2'>
                Payment proof pending
              </p>
            )}
          </div>
        )
      case 'CashOnDelivery':
        return (
          <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
            <p className='text-sm text-gray-400'>Payment Method</p>
            <p className='text-white'>Cash on Delivery</p>
            <p className='text-sm text-gray-400 mt-2'>Payment Instructions</p>
            <p className='text-white'>
              Please prepare ${order.totalPrice} in cash for the delivery agent.
            </p>
          </div>
        )
      default:
        return (
          <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
            <p className='text-sm text-gray-400'>Payment Method</p>
            <p className='text-white'>Unknown</p>
          </div>
        )
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-[rgb(7,10,19)]'>
        <Loader />
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen bg-[rgb(7,10,19)] flex items-center justify-center'>
        <Message variant='danger'>{error.data.message}</Message>
      </div>
    )
  }

  // Main render
  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] py-8'>
      <div className='container mx-auto px-4 flex flex-col md:flex-row max-w-6xl gap-6'>
        <div className='md:w-2/3'>
          <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm mb-6 overflow-hidden'>
            <h2 className='text-xl font-bold mb-0 p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2 text-[rgb(211,190,249)]'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' />
              </svg>
              Order Items
            </h2>

            {order.orderItems.length === 0 ? (
              <div className='p-4'>
                <Message>Order is empty</Message>
              </div>
            ) : (
              <div className='overflow-x-auto p-4'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[rgba(211,190,249,0.1)] text-[rgb(211,190,249)]'>
                      <th className='p-3 text-left rounded-tl-md'>Image</th>
                      <th className='p-3 text-left'>Product</th>
                      <th className='p-3 text-center'>Quantity</th>
                      <th className='p-3 text-right'>Unit Price</th>
                      <th className='p-3 text-right rounded-tr-md'>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.orderItems.map((item, index) => {
                      const hasDiscount = isDiscountActive(item.discount)
                      const originalPrice = hasDiscount
                        ? getOriginalPrice(item.price, item.discount).toFixed(2)
                        : item.price.toFixed(2)
                      return (
                        <tr
                          key={index}
                          className={`border-b ${
                            index === order.orderItems.length - 1
                              ? ''
                              : 'border-[rgba(211,190,249,0.1)]'
                          } hover:bg-[rgba(211,190,249,0.05)] transition-colors`}
                        >
                          <td className='p-4 relative'>
                            <div className='w-20 h-20 rounded-md overflow-hidden border border-[rgba(211,190,249,0.3)]'>
                              <img
                                src={item.image}
                                alt={item.name}
                                className='w-full h-full object-cover'
                              />
                              {hasDiscount && (
                                <span className='absolute bottom-0 right-0 bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-bl-lg rounded-tr-lg z-10 flex items-center'>
                                  <FaPercentage size={10} className='mr-1' />
                                  {item.discount.percentage}% OFF
                                </span>
                              )}
                            </div>
                          </td>

                          <td className='p-4 text-gray-200'>
                            <Link
                              to={`/product/${item.product}`}
                              className='hover:text-[rgb(211,190,249)] transition-colors font-medium'
                            >
                              {item.name}
                            </Link>
                          </td>

                          <td className='p-4 text-center text-gray-200'>
                            <span className='bg-[rgba(211,190,249,0.1)] px-3 py-1 rounded-full'>
                              {item.qty}
                            </span>
                          </td>

                          <td className='p-4 text-right text-gray-200'>
                            {hasDiscount ? (
                              <div>
                                <span
                                  className='text-lg font-bold'
                                  style={{ color: 'rgba(74, 222, 128, 0.9)' }}
                                >
                                  ${item.price.toFixed(2)}
                                </span>
                                <span
                                  className='text-sm line-through ml-2'
                                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                >
                                  ${originalPrice}
                                </span>
                              </div>
                            ) : (
                              <span>${item.price.toFixed(2)}</span>
                            )}
                          </td>

                          <td className='p-4 text-right font-medium text-[rgb(211,190,249)]'>
                            ${(item.qty * item.price).toFixed(2)}
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

        <div className='md:w-1/3 space-y-6'>
          <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
            <h2 className='text-xl font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
              Shipping Details
            </h2>

            <div className='p-4 space-y-3 text-gray-300'>
              <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
                <p className='text-sm text-gray-400'>Order ID</p>
                <p className='font-mono text-white truncate'>{order._id}</p>
              </div>

              {order.user && (
                <div className='space-y-3'>
                  <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
                    <p className='text-sm text-gray-400'>Customer</p>
                    <p className='text-white'>{order.user.username}</p>
                  </div>

                  <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
                    <p className='text-sm text-gray-400'>Email</p>
                    <p className='text-white'>{order.user.email}</p>
                  </div>
                </div>
              )}

              <div className='bg-[rgba(211,190,249,0.05)] p-3 rounded-md border border-[rgba(211,190,249,0.1)]'>
                <p className='text-sm text-gray-400'>Address</p>
                <p className='text-white'>
                  {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
              </div>

              {renderPaymentDetails()}
            </div>
          </div>

          <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
            <h2 className='text-xl font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
              Order Summary
            </h2>

            <div className='p-4 space-y-2 text-gray-300'>
              <div className='flex justify-between mb-2'>
                <span>Items</span>
                <span className='font-medium'>${order.itemsPrice}</span>
              </div>

              {totalSavings > 0 && (
                <div className='flex justify-between mb-2'>
                  <span className='flex items-center'>
                    <FaPercentage className='mr-1 text-[rgba(74,222,128,0.9)]' />{' '}
                    Total Savings:
                  </span>
                  <span className='font-medium text-[rgba(74,222,128,0.9)]'>
                    -${totalSavings.toFixed(2)}
                  </span>
                </div>
              )}

              <div className='flex justify-between mb-2'>
                <span>Shipping</span>
                <span className='font-medium'>${order.shippingPrice}</span>
              </div>

              <div className='flex justify-between mb-2'>
                <span>Tax</span>
                <span className='font-medium'>${order.taxPrice}</span>
              </div>

              <div className='flex justify-between pt-3 border-t border-[rgba(211,190,249,0.2)] mt-3 font-bold text-white'>
                <span>Total</span>
                <span className='text-[rgb(211,190,249)]'>
                  ${order.totalPrice}
                </span>
              </div>
            </div>
          </div>

          <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
            <h2 className='text-xl font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
              Status
            </h2>
            <div className='p-4 space-y-3 text-gray-300'>
              <div className='flex gap-3'>
                <div
                  className={`flex-1 p-3 rounded-md border ${
                    order.isPaid
                      ? 'bg-[rgba(129,230,217,0.1)] border-[rgba(129,230,217,0.3)] text-[rgb(129,230,217)]'
                      : order.isCancelled
                      ? 'bg-[rgba(255,177,153,0.1)] border-[rgba(255,177,153,0.3)] text-[rgb(255,177,153)]'
                      : 'bg-[rgba(255,177,153,0.1)] border-[rgba(255,177,153,0.3)] text-[rgb(255,177,153)]'
                  }`}
                >
                  <p className='text-sm opacity-80'>Payment Status</p>
                  <div className='flex items-center'>
                    {order.isPaid ? (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span>
                          Paid on {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : order.isCancelled ? (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span>Order Cancelled</span>
                      </>
                    ) : (
                      <>
                        <span>Not paid</span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 p-3 rounded-md border ${
                    order.isDelivered
                      ? 'bg-[rgba(129,230,217,0.1)] border-[rgba(129,230,217,0.3)] text-[rgb(129,230,217)]'
                      : order.isCancelled
                      ? 'bg-[rgba(255,177,153,0.1)] border-[rgba(255,177,153,0.3)] text-[rgb(255,177,153)]'
                      : 'bg-[rgba(255,177,153,0.1)] border-[rgba(255,177,153,0.3)] text-[rgb(255,177,153)]'
                  }`}
                >
                  <p className='text-sm opacity-80'>Delivery Status</p>
                  <div className='flex items-center'>
                    {order.isDelivered ? (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span>
                          Delivered{' '}
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : order.isCancelled ? (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span>Order Cancelled</span>
                      </>
                    ) : (
                      <>
                        <span>Not delivered</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!order.isPaid &&
            !order.isCancelled &&
            userInfo &&
            !userInfo.isAdmin &&
            order.paymentMethod === 'Khalti' && (
              <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
                <h3 className='text-lg font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
                  Pay with Khalti
                </h3>
                <div className='p-4 space-y-4'>
                  <p className='text-gray-300'>
                    Click below to pay ${order.totalPrice} using Khalti Digital
                    Wallet.
                  </p>
                  <button
                    onClick={handleKhaltiPayment}
                    disabled={loadingKhalti}
                    className='bg-[rgb(211,190,249)] hover:bg-[rgb(191,170,229)] text-[rgb(7,10,19)] py-3 px-4 rounded-md transition-colors font-semibold w-full flex items-center justify-center'
                  >
                    {loadingKhalti ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-2'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Pay with Khalti
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          {!order.isPaid &&
            !order.isCancelled &&
            userInfo &&
            !userInfo.isAdmin &&
            order.paymentMethod === 'QRPayment' && (
              <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
                <h3 className='text-lg font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
                  Upload Payment Proof
                </h3>

                <div className='p-4 space-y-4'>
                  {order.paymentProofImage ? (
                    <div className='mb-4'>
                      <p className='text-gray-300 mb-2'>
                        Payment proof uploaded
                      </p>
                      <div className='border border-[rgba(211,190,249,0.3)] rounded-lg overflow-hidden'>
                        <img
                          src={order.paymentProofImage}
                          alt='Payment Proof'
                          className='w-full h-auto'
                        />
                      </div>
                      <div className='mt-3 flex items-center justify-center p-2 bg-[rgba(129,230,217,0.1)] border border-[rgba(129,230,217,0.3)] rounded-md text-[rgb(129,230,217)]'>
                        <span className='text-sm'>
                          Waiting for admin approval
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-[rgb(211,190,249)] mb-2'>
                          Upload Receipt/Screenshot
                        </label>
                        <div className='border-2 border-dashed border-[rgba(211,190,249,0.3)] rounded-lg p-4 text-center cursor-pointer hover:border-[rgb(211,190,249)] transition-colors'>
                          <input
                            type='file'
                            className='hidden'
                            id='payment-proof'
                            onChange={uploadFileHandler}
                          />
                          <label
                            htmlFor='payment-proof'
                            className='cursor-pointer'
                          >
                            <p className='mt-2 text-sm text-gray-400'>
                              Click to select or drag and drop
                            </p>
                            <p className='text-xs text-gray-500'>
                              JPG, PNG or PDF (Max 5MB)
                            </p>
                          </label>
                        </div>
                        {uploading && (
                          <div className='mt-4 flex justify-center'>
                            <Loader />
                          </div>
                        )}
                      </div>

                      {paymentProofImage && (
                        <div className='mt-4 space-y-4'>
                          <div className='border border-[rgba(211,190,249,0.3)] rounded-lg overflow-hidden'>
                            <img
                              src={paymentProofImage}
                              alt='Payment Preview'
                              className='w-full h-auto'
                            />
                          </div>
                          <button
                            onClick={handlePaymentProofSubmit}
                            disabled={loadingProofUpload}
                            className='bg-[rgb(211,190,249)] hover:bg-[rgb(191,170,229)] text-[rgb(7,10,19)] py-3 px-4 rounded-md transition-colors font-semibold w-full flex items-center justify-center'
                          >
                            {loadingProofUpload ? (
                              <>Submitting...</>
                            ) : (
                              <>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='h-5 w-5 mr-2'
                                  viewBox='0 0 20 20'
                                  fill='currentColor'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                                Submit Payment Proof
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className='flex items-center justify-center gap-2 text-gray-400 mt-3 p-3 bg-[rgba(211,190,249,0.05)] rounded-md'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-[rgb(211,190,249)]'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        <span className='text-sm'>
                          Upload a clear receipt screenshot
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {!order.isPaid &&
            !order.isCancelled &&
            userInfo &&
            !userInfo.isAdmin && (
              <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
                <h3 className='text-lg font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
                  Order Actions
                </h3>
                <div className='p-4'>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className='bg-[rgba(220,38,38,0.1)] hover:bg-[rgba(220,38,38,0.2)] text-[rgb(255,177,153)] border border-[rgba(220,38,38,0.3)] py-3 px-4 rounded-md transition-colors font-semibold w-full flex items-center justify-center'
                    disabled={order.paymentMethod === 'Khalti' && order.isPaid}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

          {order.isCancelled && (
            <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
              <h3 className='text-lg font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(220,38,38,0.1)] text-white flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2 text-[rgb(255,177,153)]'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
                Order Cancelled
              </h3>
              <div className='p-4'>
                <p className='text-sm text-gray-400 mb-1'>
                  Cancellation Reason:
                </p>
                <p className='text-white bg-[rgba(220,38,38,0.05)] p-3 rounded-md border border-[rgba(220,38,38,0.2)]'>
                  {order.cancellationReason || 'No reason provided'}
                </p>
                <p className='text-sm text-gray-400 mt-4 mb-1'>Cancelled On:</p>
                <p className='text-white'>
                  {order.cancelledAt
                    ? new Date(order.cancelledAt).toLocaleString()
                    : 'Date not recorded'}
                </p>
              </div>
            </div>
          )}

          {userInfo &&
            userInfo.isAdmin &&
            !order.isPaid &&
            !order.isCancelled && (
              <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
                <h3 className='text-lg font-bold p-4 border-b border-[rgba(211,190,249,0.2)] bg-[rgba(211,190,249,0.1)] text-white flex items-center'>
                  Payment Verification
                </h3>

                <div className='p-4 space-y-4'>
                  {order.paymentProofImage &&
                    order.paymentMethod === 'QRPayment' && (
                      <div className='border border-[rgba(211,190,249,0.3)] rounded-lg overflow-hidden'>
                        <img
                          src={order.paymentProofImage}
                          alt='Payment Proof'
                          className='w-full h-auto'
                        />
                      </div>
                    )}
                  <button
                    onClick={handlePayment}
                    disabled={loadingPay}
                    className='bg-[rgb(129,230,217)] hover:bg-[rgb(109,210,197)] text-gray-900 py-3 px-4 rounded-md transition-colors font-semibold w-full flex items-center justify-center'
                  >
                    {loadingPay ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-2'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                        Mark as Paid
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          {userInfo &&
            userInfo.isAdmin &&
            order.isPaid &&
            !order.isDelivered &&
            !order.isCancelled && (
              <div className='border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg shadow-[rgba(211,190,249,0.1)] bg-[rgba(15,18,30,0.95)] backdrop-blur-sm overflow-hidden'>
                <div className='p-4'>
                  <button
                    onClick={deliverHandler}
                    disabled={loadingDeliver}
                    className='bg-[rgb(129,230,217)] hover:bg-[rgb(109,210,197)] text-gray-900 py-3 px-4 rounded-md transition-colors font-semibold w-full flex items-center justify-center'
                  >
                    {loadingDeliver ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 mr-2'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
                          <path d='M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0017 2h-3a1 1 0 00-1 1v8h-2V4a1 1 0 00-1-1H3z' />
                        </svg>
                        Mark as Delivered
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      {showCancelModal && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-[rgba(15,18,30,0.95)] border border-[rgba(211,190,249,0.3)] rounded-lg shadow-lg max-w-md w-full p-6'>
            <h3 className='text-xl font-bold mb-4 text-white'>Cancel Order</h3>
            <p className='text-gray-300 mb-4'>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-[rgb(211,190,249)] mb-2'>
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full bg-[rgba(211,190,249,0.05)] border border-[rgba(211,190,249,0.3)] rounded-md p-3 text-white'
                rows='3'
                placeholder='Please provide a reason for cancellation'
              ></textarea>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowCancelModal(false)}
                className='flex-1 bg-[rgba(211,190,249,0.1)] hover:bg-[rgba(211,190,249,0.2)] text-white border border-[rgba(211,190,249,0.3)] py-2 px-4 rounded-md transition-colors'
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loadingCancel}
                className='flex-1 bg-[rgba(220,38,38,0.1)] hover:bg-[rgba(220,38,38,0.2)] text-[rgb(255,177,153)] border border-[rgba(220,38,38,0.3)] py-2 px-4 rounded-md transition-colors'
              >
                {loadingCancel ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Order
