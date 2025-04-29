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
  AiOutlinePercentage,
} from 'react-icons/ai'
import { FaHeart, FaUserCircle } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLogoutMutation } from '../../redux/api/usersApiSlice'
import { logout } from '../../redux/features/auth/authSlice'
import FavoritesCount from '../Products/FavoritesCount'
import CartCount from '../Products/CartCount'
import { clearFavorites } from '../../redux/features/favorites/favoriteSlice'

// CSS for the dark gray glossy glass effect with purple accents
const styles = `
  .glass-effect {
    background: rgba(17, 24, 39, 0.8); /* bg-gray-900 with opacity */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(211, 190, 249, 0.3);
    box-shadow: 0 4px 6px -1px rgba(17, 24, 39, 0.2), 0 2px 4px -1px rgba(17, 24, 39, 0.06);
  }
  
  /* Add a subtle glossy highlight */
  .glass-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(211, 190, 249, 0), rgba(211, 190, 249, 0.5), rgba(211, 190, 249, 0));
  }
  
  /* Adjust text color for better visibility on dark background */
  .glass-effect .text-foreground {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .glass-effect .hover\\:text-primary:hover {
    color: rgb(211, 190, 249) !important;
  }
  
  /* For dropdowns */
  .glass-effect-dropdown {
    background: rgba(17, 24, 39, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(211, 190, 249, 0.3);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }
`

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)
  const location = useLocation() // Get current location/route

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [scrolled, setScrolled] = useState(false)
  const { favoriteItems } = useSelector((state) => state.favorites)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [logoutApiCall] = useLogoutMutation()

  const isAdmin = userInfo && userInfo.isAdmin

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
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
      dispatch(clearFavorites())
      navigate('/login')
      setDropdownOpen(false)
      setAdminDropdownOpen(false)
      setShowMobileMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  // Function to check if a path is active
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Admin Sidebar Component with dark gray styling and purple accents
  const AdminSidebar = () => (
    <div
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground shadow-lg z-40 transition-all duration-300 ${
        sidebarExpanded ? 'w-64' : 'w-16'
      }`}
      style={{
        background: 'rgba(17, 24, 39, 0.95)', // bg-gray-900
        borderRight: '1px solid rgba(211, 190, 249, 0.3)',
      }}
      onMouseEnter={expandSidebar}
      onMouseLeave={collapseSidebar}
    >
      <div className='p-4'>
        <div
          className={`font-bold text-xl tracking-wider ${
            !sidebarExpanded && 'text-center'
          }`}
          style={{ color: 'rgb(211, 190, 249)' }}
        >
          {sidebarExpanded ? 'Admin Panel' : 'AP'}
        </div>
      </div>

      <div className='flex flex-col space-y-1 mt-6'>
        <Link
          to='/admin/dashboard'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlineDashboard
            size={20}
            style={{ color: 'rgb(211, 190, 249)' }}
          />
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
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlineShop size={20} style={{ color: 'rgb(211, 190, 249)' }} />
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
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlineUnorderedList
            size={20}
            style={{ color: 'rgb(211, 190, 249)' }}
          />
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
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlineFileText
            size={20}
            style={{ color: 'rgb(211, 190, 249)' }}
          />
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
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlineUser size={20} style={{ color: 'rgb(211, 190, 249)' }} />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Users
          </span>
        </Link>

        <Link
          to='/admin/DiscountListPage'
          className='flex items-center p-3 px-4 rounded-lg hover:bg-gray-800 text-gray-200'
        >
          <AiOutlinePercentage
            size={20}
            style={{ color: 'rgb(211, 190, 249)' }}
          />
          <span
            className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              sidebarExpanded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          >
            Discounts
          </span>
        </Link>
      </div>

      <div className='absolute bottom-0 left-0 right-0 p-4'>
        <div className='relative'>
          <button
            onClick={toggleAdminDropdown}
            className='flex items-center w-full p-2 rounded-lg hover:bg-gray-800 text-gray-200'
          >
            <div className='flex items-center justify-center'>
              <FaUserCircle size={20} style={{ color: 'rgb(211, 190, 249)' }} />
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
                    style={{ color: 'rgb(211, 190, 249)' }}
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
            <div className='absolute bottom-full mb-2 left-0 w-full glass-effect-dropdown rounded-lg shadow-lg overflow-hidden'>
              <Link
                to='/profile'
                className='block px-4 py-2 text-gray-200 hover:bg-gray-800'
                onClick={() => setAdminDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={logoutHandler}
                className='block w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800'
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Customer Top Navigation Bar with dark gray glossy effect and purple accents
  const CustomerTopNav = () => (
    <nav className='glass-effect sticky top-0 z-50 w-full py-4 px-6 flex justify-between items-center relative bg-gray-900'>
      {/* Logo on left */}
      <div className='flex items-center'>
        <Link
          to='/'
          style={{ color: 'rgb(211, 190, 249)' }}
          className='text-xl font-bold'
        >
          Susankyabazzar
        </Link>
      </div>

      {/* Desktop menu - centered */}
      <div className='hidden md:flex space-x-6'>
        <NavLink to='/' isActive={isActivePath('/')}>
          Home
        </NavLink>
        <NavLink to='/shop' isActive={isActivePath('/shop')}>
          Shop
        </NavLink>

        {userInfo ? (
          <>
            <NavLink to='/cart' isActive={isActivePath('/cart')}>
              <div className='flex items-center relative'>
                <AiOutlineShoppingCart size={20} className='mr-1' />
                <span>Cart</span>
                <CartCount /> {/* Use the CartCount component */}
              </div>
            </NavLink>

            <NavLink to='/favorite' isActive={isActivePath('/favorite')}>
              <div className='flex items-center relative'>
                <FaHeart size={16} className='mr-1' />
                <span>Favorites</span>
                <FavoritesCount />
              </div>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to='/login' isActive={isActivePath('/login')}>
              Login
            </NavLink>
            <NavLink to='/register' isActive={isActivePath('/register')}>
              Register
            </NavLink>
          </>
        )}
      </div>

      {/* User menu or mobile menu button */}
      <div className='flex items-center'>
        {userInfo ? (
          <div className='relative hidden md:block'>
            <button
              onClick={toggleDropdown}
              className='flex items-center text-gray-200 hover:text-purple-300 transition-colors duration-300'
            >
              <FaUserCircle
                size={20}
                className='mr-1'
                style={{ color: 'rgb(211, 190, 249)' }}
              />
              <span>{userInfo.username}</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                style={{ color: 'rgb(211, 190, 249)' }}
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
              <div
                className='absolute right-0 mt-2 w-48 glass-effect-dropdown rounded-lg shadow-lg z-50 border border-opacity-20'
                style={{ borderColor: 'rgb(211, 190, 249)' }}
              >
                {userInfo.isAdmin && (
                  <Link
                    to='/admin/dashboard'
                    className='block px-4 py-2 text-gray-200 hover:bg-gray-800 transition-colors duration-300'
                    onClick={() => setDropdownOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to='/profile'
                  className='block px-4 py-2 text-gray-200 hover:bg-gray-800 transition-colors duration-300'
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={logoutHandler}
                  className='block w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 transition-colors duration-300'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Mobile menu button */}
        <div className='md:hidden'>
          <button
            onClick={toggleMobileMenu}
            className='inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-purple-300 transition-colors duration-300'
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

      {/* Mobile menu */}
      {showMobileMenu && (
        <div
          className='md:hidden absolute top-full left-0 right-0 glass-effect border-t border-opacity-20'
          style={{ borderColor: 'rgb(211, 190, 249)' }}
        >
          <div className='px-4 py-3 space-y-3'>
            <MobileNavLink to='/' onClick={() => setShowMobileMenu(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink to='/shop' onClick={() => setShowMobileMenu(false)}>
              Shop
            </MobileNavLink>

            {userInfo ? (
              <>
                <MobileNavLink
                  to='/cart'
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className='flex items-center'>
                    <AiOutlineShoppingCart
                      size={20}
                      className='mr-2'
                      style={{ color: 'rgb(211, 190, 249)' }}
                    />
                    <span>Cart</span>
                    {/* Use CartCount here too */}
                    <CartCount />
                  </div>
                </MobileNavLink>
                <MobileNavLink
                  to='/favorite'
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className='flex items-center'>
                    <FaHeart
                      size={16}
                      className='mr-2'
                      style={{ color: 'rgb(211, 190, 249)' }}
                    />
                    <span>Favorites</span>
                    <FavoritesCount />
                  </div>
                </MobileNavLink>
                <MobileNavLink
                  to='/profile'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile
                </MobileNavLink>
                {userInfo.isAdmin && (
                  <MobileNavLink
                    to='/admin/dashboard'
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Admin Dashboard
                  </MobileNavLink>
                )}
                <button
                  onClick={logoutHandler}
                  className='block w-full text-left py-2 text-red-400 hover:text-red-300 transition-colors duration-300'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink
                  to='/login'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </MobileNavLink>
                <MobileNavLink
                  to='/register'
                  onClick={() => setShowMobileMenu(false)}
                >
                  Register
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )

  // Nav link with underline animation
  const NavLink = ({ to, children, isActive = false }) => {
    return (
      <Link
        to={to}
        className={`relative px-2 py-1 transition-all duration-300 text-gray-200
          after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0
          after:origin-bottom-right after:transition-transform after:duration-300
          hover:after:scale-x-100 hover:after:origin-bottom-left hover:text-purple-300
          ${isActive ? 'text-purple-300 after:scale-x-100' : ''}`}
        style={{
          '--hover-color': 'rgb(211, 190, 249)',
          '--active-color': 'rgb(211, 190, 249)',
        }}
      >
        {children}
      </Link>
    )
  }

  // Simplified mobile link
  const MobileNavLink = ({ to, children, onClick }) => {
    return (
      <Link
        to={to}
        className='block py-2 text-gray-200 hover:text-purple-300 transition-colors duration-300'
        onClick={onClick}
        style={{ '--hover-color': 'rgb(211, 190, 249)' }}
      >
        {children}
      </Link>
    )
  }

  return (
    <>
      {/* Include the CSS styles */}
      <style>{styles}</style>

      {isAdmin ? (
        <>
          <AdminSidebar />
          <div
            className={`transition-all duration-300 ${
              sidebarExpanded ? 'ml-64' : 'ml-16'
            }`}
          />
        </>
      ) : (
        <>
          <CustomerTopNav />
          {/* We don't need the spacing div since we're using sticky positioning */}
        </>
      )}
    </>
  )
}

export default Navigation
