import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaTrash } from 'react-icons/fa'
import { addToCart, removeFromCart } from '../redux/features/cart/cartSlice'

const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }))
  }

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping')
  }

  return (
    <div className='container mx-auto px-4 max-w-6xl py-8'>
      {cartItems.length === 0 ? (
        <div className='flex flex-col items-center justify-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm'>
          <p className='text-gray-800 text-xl mb-4'>Your cart is empty</p>
          <Link
            to='/shop'
            className='bg-gray-700 hover:bg-gray-800 text-white py-2 px-6 rounded transition-colors'
          >
            Go To Shop
          </Link>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='flex-1'>
            <h1 className='text-2xl font-semibold mb-6 text-gray-800'>
              Shopping Cart
            </h1>

            <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className='flex flex-col sm:flex-row items-start sm:items-center p-4 border-b border-gray-200 last:border-b-0'
                >
                  <div className='w-full sm:w-20 h-20 mb-4 sm:mb-0'>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='w-full h-full object-cover rounded border border-gray-200'
                    />
                  </div>

                  <div className='flex-1 sm:ml-4'>
                    <Link
                      to={`/product/${item._id}`}
                      className='text-gray-800 hover:text-gray-600 font-medium'
                    >
                      {item.name}
                    </Link>

                    <div className='mt-1 text-gray-600'>{item.brand}</div>
                    <div className='mt-1 text-gray-800 font-bold'>
                      ${item.price}
                    </div>
                  </div>

                  <div className='flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0'>
                    <div className='w-24 mr-4'>
                      <select
                        className='w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-800'
                        value={item.qty}
                        onChange={(e) =>
                          addToCartHandler(item, Number(e.target.value))
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className='text-gray-500 hover:text-red-500 transition-colors'
                      onClick={() => removeFromCartHandler(item._id)}
                      aria-label='Remove item'
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='w-full lg:w-80 mt-6 lg:mt-0'>
            <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
              <h2 className='text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800'>
                Order Summary
              </h2>

              <div className='space-y-3 mb-4'>
                <div className='flex justify-between text-gray-700'>
                  <span>Items:</span>
                  <span>
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                </div>

                <div className='flex justify-between text-gray-700'>
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className='flex justify-between font-bold text-gray-800 pt-3 border-t border-gray-200'>
                  <span>Total:</span>
                  <span>
                    $
                    {cartItems
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className='bg-gray-700 hover:bg-gray-800 text-white py-3 px-4 rounded font-medium w-full transition-colors'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
