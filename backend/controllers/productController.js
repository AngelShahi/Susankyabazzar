import asyncHandler from '../middlewares/asyncHandler.js'
import Product from '../models/productModel.js'

// Centralized validation to avoid repetition
const validateProductFields = (fields) => {
  const { name, description, price, category, quantity, brand, image } = fields

  if (!name) return 'Name is required'
  if (!brand) return 'Brand is required'
  if (!description) return 'Description is required'
  if (!price) return 'Price is required'
  if (!category) return 'Category is required'
  if (!quantity) return 'Quantity is required'
  if (!image) return 'Image is required'

  return null
}

const addProduct = asyncHandler(async (req, res) => {
  try {
    // Validate required fields
    const validationError = validateProductFields(req.fields)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const product = new Product({ ...req.fields })
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    // Validate required fields
    const validationError = validateProductFields(req.fields)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.fields },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
})

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6
    const page = Number(req.query.pageNumber) || 1

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {}

    const count = await Product.countDocuments({ ...keyword })
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page * pageSize < count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      return res.json(product)
    } else {
      res.status(404).json({ error: 'Product not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Product not found' })
  }
})

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category')
      .limit(12)
      .sort({ createdAt: -1 })

    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      )

      if (alreadyReviewed) {
        res.status(400)
        throw new Error('Product already reviewed')
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      }

      product.reviews.push(review)
      product.numReviews = product.reviews.length
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length

      await product.save()
      res.status(201).json({ message: 'Review added' })
    } else {
      res.status(404).json({ error: 'Product not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4)
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(5)
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body

    let args = {}
    if (checked && checked.length > 0) args.category = checked
    if (radio && radio.length >= 2)
      args.price = { $gte: radio[0], $lte: radio[1] }

    const products = await Product.find(args)
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server Error' })
  }
})

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
}
