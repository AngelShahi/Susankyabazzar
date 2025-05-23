import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import { initializeKhaltiPayment, verifyKhaltiPayment } from './khalti.js'

// Utility Function
function calcPrices(orderItems) {
  // Calculate itemsPrice (discounted price) and totalSavings
  const { itemsPrice, totalSavings } = orderItems.reduce(
    (acc, item) => {
      const isDiscountValid =
        item.discount &&
        item.discount.active &&
        item.discount.percentage > 0 &&
        item.discount.startDate &&
        item.discount.endDate &&
        new Date() >= new Date(item.discount.startDate) &&
        new Date() <= new Date(item.discount.endDate)

      const originalPrice = isDiscountValid
        ? item.price / (1 - item.discount.percentage / 100)
        : item.price
      const itemTotal = item.price * item.qty
      const savings = isDiscountValid
        ? (originalPrice - item.price) * item.qty
        : 0

      return {
        itemsPrice: acc.itemsPrice + itemTotal,
        totalSavings: acc.totalSavings + savings,
      }
    },
    { itemsPrice: 0, totalSavings: 0 }
  )

  const shippingPrice = itemsPrice > 100 ? 0 : 10
  const taxRate = 0.15
  const taxPrice = (itemsPrice * taxRate).toFixed(2)

  const totalPrice = (
    itemsPrice +
    shippingPrice +
    parseFloat(taxPrice)
  ).toFixed(2)

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
    totalSavings: totalSavings.toFixed(2),
  }
}

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body

    if (orderItems && orderItems.length === 0) {
      res.status(400)
      throw new Error('No order items')
    }

    // Fetch products from DB
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x.product) },
    })

    // Map order items and validate discounts
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient.product
      )

      if (!matchingItemFromDB) {
        res.status(404)
        throw new Error(`Product not found: ${itemFromClient.product}`)
      }

      // Validate discount
      const isDiscountValid =
        itemFromClient.discount &&
        itemFromClient.discount.active &&
        itemFromClient.discount.percentage > 0 &&
        itemFromClient.discount.startDate &&
        itemFromClient.discount.endDate &&
        new Date() >= new Date(itemFromClient.discount.startDate) &&
        new Date() <= new Date(itemFromClient.discount.endDate)

      const expectedPrice = isDiscountValid
        ? matchingItemFromDB.price *
          (1 - itemFromClient.discount.percentage / 100)
        : matchingItemFromDB.price

      if (Math.abs(itemFromClient.price - expectedPrice) > 0.01) {
        res.status(400)
        throw new Error(`Invalid price for product: ${itemFromClient.name}`)
      }

      return {
        name: itemFromClient.name,
        qty: itemFromClient.qty,
        image: itemFromClient.image,
        price: itemFromClient.price, // Discounted price
        product: itemFromClient.product,
        discount: isDiscountValid ? itemFromClient.discount : null,
      }
    })

    // Calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice, totalSavings } =
      calcPrices(dbOrderItems)

    // Create order
    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      totalSavings,
    })

    const createdOrder = await order.save()
    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id username')
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const countTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    res.json({ totalOrders })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const calculateTotalSales = async (req, res) => {
  try {
    const orders = await Order.find({ isPaid: true })
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    )
    const totalSavings = orders.reduce(
      (sum, order) => sum + Number(order.totalSavings),
      0
    )
    res.json({
      totalSales: totalSales.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const calcualteTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
          },
          totalSales: { $sum: { $toDouble: '$totalPrice' } },
          totalSavings: { $sum: { $toDouble: '$totalSavings' } },
          orderCount: { $sum: 1 },
        },
      },
    ])

    res.json(salesByDate)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const findOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'username email'
    )

    if (order) {
      res.json(order)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const uploadPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401)
      throw new Error('Not authorized')
    }

    order.paymentProofImage = req.body.imageUrl

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    // Only require paymentProofImage for QRPayment
    if (order.paymentMethod === 'QRPayment' && !order.paymentProofImage) {
      res.status(400)
      throw new Error('Payment proof image is required for QR Payment')
    }

    // Update product quantities
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product)
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.qty)
        await product.save()
      }
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id || `PAY_${order.paymentMethod}_${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.body.email_address || order.user.email || '',
    }

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    console.error('Error in markOrderAsPaid:', {
      message: error.message,
      stack: error.stack,
    })
    res.status(error.status || 500).json({ error: error.message })
  }
}

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    if (!req.user.isAdmin) {
      res.status(401)
      throw new Error('Not authorized')
    }

    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401)
      throw new Error('Not authorized')
    }

    if (order.isPaid) {
      res.status(400)
      throw new Error('Cannot cancel paid orders')
    }

    order.isCancelled = true
    order.cancelledAt = Date.now()
    order.cancellationReason = req.body.reason || 'No reason provided'

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Khalti Payment Integration
const initializeOrderKhaltiPayment = async (req, res) => {
  try {
    const { id: orderId } = req.params
    const { website_url } = req.body

    console.log('Initiating Khalti payment with params:', {
      orderId,
      website_url,
    })

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('Invalid order ID format:', orderId)
      return res.status(400).json({ error: 'Invalid order ID format' })
    }

    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      console.error('Order not found:', { orderId })
      return res.status(404).json({ error: 'Order not found' })
    }

    console.log('Order details:', {
      orderId: order._id.toString(),
      totalPrice: order.totalPrice,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
    })

    // Authorization check
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      console.error('Unauthorized access to order:', {
        orderId,
        userId: req.user._id,
      })
      return res.status(401).json({ error: 'Not authorized' })
    }

    if (order.isPaid) {
      console.error('Order already paid:', { orderId })
      return res.status(400).json({ error: 'Order is already paid' })
    }

    // Initialize Khalti payment
    console.log('Calling initializeKhaltiPayment with:', {
      amount: Math.round(parseFloat(order.totalPrice) * 100),
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order #${order._id}`,
      return_url: `${process.env.BACKEND_URI}/api/orders/khalti/verify`,
      website_url: website_url || process.env.BASE_URL,
    })

    const paymentInitiate = await initializeKhaltiPayment({
      amount: Math.round(parseFloat(order.totalPrice) * 100),
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order #${order._id}`,
      return_url: `${process.env.BACKEND_URI}/api/orders/khalti/verify`,
      website_url: website_url || process.env.BASE_URL,
    })

    console.log('Khalti payment response:', paymentInitiate)

    // Update order
    order.paymentResult = {
      id: paymentInitiate.pidx,
      status: 'INITIATED',
      update_time: new Date().toISOString(),
    }

    await order.save()
    console.log('Order updated with payment initiation:', { orderId })

    res.json({
      success: true,
      order,
      payment: paymentInitiate,
    })
  } catch (error) {
    console.error('Detailed error in initializeOrderKhaltiPayment:', {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
      requestBody: req.body,
    })
    res.status(error.status || 500).json({ error: error.message })
  }
}

