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
    <div
      style={{ backgroundColor: 'rgb(7, 10, 19)', minHeight: '100vh' }}
      className='py-8'
    >
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='mb-6'>
          <Link
            to='/'
            className='text-gray-300 font-medium hover:text-purple-300 flex items-center transition-colors'
            style={{ color: 'rgba(211, 190, 249, 0.8)' }}
          >
            <FaArrowLeft className='mr-2' /> Go Back
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div
            className='flex flex-col items-center justify-center rounded-lg border p-12 shadow-lg'
            style={{
              backgroundColor: 'rgba(15, 20, 35, 0.8)',
              borderColor: 'rgba(211, 190, 249, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <FaShoppingCart
              className='mb-4 text-5xl'
              style={{ color: 'rgba(211, 190, 249, 0.7)' }}
            />
            <p
              className='mb-6 text-xl'
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Your cart is empty
            </p>
            <Link
              to='/shop'
              className='rounded-lg font-medium py-3 px-8 transition-colors'
              style={{
                backgroundColor: 'rgba(211, 190, 249, 0.9)',
                color: 'rgb(7, 10, 19)',
                boxShadow: '0 4px 12px rgba(211, 190, 249, 0.5)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(211, 190, 249, 1)'
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(211, 190, 249, 0.7)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(211, 190, 249, 0.9)'
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(211, 190, 249, 0.5)'
              }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-8'>
            <div className='flex-1'>
              <h1
                className='text-3xl font-semibold mb-6'
                style={{ color: 'rgba(211, 190, 249, 0.9)' }}
              >
                Shopping Cart
              </h1>

              <div
                className='rounded-lg overflow-hidden shadow-lg'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.8)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
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
                      className='flex flex-col sm:flex-row items-start sm:items-center p-6 border-b last:border-b-0'
                      style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
                    >
                      <div className='w-full sm:w-24 h-24 mb-4 sm:mb-0'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover rounded-lg border'
                          style={{ borderColor: 'rgba(211, 190, 249, 0.3)' }}
                        />
                      </div>

                      <div className='flex-1 sm:ml-6'>
                        <Link
                          to={`/product/${item.product}`}
                          className='text-lg font-medium hover:text-purple-300'
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          {item.name}
                        </Link>
                        <div
                          className='mt-1'
                          style={{ color: 'rgba(211, 190, 249, 0.7)' }}
                        >
                          {item.brand}
                        </div>
                        <div
                          className='mt-2 text-xl font-bold'
                          style={{ color: 'rgba(211, 190, 249, 0.9)' }}
                        >
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
                                ? 'hover:bg-purple-900'
                                : 'cursor-not-allowed'
                            }`}
                            style={{
                              color: canDecrease
                                ? 'rgba(211, 190, 249, 0.8)'
                                : 'rgba(211, 190, 249, 0.3)',
                              backgroundColor: canDecrease
                                ? 'rgba(211, 190, 249, 0.1)'
                                : 'transparent',
                            }}
                            aria-label='Decrease quantity'
                          >
                            <FaMinus />
                          </button>
                          <span
                            className='mx-3 text-lg font-medium w-8 text-center'
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
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
                                ? 'hover:bg-purple-900'
                                : 'cursor-not-allowed'
                            }`}
                            style={{
                              color: canIncrease
                                ? 'rgba(211, 190, 249, 0.8)'
                                : 'rgba(211, 190, 249, 0.3)',
                              backgroundColor: canIncrease
                                ? 'rgba(211, 190, 249, 0.1)'
                                : 'transparent',
                            }}
                            aria-label='Increase quantity'
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
                          className='transition-colors p-2 rounded-full hover:bg-red-900/30'
                          style={{ color: 'rgba(255, 120, 120, 0.8)' }}
                          onClick={() => removeFromCartHandler(item._id)}
                          disabled={isRemovingFromCart}
                          aria-label='Remove item'
                        >
                          {isRemovingFromCart ? (
                            <div
                              className='animate-spin rounded-full h-5 w-5 border-b-2'
                              style={{
                                borderColor: 'rgba(211, 190, 249, 0.7)',
                              }}
                            ></div>
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
              <div
                className='p-6 rounded-lg shadow-lg sticky top-6'
                style={{
                  backgroundColor: 'rgba(15, 20, 35, 0.9)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  borderLeft: '1px solid rgba(211, 190, 249, 0.3)',
                }}
              >
                <h2
                  className='text-2xl font-semibold mb-6 pb-4 border-b'
                  style={{
                    color: 'rgba(211, 190, 249, 0.9)',
                    borderColor: 'rgba(211, 190, 249, 0.2)',
                  }}
                >
                  Order Summary
                </h2>

                <div className='space-y-4 mb-6'>
                  <div
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span className='text-lg'>Items:</span>
                    <span className='text-lg'>
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                    </span>
                  </div>

                  <div
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span className='text-lg'>Subtotal:</span>
                    <span className='text-lg'>${cart.itemsPrice}</span>
                  </div>

                  <div
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span className='text-lg'>Shipping:</span>
                    <span className='text-lg'>${cart.shippingPrice}</span>
                  </div>

                  <div
                    className='flex justify-between'
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <span className='text-lg'>Tax:</span>
                    <span className='text-lg'>${cart.taxPrice}</span>
                  </div>

                  <div
                    className='flex justify-between font-bold text-xl pt-4 border-t'
                    style={{
                      color: 'rgba(211, 190, 249, 1)',
                      borderColor: 'rgba(211, 190, 249, 0.2)',
                    }}
                  >
                    <span>Total:</span>
                    <span>${cart.totalPrice}</span>
                  </div>
                </div>

                <button
                  className={`py-3 px-6 rounded-lg font-medium w-full transition-all ${
                    cartItems.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      cartItems.length === 0
                        ? 'rgba(211, 190, 249, 0.4)'
                        : 'rgba(211, 190, 249, 0.9)',
                    color: 'rgb(7, 10, 19)',
                    boxShadow:
                      cartItems.length === 0
                        ? 'none'
                        : '0 4px 12px rgba(211, 190, 249, 0.5)',
                    transform:
                      cartItems.length === 0 ? 'none' : 'translateY(0)',
                  }}
                  onMouseOver={(e) => {
                    if (cartItems.length !== 0) {
                      e.currentTarget.style.backgroundColor =
                        'rgba(211, 190, 249, 1)'
                      e.currentTarget.style.boxShadow =
                        '0 6px 16px rgba(211, 190, 249, 0.7)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (cartItems.length !== 0) {
                      e.currentTarget.style.backgroundColor =
                        'rgba(211, 190, 249, 0.9)'
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(211, 190, 249, 0.5)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
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
    </div>
  )
}

export default Cart
