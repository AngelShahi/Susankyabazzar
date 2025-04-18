import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../../redux/api/productApiSlice'
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice'
import { toast } from 'react-toastify'

const ProductForm = () => {
  // Renamed from ProductList to better reflect its function
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [brand, setBrand] = useState('')
  const [stock, setStock] = useState(true) // Added stock state
  const [imageUrl, setImageUrl] = useState(null)
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

    try {
      const productData = new FormData()
      productData.append('image', image)
      productData.append('name', name)
      productData.append('description', description)
      productData.append('price', price)
      productData.append('category', category)
      productData.append('quantity', quantity)
      productData.append('brand', brand)
      productData.append('stock', stock) // Add stock to form data

      const { data } = await createProduct(productData)

      if (data.error) {
        toast.error('Product create failed. Try Again.')
      } else {
        toast.success(`${data.name} is created`)
        navigate('/')
      }
    } catch (error) {
      console.error(error)
      toast.error('Product create failed. Try Again.')
    }
  }

  const uploadFileHandler = async (e) => {
    // Upload handler remains the same
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

  return (
    <div className='container xl:mx-[9rem] sm:mx-[0]'>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-3/4 p-3'>
          <div className='text-2xl font-semibold mb-4 text-gray-800'>
            Create Product
          </div>

          {/* Image preview and upload section remains the same */}
          {imageUrl && (
            <div className='text-center'>
              <img
                src={imageUrl}
                alt='product'
                className='block mx-auto max-h-[200px]'
              />
            </div>
          )}

          <div className='mb-3'>
            <label className='border text-black px-4 block w-full text-center rounded-lg cursor-pointer font-bold py-11 bg-gray-200'>
              {image ? image.name : 'Upload Image'}

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
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className='two ml-10 '>
                <label htmlFor='name block'>Price</label> <br />
                <input
                  type='number'
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <div className='flex flex-wrap'>
              <div className='one'>
                <label htmlFor='name block'>Quantity</label> <br />
                <input
                  type='number'
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className='two ml-10 '>
                <label htmlFor='name block'>Brand</label> <br />
                <input
                  type='text'
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
            </div>

            {/* Added stock status dropdown */}
            <div className='flex flex-wrap mt-3'>
              <div className='one'>
                <label htmlFor='stock'>Stock Status</label> <br />
                <select
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
                  value={stock}
                  onChange={(e) => setStock(e.target.value === 'true')}
                >
                  <option value='true'>In Stock</option>
                  <option value='false'>Out of Stock</option>
                </select>
                <p className='text-sm text-gray-500'>
                  This will automatically update based on quantity
                </p>
              </div>
            </div>

            <label htmlFor='' className='my-5'>
              Description
            </label>
            <textarea
              type='text'
              className='p-2 mb-3 bg-gray-100 border rounded-lg w-[95%] text-black'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <div className='flex justify-between'>
              <div>
                <label htmlFor=''>Category</label> <br />
                <select
                  placeholder='Choose Category'
                  className='p-4 mb-3 w-[30rem] border rounded-lg bg-gray-100 text-black'
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

            <button
              onClick={handleSubmit}
              className='py-4 px-10 mt-5 rounded-lg text-lg font-bold bg-gray-600 text-white'
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductForm // Renamed component
