import express from 'express'
import {
  getCart,
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} from '../controllers/cartController.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All cart routes require authentication
router.use(authenticate)

router.route('/').get(getCart).post(addToCart).delete(clearCart)

router.route('/item/:id').delete(removeFromCart)
router.route('/shipping').put(saveShippingAddress)
router.route('/payment').put(savePaymentMethod)

export default router
