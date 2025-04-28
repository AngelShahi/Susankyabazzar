import express from 'express'
import formidable from 'express-formidable'
const router = express.Router()

// controllers
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
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'
import checkId from '../middlewares/checkId.js'

router
  .route('/')
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct)

router.route('/allproducts').get(fetchAllProducts)
router.route('/:id/reviews').post(authenticate, checkId, addProductReview)

router.get('/top', fetchTopProducts)
router.get('/new', fetchNewProducts)

router
  .route('/:id')
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct)

router
  .route('/:id/discount')
  .put(authenticate, authorizeAdmin, applyProductDiscount)
  .delete(authenticate, authorizeAdmin, removeProductDiscount)

router
  .route('/bulk-discount')
  .post(authenticate, authorizeAdmin, applyBulkDiscount)

router.route('/filtered-products').post(filterProducts)

export default router
