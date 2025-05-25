import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../../redux/api/productApiSlice'
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice'
import { toast } from 'react-toastify'

const ProductForm = () => {
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [brand, setBrand] = useState('')
  const [stock, setStock] = useState(true)
  const [imageUrl, setImageUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // Update stock when quantity changes
  useEffect(() => {
    setStock(Number(quantity) > 0)
  }, [quantity])

  const [uploadProductImage] = useUploadProductImageMutation()
  const [createProduct] = useCreateProductMutation()
  const { data: categories } = useFetchCategoriesQuery()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = new FormData()
      productData.append('image', image)
      productData.append('name', name)
      productData.append('description', description)
      productData.append('price', price)
      productData.append('category', category)
      productData.append('quantity', quantity)
      productData.append('brand', brand)
      productData.append('stock', stock)

      const { data } = await createProduct(productData)

      if (data.error) {
        toast.error('Product creation failed. Please try again.')
      } else {
        toast.success(`${data.name} has been created successfully`)
        navigate('/admin/allproductslist')
      }
    } catch (error) {
      console.error(error)
      toast.error('Product creation failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadFileHandler = async (e) => {
    const formData = new FormData()
    formData.append('image', e.target.files[0])

    try {
      const res = await uploadProductImage(formData).unwrap()
      toast.success(res.message)
      setImage(res.image)
      setImageUrl(res.image)
    } catch (error) {
      toast.error(error?.data?.message || error.error)
    }
  }

  // Custom quantity component with increment/decrement buttons
  const QuantityInput = () => {
    const handleIncrement = () => {
      setQuantity((prev) => (prev === '' ? '1' : String(Number(prev) + 1)))
    }

    const handleDecrement = () => {
      setQuantity((prev) => {
        const currentValue = prev === '' ? 0 : Number(prev)
        return currentValue > 1 ? String(currentValue - 1) : '0'
      })
    }

    return (
      <div className='flex items-center'>
        <input
          type='number'
          className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder='Enter quantity'
        />
        <div className='flex flex-col ml-2'>
          <button
            type='button'
            onClick={handleIncrement}
            className='bg-[rgb(211,190,249)] text-[rgb(7,10,19)] px-3 py-1 rounded-t-md hover:bg-[rgb(191,170,229)] transition-colors font-bold'
          >
            +
          </button>
          <button
            type='button'
            onClick={handleDecrement}
            className='bg-[rgb(211,190,249)] text-[rgb(7,10,19)] px-3 py-1 rounded-b-md hover:bg-[rgb(191,170,229)] transition-colors font-bold'
          >
            -
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-white py-8'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='bg-[rgba(20,23,34,0.7)] rounded-2xl shadow-lg border border-[rgba(211,190,249,0.2)] backdrop-blur-sm'>
          <div className='p-6 border-b border-[rgba(211,190,249,0.3)]'>
            <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
              Create New Product
            </h1>
            <p className='text-gray-400 mt-2'>
              Add a new product to your inventory
            </p>
          </div>

          <div className='p-6'>
            {/* Image Preview Section */}
            {imageUrl && (
              <div className='mb-8'>
                <div className='bg-[rgba(211,190,249,0.05)] p-4 rounded-xl border border-[rgba(211,190,249,0.3)] flex justify-center'>
                  <img
                    src={imageUrl}
                    alt='product'
                    className='max-h-[250px] object-contain rounded-lg'
                  />
                </div>
              </div>
            )}

            {/* Image Upload Section */}
            <div className='mb-8'>
              <label className='border-2 border-dashed border-[rgb(211,190,249)] text-[rgb(211,190,249)] px-4 block w-full text-center rounded-xl cursor-pointer font-bold py-12 bg-[rgba(211,190,249,0.05)] hover:bg-[rgba(211,190,249,0.1)] transition-all'>
                <div className='flex flex-col items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-12 w-12 mb-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                  <span className='text-xl'>
                    {image ? 'Image Selected ✓' : 'Upload Product Image'}
                  </span>
                  <span className='text-sm mt-2 text-gray-400'>
                    JPG, PNG or GIF up to 5MB
                  </span>
                </div>

                <input
                  type='file'
                  name='image'
                  accept='image/*'
                  onChange={uploadFileHandler}
                  className='hidden'
                />
              </label>
            </div>

            {/* Form Sections */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Name & Price Section */}
              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Product Name <span className='text-pink-500'>*</span>
                </label>
                <input
                  type='text'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter product name'
                  required
                />
              </div>

              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Price <span className='text-pink-500'>*</span>
                </label>
                <input
                  type='number'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder='0.00'
                  required
                />
              </div>

              {/* Quantity & Brand Section */}
              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Quantity <span className='text-pink-500'>*</span>
                </label>
                <QuantityInput />
                {quantity && Number(quantity) > 0 ? (
                  <p className='text-sm text-green-400 mt-2 flex items-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    In stock
                  </p>
                ) : (
                  <p className='text-sm text-red-400 mt-2 flex items-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 mr-1'
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
                    Out of stock
                  </p>
                )}
              </div>

              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Brand
                </label>
                <input
                  type='text'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder='Enter brand name'
                />
              </div>

              {/* Stock Status Indicator (Read-only) */}
              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Stock Status
                </label>
                <div
                  className={`p-4 w-full border ${
                    stock
                      ? 'border-green-600 bg-green-900/20'
                      : 'border-red-600 bg-red-900/20'
                  } rounded-lg text-white flex items-center justify-between`}
                >
                  <div className='flex items-center'>
                    {stock ? (
                      <>
                        <div className='w-3 h-3 rounded-full bg-green-500 mr-2'></div>
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <div className='w-3 h-3 rounded-full bg-red-500 mr-2'></div>
                        <span>Out of Stock</span>
                      </>
                    )}
                  </div>
                  <span className='text-xs text-gray-400'>
                    (Automatic based on quantity)
                  </span>
                </div>
              </div>

              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Category <span className='text-pink-500'>*</span>
                </label>
                <select
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all appearance-none'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D3BEF9'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5em',
                  }}
                  required
                >
                  <option value=''>Select a category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Section - Full Width */}
            <div className='mt-6'>
              <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                Description <span className='text-pink-500'>*</span>
              </label>
              <textarea
                className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all min-h-[150px]'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder='Detailed product description'
                required
              />
            </div>

            {/* Required Fields Note */}
            <div className='mt-4 text-sm text-gray-400'>
              <p>
                Fields marked with <span className='text-pink-500'>*</span> are
                required
              </p>
            </div>

            {/* Action Buttons */}
            <div className='mt-10 flex flex-wrap gap-4'>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='py-4 px-10 rounded-lg text-lg font-bold bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-[rgb(7,10,19)]'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Create Product
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/')}
                className='py-4 px-10 rounded-lg text-lg font-bold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
                    clipRule='evenodd'
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductForm
