// Importing necessary modules and models
import asyncHandler from '../middlewares/asyncHandler.js'
import Product from '../models/productModel.js'

/**
 * Validates product fields.
 * If creating a new product (isUpdate = false), all fields are required.
 * If updating, only validate the fields that are provided (e.g., price/quantity must be numbers).
 */
const validateProductFields = (fields, isUpdate = false) => {
  if (!isUpdate) {
    const { name, description, price, category, quantity, brand, image } =
      fields

    if (!name) return 'Name is required'
    if (!brand) return 'Brand is required'
    if (!description) return 'Description is required'
    if (!price) return 'Price is required'
    if (!category) return 'Category is required'
    if (!quantity) return 'Quantity is required'
    if (!image) return 'Image is required'
  } else {
    if (fields.price && isNaN(Number(fields.price)))
      return 'Price must be a number'
    if (fields.quantity && isNaN(Number(fields.quantity)))
      return 'Quantity must be a number'
  }

  return null
}

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const addProduct = asyncHandler(async (req, res) => {
  try {
    const validationError = validateProductFields(req.fields)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    // Automatically sets stock based on quantity via pre-save middleware
    const product = new Product({ ...req.fields })

    await product.save()
    res.status(201).json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    console.log('Received update request for product:', req.params.id)
    console.log('Raw incoming fields:', JSON.stringify(req.fields))

    const existingProduct = await Product.findById(req.params.id)
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const processedFields = { ...req.fields }

    // Normalize quantity to a number and update stock status accordingly
    if (processedFields.quantity !== undefined) {
      const rawQuantity = processedFields.quantity
      processedFields.quantity = parseInt(rawQuantity, 10)

      console.log(
        `Processing quantity: Original=${rawQuantity}, Parsed=${processedFields.quantity}`
      )

      if (isNaN(processedFields.quantity)) {
        processedFields.quantity = 0
      }

      processedFields.stock = processedFields.quantity > 0
    }

    const validationError = validateProductFields(processedFields, true)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    console.log('Final fields to update:', JSON.stringify(processedFields))

    // Update product in DB and return the updated document
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: processedFields },
      { new: true, runValidators: true }
    )

    console.log('Updated product:', {
      id: product._id,
      name: product.name,
      quantity: product.quantity,
      stock: product.stock,
    })

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
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

/**
 * @desc    Fetch paginated products with optional search
 * @route   GET /api/products
 * @access  Public
 */
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

/**
 * @desc    Get a product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
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

/**
 * @desc    Fetch all products (limited, newest first)
 * @route   GET /api/products/all
 * @access  Public
 */
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

/**
 * @desc    Add a review to a product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      )

      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ error: 'You have already reviewed this product' })
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

/**
 * @desc    Fetch top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4)
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Fetch most recent products
 * @route   GET /api/products/new
 * @access  Public
 */
const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(5)
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
})

/**
 * @desc    Filter products by category and price range
 * @route   POST /api/products/filter
 * @access  Public
 */
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

// Exporting all controller functions
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
