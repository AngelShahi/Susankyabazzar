import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  useSaveShippingAddressMutation,
  useSavePaymentMethodMutation,
  useGetCartQuery,
} from '../../redux/features/cart/cartApiSlice'
import { setCart } from '../../redux/features/cart/cartSlice'
import ProgressSteps from '../../components/ProgressSteps'

const Shipping = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const { data: cartData, isLoading, refetch } = useGetCartQuery()

  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')

  const [saveShippingAddress, { isLoading: isShippingAddressLoading }] =
    useSaveShippingAddressMutation()
  const [savePaymentMethod, { isLoading: isPaymentMethodLoading }] =
    useSavePaymentMethodMutation()

  const navigate = useNavigate()

  // Set form fields from server data when available
  useEffect(() => {
    if (cartData?.shippingAddress) {
      setAddress(cartData.shippingAddress.address || '')
      setCity(cartData.shippingAddress.city || '')
      setPostalCode(cartData.shippingAddress.postalCode || '')
      setCountry(cartData.shippingAddress.country || '')
    }

    if (cartData?.paymentMethod) {
      setPaymentMethod(cartData.paymentMethod)
    }
  }, [cartData])

  // Check authentication
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping')
    }
  }, [userInfo, navigate])

  const submitHandler = async (e) => {
    e.preventDefault()

    try {
      // Save shipping address
      await saveShippingAddress({
        address,
        city,
        postalCode,
        country,
      }).unwrap()

      // Save payment method
      await savePaymentMethod({ paymentMethod }).unwrap()

      // Force a refetch
      const refreshedData = await refetch().unwrap()

      // Explicitly update cart state with the latest data from backend
      dispatch(
        setCart({
          ...refreshedData,
          shippingAddress: { address, city, postalCode, country },
          paymentMethod,
        })
      )

      // Now navigate
      navigate('/placeorder', { replace: true })
    } catch (error) {
      console.error('Error during form submission:', error)
      toast.error(error?.data?.message || 'Failed to save shipping information')
    }
  }

  return (
    <div
      style={{ backgroundColor: 'rgb(7, 10, 19)', minHeight: '100vh' }}
      className='py-8'
    >
      <div className='container mx-auto px-4 max-w-6xl'>
        <ProgressSteps step1 step2 />
        <div className='mt-8 md:mt-12 flex justify-center'>
          <div className='w-full max-w-lg'>
            <div
              className='p-6 rounded-lg shadow-lg'
              style={{
                backgroundColor: 'rgba(15, 20, 35, 0.8)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(211, 190, 249, 0.2)',
              }}
            >
              <h1
                className='text-2xl font-semibold mb-6 pb-2 border-b'
                style={{
                  color: 'rgba(211, 190, 249, 0.9)',
                  borderColor: 'rgba(211, 190, 249, 0.2)',
                }}
              >
                Shipping & Payment
              </h1>

              {isLoading ? (
                <div
                  className='text-center py-4'
                  style={{ color: 'rgba(211, 190, 249, 0.7)' }}
                >
                  Loading...
                </div>
              ) : (
                <form onSubmit={submitHandler}>
                  <div className='mb-4'>
                    <label
                      className='block mb-2 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.8)' }}
                    >
                      Address
                    </label>
                    <input
                      type='text'
                      className='w-full p-3 rounded focus:outline-none focus:ring-2'
                      style={{
                        backgroundColor: 'rgba(7, 10, 19, 0.7)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                      placeholder='Enter address'
                      value={address}
                      required
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      className='block mb-2 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.8)' }}
                    >
                      City
                    </label>
                    <input
                      type='text'
                      className='w-full p-3 rounded focus:outline-none focus:ring-2'
                      style={{
                        backgroundColor: 'rgba(7, 10, 19, 0.7)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                      placeholder='Enter city'
                      value={city}
                      required
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className='mb-4'>
                    <label
                      className='block mb-2 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.8)' }}
                    >
                      Postal Code
                    </label>
                    <input
                      type='text'
                      className='w-full p-3 rounded focus:outline-none focus:ring-2'
                      style={{
                        backgroundColor: 'rgba(7, 10, 19, 0.7)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                      placeholder='Enter postal code'
                      value={postalCode}
                      required
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>

                  <div className='mb-6'>
                    <label
                      className='block mb-2 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.8)' }}
                    >
                      Country
                    </label>
                    <input
                      type='text'
                      className='w-full p-3 rounded focus:outline-none focus:ring-2'
                      style={{
                        backgroundColor: 'rgba(7, 10, 19, 0.7)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                      placeholder='Enter country'
                      value={country}
                      required
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>

                  <div
                    className='mb-6 pt-4 border-t'
                    style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
                  >
                    <label
                      className='block mb-3 font-medium'
                      style={{ color: 'rgba(211, 190, 249, 0.8)' }}
                    >
                      Payment Method
                    </label>
                    <div className='space-y-3'>
                      <div
                        className='p-4 rounded'
                        style={{
                          backgroundColor: 'rgba(7, 10, 19, 0.7)',
                          border: '1px solid rgba(211, 190, 249, 0.3)',
                        }}
                      >
                        <label className='flex items-center cursor-pointer'>
                          <input
                            type='radio'
                            className='h-5 w-5'
                            style={{ accentColor: 'rgb(211, 190, 249)' }}
                            name='paymentMethod'
                            value='CashOnDelivery'
                            checked={paymentMethod === 'CashOnDelivery'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span
                            className='ml-3'
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            Cash on Delivery
                          </span>
                        </label>
                      </div>

                      <div
                        className='p-4 rounded'
                        style={{
                          backgroundColor: 'rgba(7, 10, 19, 0.7)',
                          border: '1px solid rgba(211, 190, 249, 0.3)',
                        }}
                      >
                        <label className='flex items-center cursor-pointer'>
                          <input
                            type='radio'
                            className='h-5 w-5'
                            style={{ accentColor: 'rgb(211, 190, 249)' }}
                            name='paymentMethod'
                            value='QRPayment'
                            checked={paymentMethod === 'QRPayment'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span
                            className='ml-3'
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            QR Code Payment
                          </span>
                        </label>
                        {paymentMethod === 'QRPayment' && (
                          <div className='mt-3 ml-8'>
                            <p
                              className='text-sm mb-2'
                              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              Scan this QR code to pay:
                            </p>
                            {/* Replace with your actual QR code image */}
                            <div className='bg-white p-2 rounded inline-block'>
                              <img
                                src='/images/qr-code-placeholder.png'
                                alt='QR Code'
                                className='w-32 h-32'
                              />
                            </div>
                            <p
                              className='text-sm mt-2'
                              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              Amount: Rs.{' '}
                              {cartData?.totalPrice?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className='p-4 rounded'
                        style={{
                          backgroundColor: 'rgba(7, 10, 19, 0.7)',
                          border: '1px solid rgba(211, 190, 249, 0.3)',
                        }}
                      >
                        <label className='flex items-center cursor-pointer'>
                          <input
                            type='radio'
                            className='h-5 w-5'
                            style={{ accentColor: 'rgb(211, 190, 249)' }}
                            name='paymentMethod'
                            value='Khalti'
                            checked={paymentMethod === 'Khalti'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span
                            className='ml-3'
                            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            Khalti Payment
                          </span>
                        </label>
                        {paymentMethod === 'Khalti' && (
                          <div className='mt-3 ml-8'>
                            <p
                              className='text-sm'
                              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                              You'll be redirected to Khalti payment gateway
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className='py-3 px-4 rounded font-medium w-full transition-all'
                    style={{
                      backgroundColor:
                        isShippingAddressLoading || isPaymentMethodLoading
                          ? 'rgba(211, 190, 249, 0.5)'
                          : 'rgba(211, 190, 249, 0.9)',
                      color: 'rgb(7, 10, 19)',
                      boxShadow: '0 4px 12px rgba(211, 190, 249, 0.5)',
                      transform: 'translateY(0)',
                    }}
                    onMouseOver={(e) => {
                      if (
                        !isShippingAddressLoading &&
                        !isPaymentMethodLoading
                      ) {
                        e.currentTarget.style.backgroundColor =
                          'rgba(211, 190, 249, 1)'
                        e.currentTarget.style.boxShadow =
                          '0 6px 16px rgba(211, 190, 249, 0.7)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (
                        !isShippingAddressLoading &&
                        !isPaymentMethodLoading
                      ) {
                        e.currentTarget.style.backgroundColor =
                          'rgba(211, 190, 249, 0.9)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(211, 190, 249, 0.5)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                    type='submit'
                    disabled={
                      isShippingAddressLoading || isPaymentMethodLoading
                    }
                  >
                    {isShippingAddressLoading || isPaymentMethodLoading
                      ? 'Saving...'
                      : 'Continue to Place Order'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shipping
