import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../../components/Message'
import ProgressSteps from '../../components/ProgressSteps'
import Loader from '../../components/Loader'
import { useCreateOrderMutation } from '../../redux/api/orderApiSlice'
import { useClearCartMutation } from '../../redux/features/cart/cartApiSlice'

const PlaceOrder = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const user = useSelector((state) => state.auth.userInfo)

  const [createOrder, { isLoading, error }] = useCreateOrderMutation()
  const [clearCart] = useClearCartMutation()

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping')
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate])

  const placeOrderHandler = async () => {
    try {
      // Get user info from Redux state
      if (!user || !user._id) {
        toast.error('Please login to place an order')
        navigate('/login')
        return
      }

      // Calculate total savings from discounts
      const totalSavings = cart.cartItems.reduce((acc, item) => {
        if (item.discount?.active) {
          const discountAmount = (item.price * item.discount.percentage) / 100
          return acc + discountAmount * item.qty
        }
        return acc
      }, 0)

      const orderData = {
        user: user._id,
        orderItems: cart.cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          // FIX: Extract the product ID properly
          product:
            typeof item.product === 'object' ? item.product._id : item.product,
          discount: item.discount || {
            percentage: 0,
            active: false,
            startDate: null,
            endDate: null,
            name: '',
          },
        })),
        shippingAddress: {
          address: cart.shippingAddress.address || '',
          city: cart.shippingAddress.city || '',
          postalCode: cart.shippingAddress.postalCode || '',
          country: cart.shippingAddress.country || '',
        },
        paymentMethod: cart.paymentMethod || 'Esewa',
        itemsPrice: cart.itemsPrice || 0,
        shippingPrice: cart.shippingPrice || 0,
        taxPrice: cart.taxPrice || 0,
        totalPrice: cart.totalPrice || 0,
        totalSavings: totalSavings,
        isPaid: false,
        isDelivered: false,
        isCancelled: false,
        paymentProofImage: '',
        paymentResult: {},
        cancellationReason: '',
      }

      console.log('Order data being sent:', orderData) // Debug log

      const res = await createOrder(orderData).unwrap()

      // Clear cart after successful order
      await clearCart().unwrap()

      navigate(`/order/${res._id}`)
    } catch (error) {
      console.error('Order creation error:', error) // Better error logging

      // Handle different error types
      if (error?.data?.message) {
        toast.error(error.data.message)
      } else if (error?.message) {
        toast.error(error.message)
      } else if (error?.error) {
        toast.error(error.error)
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    }
  }

  return (
    <div
      style={{ backgroundColor: 'rgb(7, 10, 19)', minHeight: '100vh' }}
      className='py-8'
    >
      <div className='container mx-auto px-4 max-w-6xl'>
        <ProgressSteps step1 step2 step3 />

        {cart.cartItems.length === 0 ? (
          <div
            className='mt-8 p-6 rounded-lg shadow-lg'
            style={{
              backgroundColor: 'rgba(15, 20, 35, 0.8)',
              color: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(211, 190, 249, 0.2)',
            }}
          >
            Your cart is empty
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
                    Image
                  </th>
                  <th
                    className='px-4 py-3 text-left'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
                    Product
                  </th>
                  <th
                    className='px-4 py-3 text-left'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
                    Quantity
                  </th>
                  <th
                    className='px-4 py-3 text-left'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
                    Price
                  </th>
                  <th
                    className='px-4 py-3 text-left'
                    style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                  >
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? '' : 'bg-opacity-10'}
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? 'transparent'
                          : 'rgba(211, 190, 249, 0.05)',
                    }}
                  >
                    <td className='p-4'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-16 h-16 object-cover rounded border'
                        style={{ borderColor: 'rgba(211, 190, 249, 0.3)' }}
                      />
                    </td>

                    <td
                      className='p-4'
                      style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <Link
                        to={`/product/${
                          typeof item.product === 'object'
                            ? item.product._id
                            : item.product
                        }`}
                        className='hover:text-purple-300 transition-colors'
                        style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td
                      className='p-4'
                      style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      {item.qty}
                    </td>
                    <td
                      className='p-4'
                      style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      ₨ {item.price}
                    </td>
                    <td
                      className='p-4 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                    >
                      ₨ {item.qty * item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className='mt-8'>
          <h2
            className='text-2xl font-semibold mb-5'
            style={{ color: 'rgba(211, 190, 249, 0.9)' }}
          >
            Order Summary
          </h2>

          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            {/* Left column */}
            <div className='space-y-6'>
              <div
                className='p-6 rounded-lg shadow-lg border'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
                  borderColor: 'rgba(211, 190, 249, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h2
                  className='text-xl font-semibold mb-4 pb-2 border-b'
                  style={{
                    color: 'rgba(211, 190, 249, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
                  }}
                >
                  Order Details
                </h2>
                <ul className='space-y-3'>
                  <li
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span>Items:</span>
                    <span className='font-medium'>₨ {cart.itemsPrice}</span>
                  </li>
                  <li
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span>Shipping:</span>
                    <span className='font-medium'>₨ {cart.shippingPrice}</span>
                  </li>
                  <li
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span>Tax:</span>
                    <span className='font-medium'>₨ {cart.taxPrice}</span>
                  </li>
                  <li
                    className='flex justify-between font-bold pt-3 border-t mt-3'
                    style={{
                      color: 'rgba(211, 190, 249, 1)',
                      borderColor: 'rgba(211, 190, 249, 0.2)',
                    }}
                  >
                    <span>Total:</span>
                    <span>₨ {cart.totalPrice}</span>
                  </li>
                </ul>
              </div>

              {error && (
                <Message variant='danger'>
                  {error.data?.message || error.message || 'An error occurred'}
                </Message>
              )}
            </div>

            {/* Right column */}
            <div className='space-y-6'>
              <div
                className='p-6 rounded-lg shadow-lg border'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
                  borderColor: 'rgba(211, 190, 249, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h2
                  className='text-xl font-semibold mb-4 pb-2 border-b'
                  style={{
                    color: 'rgba(211, 190, 249, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
                  }}
                >
                  Shipping
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <strong style={{ color: 'rgba(211, 190, 249, 0.8)' }}>
                    Address:
                  </strong>{' '}
                  {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                  {cart.shippingAddress.postalCode},{' '}
                  {cart.shippingAddress.country}
                </p>
              </div>

              <div
                className='p-6 rounded-lg shadow-lg border'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
                  borderColor: 'rgba(211, 190, 249, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h2
                  className='text-xl font-semibold mb-4 pb-2 border-b'
                  style={{
                    color: 'rgba(211, 190, 249, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
                  }}
                >
                  Payment Method
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <strong style={{ color: 'rgba(211, 190, 249, 0.8)' }}>
                    Method:
                  </strong>{' '}
                  {cart.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <button
            type='button'
            className='py-3 px-6 rounded-lg text-lg w-full mt-4 transition-all font-medium'
            style={{
              backgroundColor:
                cart.cartItems.length === 0
                  ? 'rgba(211, 190, 249, 0.4)'
                  : 'rgba(211, 190, 249, 0.9)',
              color: 'rgb(7, 10, 19)',
              boxShadow:
                cart.cartItems.length === 0
                  ? 'none'
                  : '0 4px 12px rgba(211, 190, 249, 0.5)',
              transform: 'translateY(0)',
            }}
            onMouseOver={(e) => {
              if (cart.cartItems.length !== 0) {
                e.currentTarget.style.backgroundColor = 'rgba(211, 190, 249, 1)'
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(211, 190, 249, 0.7)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseOut={(e) => {
              if (cart.cartItems.length !== 0) {
                e.currentTarget.style.backgroundColor =
                  'rgba(211, 190, 249, 0.9)'
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(211, 190, 249, 0.5)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
            disabled={cart.cartItems.length === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
