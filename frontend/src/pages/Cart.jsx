import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaTrash,
  FaArrowLeft,
  FaShoppingCart,
  FaPlus,
  FaMinus,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { setCart } from '../redux/features/cart/cartSlice'
import {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
} from '../redux/features/cart/cartApiSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'

const Cart = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart

  const { data, isLoading, error, refetch } = useGetCartQuery()
  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation()
  const [removeFromCartApi, { isLoading: isRemovingFromCart }] =
    useRemoveFromCartMutation()

  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (data) {
      dispatch(setCart(data))
    }
  }, [data, dispatch])

  const updateQuantityHandler = async (product, newQty) => {
    if (!userInfo) {
      navigate('/login')
      return
    }

    console.log('Attempting to update quantity:', {
      product: product.name,
      currentQty: product.qty,
      newQty: newQty,
    })

    // Convert and validate quantity
    const quantity = Number(newQty)
    if (isNaN(quantity) || quantity < 1) {
      toast.error('Quantity must be at least 1')
      return
    }

    // Calculate maximum allowed quantity
    // Ensure countInStock has a default value if it's undefined
    const countInStock = product.countInStock || 20
    const maxQty = Math.min(countInStock, 20)
    const validatedQty = Math.min(quantity, maxQty)

    try {
      // Only send the required information
      await addToCartApi({
        name: product.name,
        image: product.image,
        price: product.price,
        qty: validatedQty,
        product: product.product, // This is the product ID
      }).unwrap()

      // Always refetch to ensure we have the latest data
      refetch()
      toast.success('Cart updated successfully')
    } catch (err) {
      console.error('Cart update error:', err)
      toast.error(err?.data?.message || err.error || 'Failed to update cart')
    }
  }

  const removeFromCartHandler = async (id) => {
    try {
      await removeFromCartApi(id).unwrap()
      refetch()
      toast.success('Item removed from cart')
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to remove item')
    }
  }

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping')
    } else {
      navigate('/shipping')
    }
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return (
      <Message variant='danger'>
        {error?.data?.message || error.error || 'Error loading cart'}
      </Message>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='mb-6'>
        <Link
          to='/'
          className='text-gray-600 font-medium hover:text-gray-900 flex items-center transition-colors'
        >
          <FaArrowLeft className='mr-2' /> Go Back
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className='flex flex-col items-center justify-center bg-white p-12 rounded-lg border border-gray-200 shadow-sm'>
          <FaShoppingCart className='text-5xl text-gray-400 mb-4' />
          <p className='text-gray-800 text-xl mb-6'>Your cart is empty</p>
          <Link
            to='/shop'
            className='bg-gray-800 hover:bg-gray-700 text-white py-3 px-8 rounded-lg font-medium transition-colors'
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row gap-8'>
          <div className='flex-1'>
            <h1 className='text-3xl font-semibold mb-6 text-gray-800'>
              Shopping Cart
            </h1>

            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
              {cartItems.map((item) => {
                // Ensure countInStock has a default value
                const countInStock = item.countInStock || 20
                const maxQty = Math.min(countInStock, 20)

                // Force recalculate these values to ensure they're correct
                const canIncrease = Number(item.qty) < maxQty
                const canDecrease = Number(item.qty) > 1

                console.log(
                  `Item: ${item.name}, Qty: ${item.qty}, Max: ${maxQty}, Can increase: ${canIncrease}`
                )

                return (
                  <div
                    key={item._id}
                    className='flex flex-col sm:flex-row items-start sm:items-center p-6 border-b border-gray-200 last:border-b-0'
                  >
                    <div className='w-full sm:w-24 h-24 mb-4 sm:mb-0'>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='w-full h-full object-cover rounded-lg border border-gray-200'
                      />
                    </div>

                    <div className='flex-1 sm:ml-6'>
                      <Link
                        to={`/product/${item.product}`}
                        className='text-lg text-gray-800 hover:text-gray-600 font-medium'
                      >
                        {item.name}
                      </Link>
                      <div className='mt-1 text-gray-600'>{item.brand}</div>
                      <div className='mt-2 text-xl font-bold text-gray-800'>
                        ${item.price}
                      </div>
                    </div>

                    <div className='flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0'>
                      <div className='flex items-center mr-6 relative'>
                        <button
                          onClick={() =>
                            updateQuantityHandler(item, Number(item.qty) - 1)
                          }
                          disabled={!canDecrease || isAddingToCart}
                          className={`p-2 rounded-full ${
                            canDecrease
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          aria-label='Decrease quantity'
                          style={{ zIndex: 1 }}
                        >
                          <FaMinus />
                        </button>
                        <span className='mx-3 text-lg font-medium w-8 text-center'>
                          {item.qty}
                        </span>
                        {/* Fixed Plus Button */}
                        <button
                          onClick={() =>
                            updateQuantityHandler(item, Number(item.qty) + 1)
                          }
                          disabled={!canIncrease || isAddingToCart}
                          className={`p-2 rounded-full ${
                            canIncrease
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          aria-label='Increase quantity'
                          style={{ zIndex: 1, position: 'relative' }}
                        >
                          <FaPlus />
                        </button>

                        {/* Debug indicator to see if button is disabled */}
                        {!canIncrease && (
                          <div className='absolute right-0 top-0 text-xs text-red-500'>
                            (max)
                          </div>
                        )}
                      </div>

                      <button
                        className='text-gray-500 hover:text-red-500 transition-colors p-2'
                        onClick={() => removeFromCartHandler(item._id)}
                        disabled={isRemovingFromCart}
                        aria-label='Remove item'
                      >
                        {isRemovingFromCart ? (
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500'></div>
                        ) : (
                          <FaTrash className='text-lg' />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='w-full lg:w-96'>
            <div className='bg-white p-6 rounded-lg shadow-sm sticky top-6'>
              <h2 className='text-2xl font-semibold mb-6 pb-4 border-b border-gray-200 text-gray-800'>
                Order Summary
              </h2>

              <div className='space-y-4 mb-6'>
                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg'>Items:</span>
                  <span className='text-lg'>
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                </div>

                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg'>Subtotal:</span>
                  <span className='text-lg'>${cart.itemsPrice}</span>
                </div>

                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg'>Shipping:</span>
                  <span className='text-lg'>${cart.shippingPrice}</span>
                </div>

                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg'>Tax:</span>
                  <span className='text-lg'>${cart.taxPrice}</span>
                </div>

                <div className='flex justify-between font-bold text-xl text-gray-800 pt-4 border-t border-gray-200'>
                  <span>Total:</span>
                  <span>${cart.totalPrice}</span>
                </div>
              </div>

              <button
                className={`bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium w-full transition-colors ${
                  cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
