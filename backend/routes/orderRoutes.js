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
} from '../controllers/orderController.js'

import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js'

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
router.route('/:id/cancel').put(authenticate, cancelOrder);
router
  .route('/:id/deliver')
  .put(authenticate, authorizeAdmin, markOrderAsDelivered)

export default router
