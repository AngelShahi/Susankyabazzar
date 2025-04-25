import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'

// Utility Function
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
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
  }
}

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body

    if (orderItems && orderItems.length === 0) {
      res.status(400)
      throw new Error('No order items')
    }

    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    })

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      )

      if (!matchingItemFromDB) {
        res.status(404)
        throw new Error(`Product not found: ${itemFromClient._id}`)
      }

      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      }
    })

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems)

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })

    const createdOrder = await order.save()
    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    // Count distinct order documents instead of all status changes
    const totalOrders = await Order.countDocuments()
    res.json({ totalOrders })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const calculateTotalSales = async (req, res) => {
  try {
    // Only include paid orders in total sales calculation
    const orders = await Order.find({ isPaid: true })
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    )
    res.json({ totalSales: totalSales.toFixed(2) })
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
          // Count distinct orders per day instead of status changes
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

// Modified function to handle the payment proof image
const uploadPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    // Check if the user is authorized (either admin or the order owner)
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401)
      throw new Error('Not authorized')
    }

    // Update the order with the payment proof image URL
    order.paymentProofImage = req.body.imageUrl

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Modify the markOrderAsPaid function to be admin-only
const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (order) {
      // Check if payment proof is uploaded
      if (!order.paymentProofImage) {
        res.status(400)
        throw new Error('Payment proof image is required')
      }

      // Update inventory for each ordered item
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product)
        if (product) {
          // Decrease quantity based on order amount
          product.quantity = Math.max(0, product.quantity - item.qty)
          // Pre-save hook will automatically update the stock boolean
          await product.save()
        }
      }

      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
        id: req.body.id || Date.now().toString(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.body.email_address || '',
      }

      const updateOrder = await order.save()
      res.status(200).json(updateOrder)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404)
      throw new Error('Order not found')
    }

    // Check if the user is an admin
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

    // Check if the user is authorized (either admin or the order owner)
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401)
      throw new Error('Not authorized')
    }

    // Can only cancel if not paid yet
    if (order.isPaid) {
      res.status(400)
      throw new Error('Cannot cancel paid orders')
    }

    // Store cancellation details
    order.isCancelled = true
    order.cancelledAt = Date.now()
    order.cancellationReason = req.body.reason || 'No reason provided'

    const updatedOrder = await order.save()
    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Export the new function
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
}
