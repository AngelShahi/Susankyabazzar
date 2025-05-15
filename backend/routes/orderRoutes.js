import express from 'express'
const router = express.Router()

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  uploadPaymentProof,
  cancelOrder,
  // Add new Khalti routes
  initializeOrderKhaltiPayment,
  verifyOrderKhaltiPayment,
} from '../controllers/orderController.js'

import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'

// Existing routes
router
  .route('/')
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders)

router.route('/mine').get(authenticate, getUserOrders)
router.route('/total-orders').get(countTotalOrders)
router.route('/total-sales').get(calculateTotalSales)
router.route('/total-sales-by-date').get(calcualteTotalSalesByDate)
router.route('/:id').get(authenticate, findOrderById)
router.route('/:id/payment-proof').put(authenticate, uploadPaymentProof)
router.route('/:id/pay').put(authenticate, markOrderAsPaid)
router.route('/:id/cancel').put(authenticate, cancelOrder)
router
  .route('/:id/deliver')
  .put(authenticate, authorizeAdmin, markOrderAsDelivered)

// New Khalti routes
router
  .route('/:id/khalti/initialize')
  .post(authenticate, initializeOrderKhaltiPayment)
// The verification route is accessible without authentication as it's called by Khalti servers
router.route('/khalti/verify').get(verifyOrderKhaltiPayment)

export default router
