import { initializeKhaltiPayment, verifyKhaltiPayment } from './khalti.js'
import Payment from '../models/paymentModel.js'
import PurchasedItem from '../models/purchasedItemModel.js'
import Item from '../models/itemModel.js'

// Initialize Khalti payment gateway
export const initializekhalti = async (req, res) => {
  try {
    const { itemId, totalPrice, website_url } = req.body

    // Find the item to ensure it exists and price matches
    const itemData = await Item.findOne({
      _id: itemId,
      price: Number(totalPrice),
    })

    if (!itemData) {
      return res.status(400).json({
        success: false,
        message: 'Item not found or price mismatch',
      })
    }

    // Creating a purchase document to store purchase info
    const purchasedItemData = await PurchasedItem.create({
      item: itemId,
      paymentMethod: 'khalti',
      totalPrice: totalPrice * 100, // Convert to paisa
    })

    // Initialize payment with Khalti
    const paymentInitiate = await initializeKhaltiPayment({
      amount: totalPrice * 100, // Amount in paisa (Rs * 100)
      purchase_order_id: purchasedItemData._id.toString(), // Purchase order ID for verification
      purchase_order_name: itemData.name,
      return_url: `${process.env.BACKEND_URI}/api/payment/khalti/verify`, // Consistent API endpoint path
      website_url,
    })

    res.json({
      success: true,
      purchasedItemData,
      payment: paymentInitiate,
    })
  } catch (error) {
    console.error('Khalti initialization error:', error)
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message,
    })
  }
}

// Verify Khalti payment
export const verifykhalti = async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query

  try {
    // Verify payment with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx)

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== 'Completed' ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        paymentInfo,
      })
    }

    // Check if purchase order exists
    const purchasedItemData = await PurchasedItem.findOne({
      _id: purchase_order_id,
      totalPrice: amount,
    })

    if (!purchasedItemData) {
      return res.status(400).json({
        success: false,
        message: 'Purchased item data not found',
      })
    }

    // Update purchase record status
    await PurchasedItem.findByIdAndUpdate(purchase_order_id, {
      $set: {
        status: 'completed',
      },
    })

    // Create payment record
    const paymentData = await Payment.create({
      pidx,
      transactionId: transaction_id,
      productId: purchase_order_id,
      amount,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: 'khalti',
      status: 'success',
    })

    // Send success response
    res.json({
      success: true,
      message: 'Payment successful',
      paymentData,
    })
  } catch (error) {
    console.error('Khalti verification error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during payment verification',
      error: error.message,
    })
  }
}
