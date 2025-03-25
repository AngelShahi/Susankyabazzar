import { useState, useEffect } from 'react'
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlineClose,
} from 'react-icons/ai'
import { FaHeart, FaUserCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLogoutMutation } from '../../redux/api/usersApiSlice'
import { logout } from '../../redux/features/auth/authSlice'
import FavoritesCount from '../Products/FavoritesCount'

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [logoutApiCall] = useLogoutMutation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap()
      dispatch(logout())
      navigate('/login')
      setDropdownOpen(false)
      setShowSidebar(false)
    } catch (error) {
      console.error(error)
    }
  }

  // Mobile navigation bar at the top
  const MobileNav = () => (
    <div className='fixed top-0 left-0 right-0 bg-gray-800 text-white flex justify-between items-center p-4 z-50 shadow-md'>
      <div className='font-bold text-xl tracking-wider'>TechStore</div>
      <button onClick={toggleSidebar} aria-label='Toggle menu'>
        {showSidebar ? (
          <AiOutlineClose size={24} />
        ) : (
          <AiOutlineMenu size={24} />
        )}
      </button>
    </div>
  )

  return (
    <>
      {isMobile && <MobileNav />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out shadow-lg ${
              showSidebar ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className='flex justify-end p-4'>
              <button onClick={toggleSidebar} aria-label='Close menu'>
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className='flex flex-col px-4 py-2'>
              <Link
                to='/'
                className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                onClick={() => setShowSidebar(false)}
              >
                <AiOutlineHome className='mr-3' size={22} />
                <span>Home</span>
              </Link>

              <Link
                to='/shop'
                className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                onClick={() => setShowSidebar(false)}
              >
                <AiOutlineShopping className='mr-3' size={22} />
                <span>Shop</span>
              </Link>

              <Link
                to='/cart'
                className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                onClick={() => setShowSidebar(false)}
              >
                <div className='relative'>
                  <AiOutlineShoppingCart className='mr-3' size={22} />
                  {cartItems.length > 0 && (
                    <span className='absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 font-medium rounded-full'>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </Link>

              <Link
                to='/favorite'
                className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                onClick={() => setShowSidebar(false)}
              >
                <div className='relative'>
                  <FaHeart className='mr-3' size={18} />
                  <FavoritesCount />
                </div>
                <span>Favorites</span>
              </Link>

              {userInfo ? (
                <div className='mt-4 border-t border-gray-700 pt-4'>
                  <div className='flex items-center mb-4 px-2'>
                    <FaUserCircle size={20} className='mr-3' />
                    <span className='font-medium'>{userInfo.username}</span>
                  </div>

                  {userInfo.isAdmin && (
                    <div className='bg-gray-800 rounded-lg mb-4 py-2'>
                      <div className='px-2 py-1 text-sm text-gray-400'>
                        Admin Panel
                      </div>
                      <Link
                        to='/admin/dashboard'
                        className='flex items-center px-4 py-2 hover:bg-gray-700 rounded'
                        onClick={() => setShowSidebar(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to='/admin/productlist'
                        className='flex items-center px-4 py-2 hover:bg-gray-700 rounded'
                        onClick={() => setShowSidebar(false)}
                      >
                        Products
                      </Link>
                      <Link
                        to='/admin/categorylist'
                        className='flex items-center px-4 py-2 hover:bg-gray-700 rounded'
                        onClick={() => setShowSidebar(false)}
                      >
                        Categories
                      </Link>
                      <Link
                        to='/admin/orderlist'
                        className='flex items-center px-4 py-2 hover:bg-gray-700 rounded'
                        onClick={() => setShowSidebar(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to='/admin/userlist'
                        className='flex items-center px-4 py-2 hover:bg-gray-700 rounded'
                        onClick={() => setShowSidebar(false)}
                      >
                        Users
                      </Link>
                    </div>
                  )}

                  <Link
                    to='/profile'
                    className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                    onClick={() => setShowSidebar(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logoutHandler}
                    className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg w-full text-left text-red-400'
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className='mt-4 border-t border-gray-700 pt-4'>
                  <Link
                    to='/login'
                    className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                    onClick={() => setShowSidebar(false)}
                  >
                    <AiOutlineLogin className='mr-3' size={22} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to='/register'
                    className='flex items-center py-3 hover:bg-gray-800 px-2 rounded-lg'
                    onClick={() => setShowSidebar(false)}
                  >
                    <AiOutlineUserAdd className='mr-3' size={22} />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        style={{ zIndex: 999 }}
        className={`hidden md:flex flex-col justify-between p-4 text-white bg-gray-900 h-screen fixed transition-all duration-300 ease-in-out ${
          showSidebar ? 'w-16' : 'w-16 hover:w-56'
        }`}
        id='navigation-container'
      >
        <div className='flex flex-col justify-center space-y-6'>
          <Link
            to='/'
            className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
          >
            <AiOutlineHome className='min-w-[26px]' size={22} />
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                showSidebar
                  ? 'w-0 opacity-0'
                  : 'group-hover:w-24 group-hover:opacity-100'
              }`}
            >
              Home
            </span>
          </Link>

          <Link
            to='/shop'
            className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
          >
            <AiOutlineShopping className='min-w-[26px]' size={22} />
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                showSidebar
                  ? 'w-0 opacity-0'
                  : 'group-hover:w-24 group-hover:opacity-100'
              }`}
            >
              Shop
            </span>
          </Link>

          <Link
            to='/cart'
            className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
          >
            <div className='relative min-w-[26px]'>
              <AiOutlineShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className='absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 font-medium rounded-full'>
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </div>
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                showSidebar
                  ? 'w-0 opacity-0'
                  : 'group-hover:w-24 group-hover:opacity-100'
              }`}
            >
              Cart
            </span>
          </Link>

          <Link
            to='/favorite'
            className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
          >
            <div className='relative min-w-[26px]'>
              <FaHeart size={18} />
              <FavoritesCount />
            </div>
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                showSidebar
                  ? 'w-0 opacity-0'
                  : 'group-hover:w-24 group-hover:opacity-100'
              }`}
            >
              Favorites
            </span>
          </Link>
        </div>

        <div className='relative'>
          {userInfo ? (
            <div className='flex flex-col'>
              <button
                onClick={toggleDropdown}
                className='flex items-center py-2 px-1 rounded-lg hover:bg-gray-800 w-full'
              >
                <FaUserCircle className='min-w-[26px]' size={20} />
                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    showSidebar
                      ? 'w-0 opacity-0'
                      : 'group-hover:w-24 group-hover:opacity-100'
                  }`}
                >
                  {userInfo.username}
                </span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className={`h-4 w-4 ml-1 ${
                    dropdownOpen ? 'transform rotate-180' : ''
                  } ${showSidebar ? 'hidden' : 'group-hover:inline-block'}`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d={dropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className='absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg overflow-hidden'>
                  {userInfo.isAdmin && (
                    <div className='border-b border-gray-200'>
                      <div className='px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium'>
                        Admin Panel
                      </div>
                      <Link
                        to='/admin/dashboard'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to='/admin/productlist'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Products
                      </Link>
                      <Link
                        to='/admin/categorylist'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Categories
                      </Link>
                      <Link
                        to='/admin/orderlist'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to='/admin/userlist'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Users
                      </Link>
                    </div>
                  )}
                  <Link
                    to='/profile'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logoutHandler}
                    className='block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col space-y-4'>
              <Link
                to='/login'
                className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
              >
                <AiOutlineLogin className='min-w-[26px]' size={22} />
                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    showSidebar
                      ? 'w-0 opacity-0'
                      : 'group-hover:w-24 group-hover:opacity-100'
                  }`}
                >
                  Login
                </span>
              </Link>
              <Link
                to='/register'
                className='flex items-center group py-2 px-1 rounded-lg hover:bg-gray-800'
              >
                <AiOutlineUserAdd className='min-w-[26px]' size={22} />
                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    showSidebar
                      ? 'w-0 opacity-0'
                      : 'group-hover:w-24 group-hover:opacity-100'
                  }`}
                >
                  Register
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Empty space to push content to the right on desktop */}
      <div className='hidden md:block w-16' />

      {/* Empty space to push content down on mobile */}
      {isMobile && <div className='h-16' />}
    </>
  )
}

export default Navigation
