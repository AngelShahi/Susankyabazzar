import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  saveShippingAddress,
  savePaymentMethod,
} from '../../redux/features/cart/cartSlice'
import ProgressSteps from '../../components/ProgressSteps'

const Shipping = () => {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const submitHandler = (e) => {
    e.preventDefault()

    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  // Payment
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping')
    }
  }, [navigate, shippingAddress])

  return (
    <div className='container mx-auto px-4 max-w-6xl bg-white'>
      <ProgressSteps step1 step2 />
      <div className='mt-8 md:mt-12 flex justify-center'>
        <div className='w-full max-w-lg'>
          <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm'>
            <h1 className='text-2xl font-semibold mb-6 text-gray-800 pb-2 border-b border-gray-200'>
              Shipping & Payment
            </h1>

            <form onSubmit={submitHandler}>
              <div className='mb-4'>
                <label className='block text-gray-700 font-medium mb-2'>
                  Address
                </label>
                <input
                  type='text'
                  className='w-full p-3 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500'
                  placeholder='Enter address'
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className='mb-4'>
                <label className='block text-gray-700 font-medium mb-2'>
                  City
                </label>
                <input
                  type='text'
                  className='w-full p-3 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500'
                  placeholder='Enter city'
                  value={city}
                  required
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className='mb-4'>
                <label className='block text-gray-700 font-medium mb-2'>
                  Postal Code
                </label>
                <input
                  type='text'
                  className='w-full p-3 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500'
                  placeholder='Enter postal code'
                  value={postalCode}
                  required
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>

              <div className='mb-6'>
                <label className='block text-gray-700 font-medium mb-2'>
                  Country
                </label>
                <input
                  type='text'
                  className='w-full p-3 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500'
                  placeholder='Enter country'
                  value={country}
                  required
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div className='mb-6 pt-4 border-t border-gray-200'>
                <label className='block text-gray-700 font-medium mb-3'>
                  Payment Method
                </label>
                <div className='bg-gray-50 p-4 border border-gray-200 rounded'>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='radio'
                      className='h-5 w-5 text-gray-700'
                      name='paymentMethod'
                      value='Esewa'
                      checked={paymentMethod === 'Esewa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className='ml-3 text-gray-800'>
                      Esewa or Banking
                    </span>
                  </label>
                </div>
              </div>

              <button
                className='bg-gray-700 hover:bg-gray-800 text-white py-3 px-4 rounded font-medium w-full transition-colors'
                type='submit'
              >
                Continue to Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shipping
