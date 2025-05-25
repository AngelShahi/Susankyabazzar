import { Link, useParams } from 'react-router-dom'
import {
  useGetProductsQuery,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
} from '../redux/api/productApiSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Header from '../components/Header'
import HeartIcon from '../pages/Products/HeartIcon'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import moment from 'moment'
import {
  FaBox,
  FaClock,
  FaStar,
  FaStore,
  FaArrowRight,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa'

// Product component (unchanged)
const Product = ({ product }) => {
  const isFeatured = product.rating >= 4.5
  const isNew = moment(product.createdAt).isAfter(moment().subtract(30, 'days'))

  return (
    <div className='bg-[rgb(7,10,19)] rounded-lg overflow-hidden border border-[rgb(211,190,249)] transition-transform duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-[rgb(211,190,249)]/20'>
      <div className='relative w-full h-64 overflow-hidden'>
        <img
          src={product.image}
          alt={product.name}
          className='h-full w-full object-cover'
        />
        <HeartIcon product={product} />
        {isFeatured && (
          <span className='absolute top-2 left-2 bg-[rgb(211,190,249)] text-white text-sm font-medium px-3 py-1 rounded-full'>
            Featured
          </span>
        )}
        {isNew && (
          <span className='absolute top-2 right-2 bg-[rgb(211,190,249)] text-white text-sm font-medium px-3 py-1 rounded-full'>
            New
          </span>
        )}
      </div>

      <div className='p-6'>
        <Link
          to={`/product/${product._id}`}
          className='text-white hover:text-[rgb(211,190,249)]'
        >
          <h2 className='text-xl font-semibold mb-3'>{product.name}</h2>
        </Link>

        <p className='text-gray-400 text-base mb-4'>
          {product.description.substring(0, 80)}...
        </p>

        <div className='flex justify-between items-center'>
          <span className='text-[rgb(211,190,249)] font-bold text-xl'>
            ₨ {product.price}
          </span>
          <Link
            to={`/product/${product._id}`}
            className='text-[rgb(211,190,249)] hover:text-[rgb(211,190,249)]/80 text-base border border-[rgb(211,190,249)] px-4 py-2 rounded-md hover:bg-[rgb(211,190,249)]/20 transition-colors duration-300'
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

// ProductCarousel component (unchanged)
const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery()

  const settings = {
    dots: true,
    dotsClass: 'slick-dots',
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
    className:
      'w-full max-w-6xl mx-auto rounded-lg overflow-hidden carousel-container',
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-10 carousel-wrapper'>
      <style>
        {`
          .carousel-container .slick-prev,
          .carousel-container .slick-next {
            z-index: 10;
            width: 50px;
            height: 50px;
            background: rgb(211, 190, 249);
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          .carousel-container .slick-prev:hover,
          .carousel-container .slick-next:hover {
            background: rgb(211, 190, 249);
          }
          .carousel-container .slick-prev {
            left: 20px;
          }
          .carousel-container .slick-next {
            right: 20px;
          }
          .carousel-container .slick-dots {
            bottom: 20px;
          }
          .carousel-container .slick-dots li button:before {
            font-size: 12px;
            color: white;
            opacity: 0.5;
          }
          .carousel-container .slick-dots li.slick-active button:before {
            color: white;
            opacity: 0.9;
          }
        `}
      </style>

      {isLoading ? null : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Slider {...settings}>
          {products?.map((product) => (
            <div key={product._id} className='relative'>
              <div className='w-full h-120 relative bg-[rgb(7,10,19)]'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover opacity-60'
                />
                <div className='absolute inset-0 flex flex-col justify-center items-center text-center p-8'>
                  <h2 className='text-5xl font-bold text-white mb-4'>
                    {product.name}
                  </h2>
                  <p className='text-xl text-gray-200 mb-8 max-w-2xl'>
                    {product.description.substring(0, 120)}...
                  </p>
                  <Link
                    to={`/product/${product._id}`}
                    className='bg-[rgb(211,190,249)] hover:bg-[rgb(211,190,249)]/80 text-white font-medium py-3 px-8 rounded-md transition-colors duration-300 text-lg'
                  >
                    Discover Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  )
}

// Footer component (unchanged)
const Footer = () => {
  return (
    <footer className='bg-[rgb(7,10,19)] text-gray-300 py-12 border-t border-[rgb(211,190,249)]/30'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h3 className='text-2xl font-bold mb-4 text-white'>TechStore</h3>
            <p className='text-base'>
              Your one-stop shop for premium tech gadgets and accessories.
            </p>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>
              Quick Links
            </h3>
            <ul className='space-y-2 text-base'>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Home
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Shop
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  About Us
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Contact
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>
              Customer Service
            </h3>
            <ul className='space-y-2 text-base'>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Returns & Refunds
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Shipping Info
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  FAQ
                </span>
              </li>
              <li>
                <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
                  Support
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>
              Connect With Us
            </h3>
            <div className='flex space-x-4 mb-4'>
              <FaFacebook
                className='text-gray-400 hover:text-[rgb(211,190,249)] cursor-pointer'
                size={24}
              />
              <FaTwitter
                className='text-gray-400 hover:text-[rgb(211,190,249)] cursor-pointer'
                size={24}
              />
              <FaInstagram
                className='text-gray-400 hover:text-[rgb(211,190,249)] cursor-pointer'
                size={24}
              />
              <FaLinkedin
                className='text-gray-400 hover:text-[rgb(211,190,249)] cursor-pointer'
                size={24}
              />
            </div>
            <p className='text-base'>
              Sign up for our newsletter to receive updates and exclusive
              offers.
            </p>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-base'>© 2025 TechStore. All rights reserved.</p>
          <div className='flex space-x-4 text-base mt-4 md:mt-0'>
            <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
              Privacy Policy
            </span>
            <span className='hover:text-[rgb(211,190,249)] cursor-pointer'>
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Home component
const Home = () => {
  const { keyword } = useParams()
  const {
    data,
    isLoading,
    isError,
    error: productsError,
  } = useGetProductsQuery({
    keyword: keyword || '',
  })
  const {
    data: newProducts,
    isLoading: isNewLoading,
    isError: isNewError,
    error: newProductsError,
  } = useGetNewProductsQuery()

  // Debug API response
  console.log('Data from useGetProductsQuery:', data)
  console.log('Products:', data?.products)
  console.log('New Products:', newProducts)

  // Ensure products and newProducts are arrays
  const productsArray = Array.isArray(data?.products) ? data.products : []
  const newProductsArray = Array.isArray(newProducts) ? newProducts : []

  return (
    <div className='bg-[rgb(7,10,19)] min-h-screen'>
      {/* Header */}
      {!keyword ? <Header /> : null}

      {/* Hero Banner Section */}
      <div className='bg-[rgb(7,10,19)] py-8'>
        <ProductCarousel />
      </div>

      {isLoading || isNewLoading ? (
        <div className='flex justify-center my-12 bg-[rgb(7,10,19)]'>
          <Loader />
        </div>
      ) : isError || isNewError ? (
        <div className='max-w-6xl mx-auto px-4 my-12 bg-[rgb(7,10,19)]'>
          <Message variant='danger'>
            {productsError?.data?.message ||
              productsError?.error ||
              newProductsError?.data?.message ||
              newProductsError?.error ||
              'An error occurred while fetching products'}
          </Message>
        </div>
      ) : (
        <div className='bg-[rgb(7,10,19)]'>
          {/* Special Products Section */}
          <section className='py-20 max-w-6xl mx-auto px-4'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(211,190,249)] to-[rgb(211,190,249)]'>
                Special Products
              </h2>
              <p className='text-gray-400 mt-4 max-w-3xl mx-auto text-lg'>
                Discover our handpicked selection of premium tech products
                designed to enhance your digital lifestyle.
              </p>
            </div>

            {newProductsArray.length === 0 ? (
              <Message variant='info'>No new products available</Message>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10'>
                {newProductsArray.slice(0, 6).map((product) => (
                  <Product key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Featured Products Section */}
          <section className='py-20 max-w-6xl mx-auto px-4'>
            <div className='flex justify-between items-center mb-12'>
              <h2 className='text-3xl font-bold text-white'>
                Featured Products
              </h2>
              <Link
                to='/shop'
                className='text-[rgb(211,190,249)] hover:text-[rgb(211,190,249)]/80 flex items-center text-lg'
              >
                View All <FaArrowRight className='ml-2' size={16} />
              </Link>
            </div>

            {productsArray.length === 0 ? (
              <Message variant='info'>No featured products available</Message>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10'>
                {productsArray.slice(0, 3).map((product) => (
                  <div
                    key={`featured-${product._id}`}
                    className='bg-[rgb(7,10,19)] rounded-lg overflow-hidden border border-[rgb(211,190,249)] transition-all duration-300 hover:shadow-lg hover:shadow-[rgb(211,190,249)]/20'
                  >
                    <div className='relative'>
                      <img
                        src={product.image}
                        alt={product.name}
                        className='w-full h-64 object-cover'
                      />
                      <HeartIcon product={product} />
                    </div>

                    <div className='p-6'>
                      <h3 className='font-semibold text-white text-xl'>
                        {product.name}
                      </h3>
                      <div className='flex items-center mt-2'>
                        <div className='flex text-yellow-500 mr-2'>
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={16}
                              className={
                                i < Math.round(product.rating)
                                  ? 'text-yellow-500'
                                  : 'text-gray-600'
                              }
                            />
                          ))}
                        </div>
                        <span className='text-sm text-gray-400'>
                          ({product.numReviews} reviews)
                        </span>
                      </div>

                      <div className='flex justify-between items-center mt-4'>
                        <span className='text-[rgb(211,190,249)] font-bold text-xl'>
                          ₨ {product.price}
                        </span>
                        <Link
                          to={`/product/${product._id}`}
                          className='text-[rgb(211,190,249)] hover:text-[rgb(211,190,249)]/80 text-base border border-[rgb(211,190,249)] px-4 py-2 rounded-md hover:bg-[rgb(211,190,249)]/20 transition-colors duration-300'
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Call to Action Banner */}
          <section className='bg-gradient-to-r from-gray-800 py-20 px-4 mb-16'>
            <div className='max-w-6xl mx-auto text-center'>
              <h2 className='text-4xl font-bold mb-6 text-white'>
                Ready to Explore More?
              </h2>
              <p className='text-xl mb-10 max-w-3xl mx-auto text-gray-300'>
                Visit our shop to discover our complete collection of
                cutting-edge technology products.
              </p>
              <Link
                to='/shop'
                className='inline-flex items-center bg-[rgb(211,190,249)] text-white hover:bg-[rgb(211,190,249)]/80 px-8 py-4 rounded-lg font-medium transition-colors duration-300 text-lg'
              >
                Shop Now <FaArrowRight className='ml-2' size={18} />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      )}
    </div>
  )
}

export default Home
