const express = require('express')
const router = express.Router()
const {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
} = require('../controllers/khalti')
const Payment = require('../models/paymentmodel')
const PurchasedItem = require('../models/purchaseitemodel')
const Product = require('../../models/itemmodel')
const mongoose = require('mongoose')

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  const { itemId } = req.body
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format',
    })
  }
  next()
}

// Route to initialize Khalti payment
router.post('/initialize-khalti', validateObjectId, async (req, res) => {
  try {
    let { itemId, quantity, unitPrice, website_url } = req.body

    // Convert to appropriate types and validate
    quantity = Number(quantity)
    unitPrice = Number(unitPrice)

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity. Must be a positive number.',
      })
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price. Must be a positive number.',
      })
    }

    const websiteURL = website_url || 'http://localhost:5000'

    // Find product
    const productData = await Product.findOne({
      _id: new mongoose.Types.ObjectId(itemId),
    })

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    // Calculate total price (in paisa for Khalti)
    const totalPrice = unitPrice * quantity
    const totalPriceInPaisa = totalPrice * 100

    // Create purchase record
    const purchasedItemData = await PurchasedItem.create({
      items: [
        {
          productId: itemId,
          name: productData.name,
          quantity,
          unitPrice,
        },
      ],
      totalPrice: totalPriceInPaisa,
      paymentMethod: 'khalti',
      status: 'pending',
    })

    // Initialize Khalti payment
    const payment = await initializeKhaltiPayment({
      amount: totalPriceInPaisa,
      purchase_order_id: purchasedItemData._id.toString(),
      purchase_order_name: productData.name,
      return_url: `${process.env.BACKEND_URI}/api/payment/complete-khalti-payment`,
      website_url: websiteURL,
    })

    return res.json({
      success: true,
      payment,
      purchase: purchasedItemData,
    })
  } catch (error) {
    console.error('Khalti Init Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during payment initialization',
    })
  }
})

// Route to verify Khalti payment
router.get('/complete-khalti-payment', async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query

  // Validate required parameters
  if (!pidx || !transaction_id || !amount || !purchase_order_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters for payment verification',
    })
  }

  try {
    // Verify payment with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx)

    // Validate payment status and data
    if (
      paymentInfo?.status !== 'Completed' ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete or mismatched payment information',
        paymentInfo,
      })
    }

    // Find the purchase order
    if (!mongoose.Types.ObjectId.isValid(purchase_order_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase order ID format',
      })
    }

    const purchasedItemData = await PurchasedItem.findOne({
      _id: new mongoose.Types.ObjectId(purchase_order_id),
      totalPrice: Number(amount),
    })

    if (!purchasedItemData) {
      return res.status(400).json({
        success: false,
        message: 'Purchased item data not found',
      })
    }

    // Update purchase status
    await PurchasedItem.findByIdAndUpdate(purchase_order_id, {
      $set: { status: 'completed' },
    })

    // Record payment
    const paymentData = await Payment.create({
      pidx,
      transactionId: transaction_id,
      productId: purchase_order_id,
      amount: Number(amount),
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: 'khalti',
      status: 'success',
    })

    res.json({
      success: true,
      message: 'Payment Successful',
      paymentData,
    })
  } catch (error) {
    console.error('Verification Error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during payment verification',
      error: error.message || 'Server error',
    })
  }
})

module.exports = router
