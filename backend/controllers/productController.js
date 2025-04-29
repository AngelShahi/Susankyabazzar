// Importing necessary modules and models
import asyncHandler from '../middlewares/asyncHandler.js'
import Product from '../models/productModel.js'

// ======================================
// UTILITY FUNCTIONS
// ======================================

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

// ======================================
// PRODUCT CONTROLLERS
// ======================================

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const addProduct = asyncHandler(async (req, res) => {
  const validationError = validateProductFields(req.fields)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  // Automatically sets stock based on quantity via pre-save middleware
  const product = new Product({ ...req.fields })
  await product.save()

  res.status(201).json(product)
})

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProductDetails = asyncHandler(async (req, res) => {
  const existingProduct = await Product.findById(req.params.id)
  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const processedFields = { ...req.fields }

  // Normalize quantity to a number and update stock status
  if (processedFields.quantity !== undefined) {
    processedFields.quantity = parseInt(processedFields.quantity, 10) || 0
    processedFields.stock = processedFields.quantity > 0
  }

  const validationError = validateProductFields(processedFields, true)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: processedFields },
    { new: true, runValidators: true }
  )

  res.json(product)
})

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(product)
})

/**
 * @desc    Fetch paginated products with optional search
 * @route   GET /api/products
 * @access  Public
 */
const fetchProducts = asyncHandler(async (req, res) => {
  const pageSize = 6
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
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
})

/**
 * @desc    Get a product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const fetchProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
})

/**
 * @desc    Fetch all products (limited, newest first)
 * @route   GET /api/products/all
 * @access  Public
 */
const fetchAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .populate('category')
    .limit(12)
    .sort({ createdAt: -1 })

  res.json(products)
})

/**
 * @desc    Add a review to a product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

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
})

/**
 * @desc    Fetch top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const fetchTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(4)
  res.json(products)
})

/**
 * @desc    Fetch most recent products
 * @route   GET /api/products/new
 * @access  Public
 */
const fetchNewProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(5)
  res.json(products)
})

/**
 * @desc    Filter products by category and price range
 * @route   POST /api/products/filter
 * @access  Public
 */
const filterProducts = asyncHandler(async (req, res) => {
  const { checked, radio } = req.body

  let args = {}
  if (checked?.length > 0) args.category = checked
  if (radio?.length >= 2) args.price = { $gte: radio[0], $lte: radio[1] }

  const products = await Product.find(args)
  res.json(products)
})

// ======================================
// DISCOUNT CONTROLLERS
// ======================================

/**
 * @desc    Apply discount to a product
 * @route   PUT /api/products/:id/discount
 * @access  Private/Admin
 */
const applyProductDiscount = asyncHandler(async (req, res) => {
  const { percentage, startDate, endDate, name } = req.body

  if (!percentage || percentage < 0 || percentage > 100) {
    return res
      .status(400)
      .json({ error: 'Valid discount percentage (0-100) is required' })
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start and end dates are required' })
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  product.discount = {
    percentage: Number(percentage),
    active: true,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    name: name || 'Special Offer',
  }

  await product.save()
  res.json({ message: 'Discount applied successfully', product })
})

/**
 * @desc    Remove discount from a product
 * @route   DELETE /api/products/:id/discount
 * @access  Private/Admin
 */
const removeProductDiscount = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  product.discount = {
    percentage: 0,
    active: false,
    startDate: null,
    endDate: null,
    name: '',
  }

  await product.save()
  res.json({ message: 'Discount removed successfully', product })
})

/**
 * @desc    Apply bulk discount to multiple products
 * @route   POST /api/products/bulk-discount
 * @access  Private/Admin
 */
const applyBulkDiscount = asyncHandler(async (req, res) => {
  const {
    productIds,
    percentage,
    startDate,
    endDate,
    name,
    categoryIds,
    brandNames,
  } = req.body

  if (!percentage || percentage < 0 || percentage > 100) {
    return res
      .status(400)
      .json({ error: 'Valid discount percentage (0-100) is required' })
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start and end dates are required' })
  }

  let query = {}

  // Build query based on provided filters
  if (productIds?.length > 0) {
    query._id = { $in: productIds }
  } else if (categoryIds?.length > 0) {
    query.category = { $in: categoryIds }
  } else if (brandNames?.length > 0) {
    query.brand = { $in: brandNames }
  } else {
    return res.status(400).json({
      error: 'Please specify products, categories, or brands to apply discount',
    })
  }

  const discountData = {
    'discount.percentage': Number(percentage),
    'discount.active': true,
    'discount.startDate': new Date(startDate),
    'discount.endDate': new Date(endDate),
    'discount.name': name || 'Special Offer',
  }

  const result = await Product.updateMany(query, { $set: discountData })
  res.json({
    message: `Discount applied to ${result.modifiedCount} products`,
    modifiedCount: result.modifiedCount,
  })
})

// ======================================
// EXPORT ALL CONTROLLERS
// ======================================

export {
  // Product controllers
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

  // Discount controllers
  applyProductDiscount,
  removeProductDiscount,
  applyBulkDiscount,
}
