import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useUploadPaymentProofMutation,
} from '../../redux/api/orderApiSlice'
import { useUploadProductImageMutation } from '../../redux/api/productApiSlice'

const Order = () => {
  const { id: orderId } = useParams()
  const [paymentProofImage, setPaymentProofImage] = useState('')
  const [uploading, setUploading] = useState(false)

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

  const { userInfo } = useSelector((state) => state.auth)

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
      // Admin function to mark order as paid
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

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error.data.message}</Message>
  ) : (
    <div className='container mx-auto px-4 bg-white flex flex-col md:flex-row max-w-6xl'>
      <div className='md:w-2/3 pr-0 md:pr-6'>
        <div className='border border-gray-200 mt-5 pb-4 mb-5 rounded-lg shadow-sm bg-white'>
          <h2 className='text-xl font-bold mb-4 p-4 border-b border-gray-200 bg-gray-50'>
            Order Items
          </h2>
          {order.orderItems.length === 0 ? (
            <Message>Order is empty</Message>
          ) : (
            <div className='overflow-x-auto p-4'>
              <table className='w-full'>
                <thead className='border-b border-gray-200'>
                  <tr className='bg-gray-50'>
                    <th className='p-2 text-left text-gray-700'>Image</th>
                    <th className='p-2 text-left text-gray-700'>Product</th>
                    <th className='p-2 text-center text-gray-700'>Quantity</th>
                    <th className='p-2 text-right text-gray-700'>Unit Price</th>
                    <th className='p-2 text-right text-gray-700'>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className='p-2'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-16 h-16 object-cover rounded border border-gray-200'
                        />
                      </td>

                      <td className='p-2 text-gray-800'>
                        <Link
                          to={`/product/${item.product}`}
                          className='hover:text-gray-600 transition-colors'
                        >
                          {item.name}
                        </Link>
                      </td>

                      <td className='p-2 text-center text-gray-800'>
                        {item.qty}
                      </td>
                      <td className='p-2 text-right text-gray-800'>
                        ${item.price}
                      </td>
                      <td className='p-2 text-right font-medium text-gray-800'>
                        ${(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className='md:w-1/3'>
        <div className='mt-5 border border-gray-200 rounded-lg shadow-sm p-4 mb-4 bg-white'>
          <h2 className='text-xl font-bold mb-2 pb-2 border-b border-gray-200 text-gray-800'>
            Shipping Details
          </h2>
          <p className='mb-3 mt-4'>
            <strong className='text-gray-700'>Order:</strong>{' '}
            <span className='text-gray-600'>{order._id}</span>
          </p>

          {/* Fixed: Added conditional check for order.user */}
          {order.user && (
            <>
              <p className='mb-3'>
                <strong className='text-gray-700'>Name:</strong>{' '}
                <span className='text-gray-600'>{order.user.username}</span>
              </p>

              <p className='mb-3'>
                <strong className='text-gray-700'>Email:</strong>{' '}
                <span className='text-gray-600'>{order.user.email}</span>
              </p>
            </>
          )}

          <p className='mb-3'>
            <strong className='text-gray-700'>Address:</strong>{' '}
            <span className='text-gray-600'>
              {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
              {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </span>
          </p>

          <p className='mb-3'>
            <strong className='text-gray-700'>Method:</strong>{' '}
            <span className='text-gray-600'>{order.paymentMethod}</span>
          </p>

          <div className='mt-4'>
            {order.isPaid ? (
              <div className='bg-gray-100 border border-gray-300 text-gray-700 p-3 rounded'>
                Paid on {order.paidAt}
              </div>
            ) : (
              <div className='bg-gray-100 border border-gray-300 text-gray-700 p-3 rounded'>
                Not paid
              </div>
            )}

            <div className='mt-3'>
              {order.isDelivered ? (
                <div className='bg-gray-100 border border-gray-300 text-gray-700 p-3 rounded'>
                  Delivered on {order.deliveredAt}
                </div>
              ) : (
                <div className='bg-gray-100 border border-gray-300 text-gray-700 p-3 rounded'>
                  Not delivered
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='border border-gray-200 rounded-lg shadow-sm p-4 mb-6 bg-white'>
          <h2 className='text-xl font-bold mb-4 pb-2 border-b border-gray-200 text-gray-800'>
            Order Summary
          </h2>
          <div className='flex justify-between mb-2 text-gray-700'>
            <span>Items</span>
            <span>$ {order.itemsPrice}</span>
          </div>
          <div className='flex justify-between mb-2 text-gray-700'>
            <span>Shipping</span>
            <span>$ {order.shippingPrice}</span>
          </div>
          <div className='flex justify-between mb-2 text-gray-700'>
            <span>Tax</span>
            <span>$ {order.taxPrice}</span>
          </div>
          <div className='flex justify-between pt-2 border-t border-gray-200 mt-2 font-bold text-gray-800'>
            <span>Total</span>
            <span>$ {order.totalPrice}</span>
          </div>
        </div>

        {/* Payment proof section for customers */}
        {!order.isPaid && userInfo && !userInfo.isAdmin && (
          <div className='border border-gray-200 rounded-lg shadow-sm p-4 mb-6 bg-white'>
            <h3 className='text-lg font-bold mb-3 pb-2 border-b border-gray-200 text-gray-800'>
              Upload Payment Proof
            </h3>

            {order.paymentProofImage ? (
              <div className='mb-4'>
                <p className='text-gray-700 mb-2'>Payment proof uploaded</p>
                <img
                  src={order.paymentProofImage}
                  alt='Payment Proof'
                  className='w-full h-auto rounded-md border border-gray-200'
                />
                <p className='text-sm text-gray-500 mt-2'>
                  Waiting for admin approval
                </p>
              </div>
            ) : (
              <div className='mb-4'>
                <div className='mb-3'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Upload Receipt/Screenshot
                  </label>
                  <input
                    type='file'
                    className='mt-1 w-full border border-gray-300 p-2 rounded bg-gray-50'
                    onChange={uploadFileHandler}
                  />
                  {uploading && <Loader />}
                </div>

                {paymentProofImage && (
                  <div className='mt-4'>
                    <img
                      src={paymentProofImage}
                      alt='Payment Preview'
                      className='w-full h-auto rounded-md border border-gray-200 mb-3'
                    />
                    <button
                      onClick={handlePaymentProofSubmit}
                      disabled={loadingProofUpload}
                      className='bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded transition-colors font-semibold w-full'
                    >
                      {loadingProofUpload
                        ? 'Submitting...'
                        : 'Submit Payment Proof'}
                    </button>
                  </div>
                )}

                <div className='flex items-center justify-center gap-2 text-gray-500 mt-3'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm'>Upload receipt screenshot</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin controls - view proof and mark as paid */}
        {userInfo &&
          userInfo.isAdmin &&
          !order.isPaid &&
          order.paymentProofImage && (
            <div className='border border-gray-200 rounded-lg shadow-sm p-4 mb-6 bg-white'>
              <h3 className='text-lg font-bold mb-3 pb-2 border-b border-gray-200 text-gray-800'>
                Payment Proof
              </h3>
              <div className='mb-4'>
                <img
                  src={order.paymentProofImage}
                  alt='Payment Proof'
                  className='w-full h-auto rounded-md border border-gray-200 mb-3'
                />
                <button
                  onClick={handlePayment}
                  className='bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded transition-colors font-semibold w-full'
                  disabled={loadingPay}
                >
                  {loadingPay ? 'Processing...' : 'Verify & Mark As Paid'}
                </button>
              </div>
            </div>
          )}

        {/* Admin controls - mark as delivered */}
        {loadingDeliver && <Loader />}
        {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
          <div className='mt-4 mb-6'>
            <button
              type='button'
              className='bg-gray-700 hover:bg-gray-800 text-white w-full py-2 rounded transition-colors'
              onClick={deliverHandler}
            >
              Mark As Delivered
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order
