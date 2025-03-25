import { useGetTopProductsQuery } from '../../redux/api/productApiSlice'
import Message from '../../components/Message'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import moment from 'moment'
import { FaBox, FaClock, FaShoppingCart, FaStar, FaStore } from 'react-icons/fa'

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery()

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  }

  return (
    <div className='mb-4 lg:block xl:block md:block'>
      {isLoading ? null : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Slider
          {...settings}
          className='xl:w-[50rem] lg:w-[50rem] md:w-[56rem] sm:w-[40rem] sm:block'
        >
          {products.map((product) => (
            <div
              key={product._id}
              className='p-4 bg-white shadow-md rounded-lg border border-gray-200'
            >
              <div className='relative w-full h-[30rem] overflow-hidden flex justify-center items-center'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-full h-full object-cover rounded-lg'
                />
              </div>

              <div className='mt-4 text-black'>
                <h2 className='text-xl font-bold'>{product.name}</h2>
                <p className='text-lg font-semibold'>${product.price}</p>
                <p className='mt-2 text-gray-700 w-[25rem]'>
                  {product.description.substring(0, 170)}...
                </p>

                <div className='mt-4 flex justify-between text-gray-700'>
                  <div>
                    <h1 className='flex items-center mb-2'>
                      <FaStore className='mr-2' /> Brand: {product.brand}
                    </h1>
                    <h1 className='flex items-center mb-2'>
                      <FaClock className='mr-2' /> Added:{' '}
                      {moment(product.createdAt).fromNow()}
                    </h1>
                    <h1 className='flex items-center mb-2'>
                      <FaStar className='mr-2 text-yellow-500' /> Reviews:{' '}
                      {product.numReviews}
                    </h1>
                  </div>

                  <div>
                    <h1 className='flex items-center mb-2'>
                      <FaStar className='mr-2 text-yellow-500' /> Ratings:{' '}
                      {Math.round(product.rating)}
                    </h1>
                    <h1 className='flex items-center mb-2'>
                      <FaShoppingCart className='mr-2' /> Quantity:{' '}
                      {product.quantity}
                    </h1>
                    <h1 className='flex items-center mb-2'>
                      <FaBox className='mr-2' /> In Stock:{' '}
                      {product.countInStock}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  )
}

export default ProductCarousel
