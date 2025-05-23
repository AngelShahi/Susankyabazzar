import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useGetCartQuery } from './redux/features/cart/cartApiSlice'
import { setCart } from './redux/features/cart/cartSlice'
import Navigation from './pages/Auth/Navigation'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const dispatch = useDispatch()
  const { data: cartData, isLoading, error } = useGetCartQuery()

  useEffect(() => {
    if (cartData) {
      dispatch(setCart(cartData))
    }
  }, [cartData, dispatch])

  return (
    <>
      <ToastContainer />
      <Navigation />
      <main className='py-0'>
        {error && (
          <div className='text-red-500 text-center'>
            Failed to load cart data
          </div>
        )}
        {isLoading ? (
          <div className='text-center'>Loading cart...</div>
        ) : (
          <Outlet />
        )}
      </main>
    </>
  )
}

export default App
