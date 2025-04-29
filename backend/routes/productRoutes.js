import express from 'express'
import formidable from 'express-formidable'
const router = express.Router()

// Import controllers
import {
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
  applyProductDiscount,
  removeProductDiscount,
  applyBulkDiscount,
} from '../controllers/productController.js'

// Import middlewares
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'
import checkId from '../middlewares/checkId.js'

// ======================================
// PUBLIC ROUTES
// ======================================

// Product listing routes
router.route('/').get(fetchProducts)
router.route('/allproducts').get(fetchAllProducts)
router.route('/top').get(fetchTopProducts)
router.route('/new').get(fetchNewProducts)

// Single product details
router.route('/:id').get(fetchProductById)

// Product filtering
router.route('/filtered-products').post(filterProducts)

// ======================================
// AUTHENTICATED ROUTES
// ======================================

// Product reviews
router.route('/:id/reviews').post(authenticate, checkId, addProductReview)

// ======================================
// ADMIN ROUTES
// ======================================

// Product CRUD operations
router.route('/').post(authenticate, authorizeAdmin, formidable(), addProduct)

router
  .route('/:id')
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct)

// Discount management
router
  .route('/:id/discount')
  .put(authenticate, authorizeAdmin, applyProductDiscount)
  .delete(authenticate, authorizeAdmin, removeProductDiscount)

// Bulk operations
router
  .route('/bulk-discount')
  .post(authenticate, authorizeAdmin, applyBulkDiscount)

export default router
