import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from '../../redux/api/productApiSlice'
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice'
import { toast } from 'react-toastify'

// Custom QuantityInput component with enhanced styling
const QuantityInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const newValue = e.target.value

    // Only allow valid positive integers or empty string
    if (newValue === '' || /^\d+$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleIncrement = () => {
    const currentValue = value === '' ? 0 : parseInt(value, 10)
    onChange(String(currentValue + 1))
  }

  const handleDecrement = () => {
    const currentValue = value === '' ? 0 : parseInt(value, 10)
    if (currentValue > 0) {
      onChange(String(currentValue - 1))
    }
  }

  return (
    <div className='flex items-center'>
      <input
        type='text'
        pattern='\d*'
        className='p-4 w-[24rem] border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
        value={value}
        onChange={handleChange}
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
          disabled={value === '' || parseInt(value, 10) <= 0}
        >
          -
        </button>
      </div>
    </div>
  )
}

const AdminProductUpdate = () => {
  const params = useParams()
  const navigate = useNavigate()
  // Use a ref to track initial data load
  const initialLoadComplete = useRef(false)
  const formSubmitting = useRef(false)

  // RTK Query hooks
  const {
    data: productData,
    isLoading,
    refetch,
  } = useGetProductByIdQuery(params._id)
  const { data: categories = [] } = useFetchCategoriesQuery()
  const [uploadProductImage] = useUploadProductImageMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  // Form state
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [brand, setBrand] = useState('')
  const [stock, setStock] = useState(false)
  const [imageModified, setImageModified] = useState(false)

  // Initialize form data when product data is loaded
  useEffect(() => {
    if (productData && productData._id && !formSubmitting.current) {
      console.log('Loading product data:', productData)
      setName(productData.name)
      setDescription(productData.description)
      setPrice(productData.price)
      setCategory(productData.category?._id)
      // Explicitly convert quantity to string for form input
      setQuantity(String(productData.quantity))
      setBrand(productData.brand)
      setImage(productData.image)
      setStock(productData.quantity > 0)
      // Reset image modified flag when product data changes
      setImageModified(false)
      initialLoadComplete.current = true
    }
  }, [productData])

  // Update stock when quantity changes - but only after initial load
  useEffect(() => {
    if (initialLoadComplete.current && !formSubmitting.current) {
      // Make sure we're working with a valid number
      const numQuantity = quantity === '' ? 0 : Number(quantity)
      setStock(numQuantity > 0)
    }
  }, [quantity])

  const uploadFileHandler = async (e) => {
    const formData = new FormData()
    formData.append('image', e.target.files[0])
    try {
      const res = await uploadProductImage(formData).unwrap()
      toast.success('Image uploaded successfully')
      setImage(res.image)
      setImageModified(true)
    } catch (err) {
      toast.error('Image upload failed: ' + (err.data?.message || err.error))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    formSubmitting.current = true

    try {
      console.log('Submitting form with quantity:', quantity)

      // Create FormData object for the update
      const formData = new FormData()

      // Only append fields that are not empty or undefined
      if (name) formData.append('name', name)
      if (description) formData.append('description', description)
      if (price) formData.append('price', price)
      if (category) formData.append('category', category)
      if (quantity !== '') {
        // Ensure quantity is sent as a number
        const numQuantity = Number(quantity)
        console.log('Sending quantity as:', numQuantity)
        formData.append('quantity', numQuantity)
      }
      if (brand) formData.append('brand', brand)

      // Always include stock status
      formData.append('stock', stock)

      // Only include image if it was modified or it exists
      if (imageModified || image) {
        formData.append('image', image)
      }

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      // Update product using the RTK Query mutation
      const result = await updateProduct({
        productId: params._id,
        formData,
      }).unwrap()

      if (result._id) {
        toast.success(`Product "${result.name}" successfully updated`)
        // Reset formSubmitting flag to handle future updates properly
        formSubmitting.current = false
        // Navigate immediately - the cache invalidation will trigger a refresh
        navigate('/admin/allproductslist')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error(err.data?.error || 'Product update failed. Try again.')
      formSubmitting.current = false
    }
  }

  const handleDelete = async () => {
    try {
      let answer = window.confirm(
        'Are you sure you want to delete this product?'
      )
      if (!answer) return

      const result = await deleteProduct(params._id).unwrap()

      if (result._id) {
        toast.success(`"${result.name}" has been deleted`)
        navigate('/admin/allproductslist')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error(err.data?.error || 'Delete failed. Try again.')
    }
  }

  // Show loading state
  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen bg-[rgb(7,10,19)]'>
        <div className='text-[rgb(211,190,249)] text-2xl font-semibold animate-pulse'>
          Loading product data...
        </div>
      </div>
    )

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-white py-8'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='bg-[rgba(20,23,34,0.7)] rounded-2xl shadow-lg border border-[rgba(211,190,249,0.2)] backdrop-blur-sm'>
          <div className='p-6 border-b border-[rgba(211,190,249,0.3)]'>
            <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
              Update / Delete Product
            </h1>
          </div>

          <div className='p-6'>
            {/* Image Preview Section */}
            {image && (
              <div className='mb-8'>
                <div className='bg-[rgba(211,190,249,0.05)] p-4 rounded-xl border border-[rgba(211,190,249,0.3)] flex justify-center'>
                  <img
                    src={image}
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
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <span className='text-xl'>
                    {imageModified
                      ? 'Image Updated ✓'
                      : 'Click to Update Product Image'}
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
                  Product Name
                </label>
                <input
                  type='text'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter product name'
                />
              </div>

              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Price
                </label>
                <input
                  type='number'
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder='0.00'
                />
              </div>

              {/* Quantity & Brand Section */}
              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Quantity
                </label>
                <QuantityInput value={quantity} onChange={setQuantity} />
                <p className='text-sm text-gray-400 mt-2'>
                  Current quantity: {quantity || '0'}
                </p>
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

              {/* Stock Status & Category Section */}
              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Stock Status
                </label>
                <select
                  className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all appearance-none'
                  value={stock.toString()}
                  onChange={(e) => setStock(e.target.value === 'true')}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D3BEF9'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5em',
                  }}
                >
                  <option value='true'>In Stock</option>
                  <option value='false'>Out of Stock</option>
                </select>
                <p className='text-sm text-gray-400 mt-2'>
                  Auto-updates based on quantity
                </p>
              </div>

              <div>
                <label className='block text-[rgb(211,190,249)] font-medium mb-2'>
                  Category
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
                Description
              </label>
              <textarea
                className='p-4 w-full border border-gray-700 rounded-lg bg-[rgb(7,10,19)] text-white focus:border-[rgb(211,190,249)] focus:outline-none transition-all min-h-[150px]'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder='Detailed product description'
              />
            </div>

            {/* Action Buttons */}
            <div className='mt-10 flex flex-wrap gap-4'>
              <button
                onClick={handleSubmit}
                className='py-4 px-10 rounded-lg text-lg font-bold bg-[rgb(211,190,249)] text-[rgb(7,10,19)] hover:bg-[rgb(191,170,229)] transition-colors flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                Update Product
              </button>
              <button
                onClick={handleDelete}
                className='py-4 px-10 rounded-lg text-lg font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductUpdate
