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

// Custom QuantityInput component to handle quantity changes correctly
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
        className='p-4 w-[24rem] border rounded-lg bg-[#101011] text-white'
        value={value}
        onChange={handleChange}
      />
      <div className='flex flex-col ml-2'>
        <button
          type='button'
          onClick={handleIncrement}
          className='bg-gray-700 text-white px-3 py-1 rounded-t-md hover:bg-gray-600'
        >
          +
        </button>
        <button
          type='button'
          onClick={handleDecrement}
          className='bg-gray-700 text-white px-3 py-1 rounded-b-md hover:bg-gray-600'
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
    return <div className='text-center p-5'>Loading product data...</div>

  return (
    <>
      <div className='container xl:mx-[9rem] sm:mx-[0]'>
        <div className='flex flex-col md:flex-row'>
          <div className='md:w-3/4 p-3'>
            <div className='h-12 text-2xl font-semibold'>
              Update / Delete Product
            </div>

            {image && (
              <div className='text-center'>
                <img
                  src={image}
                  alt='product'
                  className='block mx-auto max-h-[200px] object-contain'
                />
              </div>
            )}

            <div className='mb-3'>
              <label className='border text-white px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11 bg-[#101011]'>
                {imageModified ? 'Image Updated' : 'Update Image'}
                <input
                  type='file'
                  name='image'
                  accept='image/*'
                  onChange={uploadFileHandler}
                  className='hidden'
                />
              </label>
            </div>

            <div className='p-3'>
              <div className='flex flex-wrap'>
                <div className='one'>
                  <label htmlFor='name'>Name</label> <br />
                  <input
                    type='text'
                    className='p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white mr-[5rem]'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className='two'>
                  <label htmlFor='price'>Price</label> <br />
                  <input
                    type='number'
                    className='p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex flex-wrap'>
                <div>
                  <label htmlFor='quantity'>Quantity</label> <br />
                  <QuantityInput value={quantity} onChange={setQuantity} />
                  <p className='text-sm text-gray-500'>
                    Current quantity: {quantity || '0'}
                  </p>
                </div>
                <div>
                  <label htmlFor='brand'>Brand</label> <br />
                  <input
                    type='text'
                    className='p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex flex-wrap'>
                <div>
                  <label htmlFor='stock'>Stock Status</label> <br />
                  <select
                    className='p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white mr-[5rem]'
                    value={stock.toString()}
                    onChange={(e) => setStock(e.target.value === 'true')}
                  >
                    <option value='true'>In Stock</option>
                    <option value='false'>Out of Stock</option>
                  </select>
                  <p className='text-sm text-gray-500'>
                    Auto-updates based on quantity
                  </p>
                </div>
              </div>

              <label htmlFor='description' className='my-5'>
                Description
              </label>
              <textarea
                id='description'
                className='p-2 mb-3 bg-[#101011] border rounded-lg w-[95%] text-white'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />

              <div className='flex justify-between'>
                <div>
                  <label htmlFor='category'>Category</label> <br />
                  <select
                    id='category'
                    value={category}
                    className='p-4 mb-3 w-[30rem] border rounded-lg bg-[#101011] text-white mr-[5rem]'
                    onChange={(e) => setCategory(e.target.value)}
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

              <div className='mt-5'>
                <button
                  onClick={handleSubmit}
                  className='py-4 px-10 rounded-lg text-lg font-bold bg-green-600 mr-6 hover:bg-green-700 transition'
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  className='py-4 px-10 rounded-lg text-lg font-bold bg-pink-600 hover:bg-pink-700 transition'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminProductUpdate
