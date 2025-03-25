import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFilteredProductsQuery } from '../redux/api/productApiSlice'
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice'
import {
  setCategories,
  setProducts,
  setChecked,
} from '../redux/features/shop/shopSlice'
import Loader from '../components/Loader'
import ProductCard from './Products/ProductCard'

const Shop = () => {
  const dispatch = useDispatch()
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  )

  const categoriesQuery = useFetchCategoriesQuery()
  const [priceFilter, setPriceFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  })

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data))
    }
  }, [categoriesQuery.data, dispatch])

  useEffect(() => {
    if (!checked.length || !radio.length) {
      if (!filteredProductsQuery.isLoading) {
        // Filter products based on checked categories, price filter, and search term
        const filteredProducts = filteredProductsQuery.data.filter(
          (product) => {
            // Check if the product price includes the entered price filter value
            const matchesPrice =
              priceFilter === '' ||
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)

            // Check if product name or description matches search term
            const matchesSearch =
              searchTerm === '' ||
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.description &&
                product.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (product.brand &&
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()))

            return matchesPrice && matchesSearch
          }
        )

        dispatch(setProducts(filteredProducts))
      }
    }
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    dispatch,
    priceFilter,
    searchTerm,
  ])

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter(
      (product) => product.brand === brand
    )
    dispatch(setProducts(productsByBrand))
  }

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id)
    dispatch(setChecked(updatedChecked))
  }

  // Add "All Brands" option to uniqueBrands
  const uniqueBrands = [
    ...Array.from(
      new Set(
        filteredProductsQuery.data
          ?.map((product) => product.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ]

  const handlePriceChange = (e) => {
    // Update the price filter state when the user types in the input field
    setPriceFilter(e.target.value)
  }

  const handleSearchChange = (e) => {
    // Update the search term state when the user types in the search field
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Search is already applied via the useEffect
  }

  const resetFilters = () => {
    setPriceFilter('')
    setSearchTerm('')
    window.location.reload()
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <div className='bg-gray-100 min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        {/* Mobile filter toggle */}
        <button
          className='md:hidden w-full bg-gray-700 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 shadow-md'
          onClick={toggleFilter}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
            />
          </svg>
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className='flex flex-col md:flex-row gap-6'>
          {/* Filters Section */}
          <div
            className={`${
              isFilterOpen ? 'block' : 'hidden'
            } md:block md:w-1/4 lg:w-1/5`}
          >
            <div className='bg-white rounded-lg shadow-md overflow-hidden sticky top-4'>
              {/* Search */}
              <div className='border-b border-gray-200'>
                <h2 className='text-lg font-semibold bg-gray-700 text-white py-3 px-4'>
                  Search Products
                </h2>
                <div className='p-4'>
                  <form onSubmit={handleSearchSubmit} className='relative'>
                    <input
                      type='text'
                      placeholder='Search products...'
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className='w-full px-3 py-2 pl-8 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors'
                    />
                    <div className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        type='button'
                        onClick={() => setSearchTerm('')}
                        className='absolute inset-y-0 right-0 flex items-center pr-3'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 text-gray-400 hover:text-gray-600'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* Categories */}
              <div className='border-b border-gray-200'>
                <h2 className='text-lg font-semibold bg-gray-700 text-white py-3 px-4'>
                  Categories
                </h2>
                <div className='p-4 space-y-2'>
                  {categories?.map((c) => (
                    <div key={c._id} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`cat-${c._id}`}
                        onChange={(e) => handleCheck(e.target.checked, c._id)}
                        className='w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500'
                      />
                      <label
                        htmlFor={`cat-${c._id}`}
                        className='ml-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900'
                      >
                        {c.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className='border-b border-gray-200'>
                <h2 className='text-lg font-semibold bg-gray-700 text-white py-3 px-4'>
                  Brands
                </h2>
                <div className='p-4 space-y-2'>
                  {uniqueBrands?.map((brand) => (
                    <div key={brand} className='flex items-center'>
                      <input
                        type='radio'
                        id={`brand-${brand}`}
                        name='brand'
                        onChange={() => handleBrandClick(brand)}
                        className='w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-gray-500'
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className='ml-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900'
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className='border-b border-gray-200'>
                <h2 className='text-lg font-semibold bg-gray-700 text-white py-3 px-4'>
                  Price Filter
                </h2>
                <div className='p-4'>
                  <input
                    type='text'
                    placeholder='Enter Price'
                    value={priceFilter}
                    onChange={handlePriceChange}
                    className='w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors'
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className='p-4'>
                <button
                  className='w-full bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500'
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className='flex-1'>
            <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>
                {products?.length || 0} Products Found
              </h2>
              {searchTerm && (
                <p className='text-sm text-gray-600'>
                  Search results for:{' '}
                  <span className='font-medium'>{searchTerm}</span>
                </p>
              )}
            </div>

            {products.length === 0 ? (
              <div className='flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md p-6'>
                <Loader />
                <p className='mt-4 text-gray-600'>
                  {searchTerm
                    ? 'No products match your search criteria.'
                    : 'No products found.'}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {products?.map((p) => (
                  <div key={p._id} className='h-full'>
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