import mongoose from 'mongoose'

const verifyOrderKhaltiPayment = async (req, res) => {
  try {
    const {
      pidx,
      txnId,
      amount,
      mobile,
      purchase_order_id,
      purchase_order_name,
      transaction_id,
    } = req.query

    // Log incoming query parameters
    console.log('Khalti verify query:', {
      pidx,
      purchase_order_id,
      txnId,
      amount,
      mobile,
      purchase_order_name,
      transaction_id,
    })

    // Validate BASE_URL
    if (!process.env.BASE_URL) {
      console.error('BASE_URL is not defined')
      throw new Error('Server configuration error: BASE_URL is not defined')
    }

    // Validate purchase_order_id
    if (!purchase_order_id) {
      console.error('Missing purchase_order_id in Khalti callback')
      console.log('Falling back to orderhistory redirect')
      return res.redirect(
        `${process.env.BASE_URL}/orderhistory?paymentSuccess=true&error=Missing%20order%20ID`
      )
    }

    // Validate if purchase_order_id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(purchase_order_id)) {
      console.error('Invalid purchase_order_id format:', purchase_order_id)
      console.log('Falling back to orderhistory redirect')
      return res.redirect(
        `${process.env.BASE_URL}/orderhistory?paymentSuccess=true&error=Invalid%20order%20ID%20format`
      )
    }

    // Find the order
    const order = await Order.findById(purchase_order_id)
    if (!order) {
      console.error('Order not found in database:', { purchase_order_id })
      console.log('Falling back to orderhistory redirect')
      return res.redirect(
        `${process.env.BASE_URL}/orderhistory?paymentSuccess=true&error=Order%20not%20found%20for%20ID%20${purchase_order_id}`
      )
    }

    // Log order details
    console.log('Order found:', {
      orderId: order._id.toString(),
      totalPrice: order.totalPrice,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
      userId: order.user.toString(),
    })

    // Verify Khalti payment
    const paymentInfo = await verifyKhaltiPayment(pidx)
    if (!paymentInfo || paymentInfo?.status !== 'Completed') {
      console.error('Payment verification failed:', { pidx, paymentInfo })
      throw new Error('Payment verification failed')
    }

    // Validate payment amount
    const expectedAmount = Math.round(parseFloat(order.totalPrice) * 100)
    if (Number(paymentInfo.total_amount) !== expectedAmount) {
      console.error('Payment amount mismatch:', {
        totalAmount: paymentInfo.total_amount,
        expectedAmount,
      })
      throw new Error('Payment amount mismatch')
    }

    // Update product quantities
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product)
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.qty)
        await product.save()
      } else {
        console.warn('Product not found for item:', { productId: item.product })
      }
    }

    // Update order status
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentMethod = 'khalti'
    order.paymentResult = {
      id: pidx,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: paymentInfo.user?.name || '',
      transaction_id: transaction_id || txnId || '',
    }

    const updatedOrder = await order.save()
    console.log('Order updated successfully:', {
      orderId: order._id.toString(),
    })

    // Construct and redirect to order details page
    const redirectUrl = `${
      process.env.BASE_URL
    }/order/${order._id.toString()}?paymentSuccess=true`
    console.log('Redirecting to:', redirectUrl)
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('Khalti verification error:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
    })
    const errorMessage = encodeURIComponent(
      error.message || 'Payment verification failed'
    )
    console.log('Falling back to orderhistory redirect due to error')
    res.redirect(
      `${
        process.env.BASE_URL || 'http://localhost:5173'
      }/orderhistory?paymentSuccess=true&error=${errorMessage}`
    )
  }
}

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findOrderById,
  uploadPaymentProof,
  markOrderAsPaid,
  markOrderAsDelivered,
  cancelOrder,
  initializeOrderKhaltiPayment,
  verifyOrderKhaltiPayment,
}
