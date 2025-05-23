import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFilteredProductsQuery } from '../redux/api/productApiSlice'
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice'
import {
  setCategories,
  setProducts,
  setChecked,
} from '../redux/features/shop/shopSlice'
import ProductCard from './Products/ProductCard'

// Custom Loader Component
const CustomLoader = () => (
  <div className='flex justify-center items-center'>
    <div className='animate-spin rounded-full h-10 w-10 border-4 border-purple-300 border-t-transparent'></div>
  </div>
)

const Shop = () => {
  const dispatch = useDispatch()
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  )

  const categoriesQuery = useFetchCategoriesQuery()
  const [priceFilter, setPriceFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(8)

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
        const filteredProducts = filteredProductsQuery.data.filter(
          (product) => {
            const matchesExactPrice =
              priceFilter === '' ||
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)

            const matchesPriceRange =
              (minPrice === '' || product.price >= parseFloat(minPrice)) &&
              (maxPrice === '' || product.price <= parseFloat(maxPrice))

            const matchesSearch =
              searchTerm === '' ||
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.description &&
                product.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (product.brand &&
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()))

            return matchesExactPrice && matchesPriceRange && matchesSearch
          }
        )

        dispatch(setProducts(filteredProducts))
        setCurrentPage(1) // Reset to first page when filters change
      }
    }
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    dispatch,
    priceFilter,
    minPrice,
    maxPrice,
    searchTerm,
  ])

  const handleBrandClick = (brand) => {
    const productsByBrand = filteredProductsQuery.data?.filter(
      (product) => product.brand === brand
    )
    dispatch(setProducts(productsByBrand))
    setCurrentPage(1) // Reset to first page when brand changes
  }

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id)
    dispatch(setChecked(updatedChecked))
  }

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
    setPriceFilter(e.target.value)
  }

  const handleMinPriceChange = (e) => {
    const value = e.target.value
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setMinPrice(value)
    }
  }

  const handleMaxPriceChange = (e) => {
    const value = e.target.value
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setMaxPrice(value)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }

  const resetFilters = () => {
    setPriceFilter('')
    setMinPrice('')
    setMaxPrice('')
    setSearchTerm('')
    dispatch(setChecked([]))
    dispatch(setProducts(filteredProductsQuery.data || []))
    setCurrentPage(1) // Reset to first page when filters are reset
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  )
  const totalPages = Math.ceil(products.length / productsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const styles = {
    primaryBg: 'rgb(7, 10, 19)',
    secondaryBg: 'rgb(13, 17, 30)',
    tertiaryBg: 'rgb(20, 25, 40)',
    accentColor: 'rgb(211, 190, 249)',
    accentHover: 'rgb(190, 170, 228)',
    lightText: 'rgb(240, 240, 245)',
    mediumText: 'rgb(200, 200, 210)',
  }

  return (
    <div style={{ backgroundColor: styles.primaryBg }} className='min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        <button
          className='md:hidden w-full py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-2 shadow-lg transition-all duration-300'
          style={{
            backgroundColor: styles.secondaryBg,
            color: styles.accentColor,
            border: `1px solid ${styles.accentColor}`,
          }}
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
          <div
            className={`${
              isFilterOpen ? 'block' : 'hidden'
            } md:block md:w-1/4 lg:w-1/5`}
          >
            <div
              className='rounded-lg shadow-xl overflow-hidden sticky top-4'
              style={{ backgroundColor: styles.secondaryBg }}
            >
              <div
                className='border-b'
                style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
              >
                <h2
                  className='text-lg font-semibold py-3 px-4'
                  style={{
                    backgroundColor: styles.tertiaryBg,
                    color: styles.accentColor,
                  }}
                >
                  Search Products
                </h2>
                <div className='p-4'>
                  <form onSubmit={handleSearchSubmit} className='relative'>
                    <input
                      type='text'
                      placeholder='Search products...'
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className='w-full px-3 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 transition-colors'
                      style={{
                        backgroundColor: styles.tertiaryBg,
                        color: styles.lightText,
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke={styles.accentColor}
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
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke={styles.accentColor}
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

              <div
                className='border-b'
                style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
              >
                <h2
                  className='text-lg font-semibold py-3 px-4'
                  style={{
                    backgroundColor: styles.tertiaryBg,
                    color: styles.accentColor,
                  }}
                >
                  Categories
                </h2>
                <div className='p-4 space-y-3'>
                  {categories?.map((c) => (
                    <div key={c._id} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`cat-${c._id}`}
                        onChange={(e) => handleCheck(e.target.checked, c._id)}
                        className='w-4 h-4 rounded focus:ring-2'
                        style={{
                          accentColor: styles.accentColor,
                          backgroundColor: styles.tertiaryBg,
                        }}
                      />
                      <label
                        htmlFor={`cat-${c._id}`}
                        className='ml-3 text-sm cursor-pointer hover:opacity-90'
                        style={{ color: styles.mediumText }}
                      >
                        {c.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className='border-b'
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <h2
                  className='text-lg font-semibold py-3 px-4'
                  style={{
                    backgroundColor: styles.tertiaryBg,
                    color: styles.accentColor,
                  }}
                >
                  Brands
                </h2>
                <div className='p-4 space-y-3'>
                  {uniqueBrands?.map((brand) => (
                    <div key={brand} className='flex items-center'>
                      <input
                        type='radio'
                        id={`brand-${brand}`}
                        name='brand'
                        onChange={() => handleBrandClick(brand)}
                        className='w-4 h-4 rounded-full focus:ring-2'
                        style={{
                          accentColor: styles.accentColor,
                          backgroundColor: styles.tertiaryBg,
                        }}
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className='ml-3 text-sm cursor-pointer hover:opacity-90'
                        style={{ color: styles.mediumText }}
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className='border-b'
                style={{ borderColor: 'rgba(211, 190, 249, 0.2)' }}
              >
                <h2
                  className='text-lg font-semibold py-3 px-4'
                  style={{
                    backgroundColor: styles.tertiaryBg,
                    color: styles.accentColor,
                  }}
                >
                  Price Filters
                </h2>
                <div className='p-4 space-y-4'>
                  <div>
                    <label
                      className='block text-sm mb-2'
                      style={{ color: styles.mediumText }}
                    >
                      Exact Price
                    </label>
                    <input
                      type='number'
                      placeholder='Enter Exact Price'
                      value={priceFilter}
                      onChange={handlePriceChange}
                      min='0'
                      className='w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors'
                      style={{
                        backgroundColor: styles.tertiaryBg,
                        color: styles.lightText,
                        border: '1px solid rgba(211, 190, 249, 0.3)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className='block text-sm mb-2'
                      style={{ color: styles.mediumText }}
                    >
                      Price Range
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='number'
                        placeholder='Min Price'
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        min='0'
                        className='w-1/2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors'
                        style={{
                          backgroundColor: styles.tertiaryBg,
                          color: styles.lightText,
                          border: '1px solid rgba(211, 190, 249, 0.3)',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <input
                        type='number'
                        placeholder='Max Price'
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        min='0'
                        className='w-1/2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors'
                        style={{
                          backgroundColor: styles.tertiaryBg,
                          color: styles.lightText,
                          border: '1px solid rgba(211, 190, 249, 0.3)',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </div>
                    {minPrice &&
                      maxPrice &&
                      parseFloat(minPrice) > parseFloat(maxPrice) && (
                        <p
                          className='text-sm mt-2'
                          style={{ color: 'rgb(255, 100, 100)' }}
                        >
                          Minimum price cannot exceed maximum price
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className='p-4'>
                <button
                  className='w-full py-3 px-4 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2'
                  style={{
                    backgroundColor: styles.accentColor,
                    color: styles.primaryBg,
                  }}
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className='flex-1'>
            <div
              className='rounded-lg shadow-lg p-5 mb-6'
              style={{ backgroundColor: styles.secondaryBg }}
            >
              <div className='flex items-center justify-between'>
                <h2
                  className='text-xl font-semibold'
                  style={{ color: styles.lightText }}
                >
                  {products?.length || 0} Products Found
                </h2>
                {searchTerm && (
                  <div
                    className='px-3 py-1 rounded-full'
                    style={{ backgroundColor: 'rgba(211, 190, 249, 0.15)' }}
                  >
                    <p
                      className='text-sm flex items-center gap-2'
                      style={{ color: styles.accentColor }}
                    >
                      <span>Search: {searchTerm}</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className='hover:opacity-80'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
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
                    </p>
                  </div>
                )}
                {(minPrice || maxPrice) && (
                  <div
                    className='px-3 py-1 rounded-full ml-2'
                    style={{ backgroundColor: 'rgba(211, 190, 249, 0.15)' }}
                  >
                    <p
                      className='text-sm flex items-center gap-2'
                      style={{ color: styles.accentColor }}
                    >
                      <span>
                        Price Range: {minPrice || '0'} - {maxPrice || '∞'}
                      </span>
                      <button
                        onClick={() => {
                          setMinPrice('')
                          setMaxPrice('')
                        }}
                        className='hover:opacity-80'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
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
                    </p>
                  </div>
                )}
              </div>
            </div>

            {filteredProductsQuery.isLoading ? (
              <div
                className='flex flex-col justify-center items-center h-64 rounded-lg shadow-lg p-6'
                style={{ backgroundColor: styles.secondaryBg }}
              >
                <CustomLoader />
                <p className='mt-6' style={{ color: styles.mediumText }}>
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div
                className='flex flex-col justify-center items-center h-64 rounded-lg shadow-lg p-6'
                style={{ backgroundColor: styles.secondaryBg }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-16 w-16 mb-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke={styles.accentColor}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <p
                  className='text-lg font-medium'
                  style={{ color: styles.lightText }}
                >
                  No products found
                </p>
                <p
                  className='mt-2 text-center'
                  style={{ color: styles.mediumText }}
                >
                  {searchTerm || minPrice || maxPrice
                    ? 'No products match your search or price criteria.'
                    : 'Try adjusting your filters to find products.'}
                </p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {currentProducts?.map((p) => (
                    <div key={p._id} className='h-full'>
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div
                    className='mt-8 flex flex-wrap justify-center gap-2'
                    style={{ color: styles.lightText }}
                  >
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='px-4 py-2 rounded-lg transition-all duration-300'
                      style={{
                        backgroundColor:
                          currentPage === 1
                            ? 'rgba(211, 190, 249, 0.2)'
                            : styles.accentColor,
                        color:
                          currentPage === 1
                            ? styles.mediumText
                            : styles.primaryBg,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className='px-4 py-2 rounded-lg transition-all duration-300'
                        style={{
                          backgroundColor:
                            currentPage === index + 1
                              ? styles.accentColor
                              : styles.secondaryBg,
                          color:
                            currentPage === index + 1
                              ? styles.primaryBg
                              : styles.lightText,
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className='px-4 py-2 rounded-lg transition-all duration-300'
                      style={{
                        backgroundColor:
                          currentPage === totalPages
                            ? 'rgba(211, 190, 249, 0.2)'
                            : styles.accentColor,
                        color:
                          currentPage === totalPages
                            ? styles.mediumText
                            : styles.primaryBg,
                        cursor:
                          currentPage === totalPages
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
