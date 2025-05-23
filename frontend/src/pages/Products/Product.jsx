import { Link } from 'react-router-dom'
import HeartIcon from './HeartIcon'

const Product = ({ product }) => {
  return (
    <div className='w-full h-full bg-[rgb(7,10,19)] shadow-lg rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(211,190,249,0.15)] hover:translate-y-[-4px]'>
      <div className='relative w-full h-64 overflow-hidden'>
        <img
          src={product.image}
          alt={product.name}
          className='h-full w-full object-cover transition-transform duration-700 hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-[rgba(7,10,19,0.7)] to-transparent'></div>
        <div className='absolute top-3 right-3'>
          <HeartIcon product={product} />
        </div>
      </div>

      <div className='p-5 border-t border-gray-800'>
        <Link to={`/product/${product._id}`} className='text-gray-100 group'>
          <div className='flex justify-between items-center mb-2'>
            <h2 className='text-lg font-medium group-hover:text-[rgb(211,190,249)] transition-colors duration-200'>
              {product.name}
            </h2>
            <span className='bg-[rgba(211,190,249,0.15)] text-[rgb(211,190,249)] text-sm font-medium px-3 py-1 rounded-full'>
              ₨ {product.price}
            </span>
          </div>

          <div className='flex justify-between items-center mt-4'>
            <span className='text-gray-400 text-sm'>
              {product.category || 'Product'}
            </span>
            <div className='flex items-center text-sm text-[rgb(211,190,249)] font-medium'>
              <span>View Details</span>
              <svg
                className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 5l7 7-7 7'
                ></path>
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Product
