import { useState, useEffect } from 'react'
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineShop,
  AiOutlineUnorderedList,
  AiOutlineFileText,
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
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [logoutApiCall] = useLogoutMutation()

  const isAdmin = userInfo && userInfo.isAdmin

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  const expandSidebar = () => {
    setSidebarExpanded(true)
  }

  const collapseSidebar = () => {
    setSidebarExpanded(false)
    setAdminDropdownOpen(false)
  }

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap()
      dispatch(logout())
      navigate('/login')
      setDropdownOpen(false)
      setAdminDropdownOpen(false)
      setShowMobileMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  // Admin Sidebar Component
  const AdminSidebar = () => (
    <div
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white shadow-lg z-40 transition-all duration-300 ${
        sidebarExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={expandSidebar}
      onMouseLeave={collapseSidebar}
    >
      <div className='p-4'>
        <div
          className={`font-bold text-xl tracking-wider ${
            !sidebarExpanded && 'text-center'
          }`}
        >
          {sidebarExpanded ? 'Admin Panel' : 'AP'}
        </div>
      </div>

      <div className='flex flex-col space-y-1 mt-6'>
        <Link
          to='/admin/dashboard'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800'
        >
          <AiOutlineDashboard size={20} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Dashboard
          </span>
        </Link>

        <Link
          to='/admin/allproductslist'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800'
        >
          <AiOutlineShop size={20} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Products
          </span>
        </Link>

        <Link
          to='/admin/categorylist'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800'
        >
          <AiOutlineUnorderedList size={20} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Categories
          </span>
        </Link>

        <Link
          to='/admin/orderlist'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800'
        >
          <AiOutlineFileText size={20} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Orders
          </span>
        </Link>

        <Link
          to='/admin/userlist'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800'
        >
          <AiOutlineUser size={20} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Users
          </span>
        </Link>
      </div>

      <div className='absolute bottom-0 left-0 right-0 p-4'>
        <div className='relative'>
          <button
            onClick={toggleAdminDropdown}
            className='flex items-center w-full p-2 rounded-lg hover:bg-gray-800'
          >
            <div className='flex items-center justify-center'>
              <FaUserCircle size={20} />
              {sidebarExpanded && (
                <>
                  <span className='ml-3 overflow-hidden text-ellipsis'>
                    {userInfo.username}
                  </span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-4 w-4 ml-1 ${
                      adminDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d={adminDropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                    />
                  </svg>
                </>
              )}
            </div>
          </button>

          {adminDropdownOpen && sidebarExpanded && (
            <div className='absolute bottom-full mb-2 left-0 w-full bg-white rounded-lg shadow-lg overflow-hidden'>
              <Link
                to='/profile'
                className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                onClick={() => setAdminDropdownOpen(false)}
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
      </div>
    </div>
  )

  // Customer Top Navigation Bar
  const CustomerTopNav = () => (
    <nav className='bg-gray-800 text-white shadow-md'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between h-16'>
          {/* Logo and main nav links */}
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <span className='font-bold text-xl tracking-wider'>
                TechStore
              </span>
            </div>

            {/* Desktop menu */}
            <div className='hidden md:ml-6 md:flex md:items-center md:space-x-4'>
              <Link to='/' className='px-3 py-2 rounded-md hover:bg-gray-700'>
                Home
              </Link>
              <Link
                to='/shop'
                className='px-3 py-2 rounded-md hover:bg-gray-700'
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Right side nav items */}
          <div className='hidden md:flex items-center'>
            <Link
              to='/cart'
              className='relative px-3 py-2 rounded-md hover:bg-gray-700'
            >
              <div className='flex items-center'>
                <AiOutlineShoppingCart size={20} />
                <span className='ml-1'>Cart</span>
                {cartItems.length > 0 && (
                  <span className='absolute top-0 right-0 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 font-medium rounded-full'>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </div>
            </Link>

            <Link
              to='/favorite'
              className='relative px-3 py-2 rounded-md hover:bg-gray-700'
            >
              <div className='flex items-center'>
                <FaHeart size={16} />
                <span className='ml-1'>Favorites</span>
                <FavoritesCount />
              </div>
            </Link>

            {userInfo ? (
              <div className='relative ml-3'>
                <button
                  onClick={toggleDropdown}
                  className='flex items-center px-3 py-2 rounded-md hover:bg-gray-700'
                >
                  <FaUserCircle size={20} className='mr-1' />
                  <span>{userInfo.username}</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className={`h-4 w-4 ml-1 ${
                      dropdownOpen ? 'transform rotate-180' : ''
                    }`}
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
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50'>
                    {userInfo.isAdmin && (
                      <Link
                        to='/admin/dashboard'
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
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
              <div className='flex items-center space-x-2 ml-3'>
                <Link
                  to='/login'
                  className='px-3 py-2 rounded-md hover:bg-gray-700'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600'
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='flex items-center md:hidden'>
            <button
              onClick={toggleMobileMenu}
              className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700'
              aria-label='Toggle menu'
            >
              {showMobileMenu ? (
                <AiOutlineClose size={24} />
              ) : (
                <AiOutlineMenu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1'>
            <Link
              to='/'
              className='block px-3 py-2 rounded-md hover:bg-gray-700'
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              to='/shop'
              className='block px-3 py-2 rounded-md hover:bg-gray-700'
              onClick={() => setShowMobileMenu(false)}
            >
              Shop
            </Link>
            <Link
              to='/cart'
              className='block px-3 py-2 rounded-md hover:bg-gray-700'
              onClick={() => setShowMobileMenu(false)}
            >
              <div className='flex items-center'>
                <AiOutlineShoppingCart size={20} className='mr-2' />
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className='ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 font-medium rounded-full'>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </span>
                )}
              </div>
            </Link>
            <Link
              to='/favorite'
              className='block px-3 py-2 rounded-md hover:bg-gray-700'
              onClick={() => setShowMobileMenu(false)}
            >
              <div className='flex items-center'>
                <FaHeart size={16} className='mr-2' />
                <span>Favorites</span>
              </div>
            </Link>
            {userInfo ? (
              <>
                <Link
                  to='/profile'
                  className='block px-3 py-2 rounded-md hover:bg-gray-700'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile
                </Link>
                {userInfo.isAdmin && (
                  <Link
                    to='/admin/dashboard'
                    className='block px-3 py-2 rounded-md hover:bg-gray-700'
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={logoutHandler}
                  className='block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 text-red-400'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className='block px-3 py-2 rounded-md hover:bg-gray-700'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='block px-3 py-2 rounded-md hover:bg-gray-700'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )

  return (
    <>
      {isAdmin ? (
        <>
          <AdminSidebar />
          {/* Empty space to push content away from sidebar - adjusts based on sidebar state */}
          <div
            className={`transition-all duration-300 ${
              sidebarExpanded ? 'ml-64' : 'ml-16'
            }`}
          />
        </>
      ) : (
        <>
          <CustomerTopNav />
          {/* Space after the fixed navbar on smaller screens */}
          <div className={showMobileMenu ? 'h-64 md:h-16' : 'h-16'} />
        </>
      )}
    </>
  )
}

export default Navigation
