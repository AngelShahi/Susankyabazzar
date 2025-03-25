import { Link } from 'react-router-dom'
import HeartIcon from './HeartIcon'

const Product = ({ product }) => {
  return (
    <div className='w-[30rem] ml-[2rem] p-3 bg-white shadow-md rounded-lg border border-gray-200'>
      <div className='relative w-full h-64 overflow-hidden flex justify-center items-center'>
        <img
          src={product.image}
          alt={product.name}
          className='h-full w-full object-cover rounded-lg'
        />
        <HeartIcon product={product} />
      </div>

      <div className='p-4'>
        <Link
          to={`/product/${product._id}`}
          className='text-gray-900 hover:underline'
        >
          <h2 className='flex justify-between items-center text-lg font-semibold'>
            <div>{product.name}</div>
            <span className='bg-gray-100 text-gray-900 text-xs font-medium px-2.5 py-0.5 rounded-full'>
              ${product.price}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  )
}

export default Product
