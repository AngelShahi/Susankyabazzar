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

  // Custom styles based on the specified color theme
  const styles = {
    primaryBg: 'rgb(7, 10, 19)', // Dark navy/black primary color
    secondaryBg: 'rgb(13, 17, 30)', // Slightly lighter shade for contrast
    tertiaryBg: 'rgb(20, 25, 40)', // Even lighter shade for input fields
    accentColor: 'rgb(211, 190, 249)', // Lavender accent color
    accentHover: 'rgb(190, 170, 228)', // Slightly darker lavender for hover states
    lightText: 'rgb(240, 240, 245)', // Light text for dark backgrounds
    mediumText: 'rgb(200, 200, 210)', // Medium text for better readability
  }

  return (
    <div style={{ backgroundColor: styles.primaryBg }} className='min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        {/* Mobile filter toggle */}
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
          {/* Filters Section */}
          <div
            className={`${
              isFilterOpen ? 'block' : 'hidden'
            } md:block md:w-1/4 lg:w-1/5`}
          >
            <div
              className='rounded-lg shadow-xl overflow-hidden sticky top-4'
              style={{ backgroundColor: styles.secondaryBg }}
            >
              {/* Search */}
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

              {/* Categories */}
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

              {/* Brands */}
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

              {/* Price Filter */}
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
                  Price Filter
                </h2>
                <div className='p-4'>
                  <input
                    type='text'
                    placeholder='Enter Price'
                    value={priceFilter}
                    onChange={handlePriceChange}
                    className='w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors'
                    style={{
                      backgroundColor: styles.tertiaryBg,
                      color: styles.lightText,
                      border: '1px solid rgba(211, 190, 249, 0.3)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </div>
              </div>

              {/* Reset Button */}
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

          {/* Products Grid */}
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
                  {searchTerm
                    ? 'No products match your search criteria.'
                    : 'Try adjusting your filters to find products.'}
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
