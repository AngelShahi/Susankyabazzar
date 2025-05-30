import { useGetTopProductsQuery } from '../redux/api/productApiSlice'
import Loader from './Loader'

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery()

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return <h1>ERROR</h1>
  }

  return (
    <>
      <div className='flex justify-around'>
        <div className='xl:block lg:hidden md:hidden:sm:hidden'>
          <div className='grid grid-cols-2'>
            {data.map((product) => (
              <div key={product._id}>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
