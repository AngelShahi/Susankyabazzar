import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../../components/Message'
import ProgressSteps from '../../components/ProgressSteps'
import Loader from '../../components/Loader'
import { useCreateOrderMutation } from '../../redux/api/orderApiSlice'
import { clearCartItems } from '../../redux/features/cart/cartSlice'

const PlaceOrder = () => {
  const navigate = useNavigate()

  const cart = useSelector((state) => state.cart)

  const [createOrder, { isLoading, error }] = useCreateOrderMutation()

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping')
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate])

  const dispatch = useDispatch()

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap()
      dispatch(clearCartItems())
      navigate(`/order/${res._id}`)
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className='container mx-auto mt-8 px-4 max-w-6xl'>
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className='overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white mb-8'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='px-4 py-3 text-left text-gray-700'>Image</th>
                  <th className='px-4 py-3 text-left text-gray-700'>Product</th>
                  <th className='px-4 py-3 text-left text-gray-700'>
                    Quantity
                  </th>
                  <th className='px-4 py-3 text-left text-gray-700'>Price</th>
                  <th className='px-4 py-3 text-left text-gray-700'>Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className='p-4'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-16 h-16 object-cover rounded border border-gray-200'
                      />
                    </td>

                    <td className='p-4 text-gray-800'>
                      <Link
                        to={`/product/${item.product}`}
                        className='hover:text-gray-600 transition-colors'
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className='p-4 text-gray-800'>{item.qty}</td>
                    <td className='p-4 text-gray-800'>
                      ${item.price.toFixed(2)}
                    </td>
                    <td className='p-4 font-medium text-gray-800'>
                      ${(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className='mt-8'>
          <h2 className='text-2xl font-semibold mb-5 text-gray-800'>
            Order Summary
          </h2>

          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            {/* Left column */}
            <div className='space-y-6'>
              <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm'>
                <h2 className='text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800'>
                  Order Details
                </h2>
                <ul className='space-y-3'>
                  <li className='flex justify-between text-gray-700'>
                    <span>Items:</span>
                    <span className='font-medium'>${cart.itemsPrice}</span>
                  </li>
                  <li className='flex justify-between text-gray-700'>
                    <span>Shipping:</span>
                    <span className='font-medium'>${cart.shippingPrice}</span>
                  </li>
                  <li className='flex justify-between text-gray-700'>
                    <span>Tax:</span>
                    <span className='font-medium'>${cart.taxPrice}</span>
                  </li>
                  <li className='flex justify-between text-gray-800 font-bold pt-3 border-t border-gray-200 mt-3'>
                    <span>Total:</span>
                    <span>${cart.totalPrice}</span>
                  </li>
                </ul>
              </div>

              {error && (
                <Message variant='danger'>{error.data.message}</Message>
              )}
            </div>

            {/* Right column */}
            <div className='space-y-6'>
              <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm'>
                <h2 className='text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800'>
                  Shipping
                </h2>
                <p className='text-gray-700'>
                  <strong className='text-gray-800'>Address:</strong>{' '}
                  {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                  {cart.shippingAddress.postalCode},{' '}
                  {cart.shippingAddress.country}
                </p>
              </div>

              <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm'>
                <h2 className='text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800'>
                  Payment Method
                </h2>
                <p className='text-gray-700'>
                  <strong className='text-gray-800'>Method:</strong>{' '}
                  {cart.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <button
            type='button'
            className='bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-lg text-lg w-full mt-4 transition-colors font-medium'
            disabled={cart.cartItems === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  )
}

export default PlaceOrder
