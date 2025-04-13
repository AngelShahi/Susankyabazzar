// controllers/cartController.js
import asyncHandler from '../middlewares/asyncHandler.js'
import Cart from '../models/cartModel.js'
import { addDecimals } from '../utils/cartUtils.js'

// Get cart for current user
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id

  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    // Create a new cart if one doesn't exist
    cart = await Cart.create({
      user: userId,
      cartItems: [],
      itemsPrice: '0.00',
      taxPrice: '0.00',
      shippingPrice: '0.00',
      totalPrice: '0.00',
    })
  }

  res.status(200).json(cart)
})

const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { _id, name, image, price, qty, product } = req.body

    console.log('Request body:', req.body)

    // Validate incoming data
    if (!product || !name || price === undefined || qty === undefined) {
      return res
        .status(400)
        .json({ message: 'Missing required product information' })
    }

    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = await Cart.create({
        user: userId,
        cartItems: [],
        itemsPrice: '0.00',
        taxPrice: '0.00',
        shippingPrice: '0.00',
        totalPrice: '0.00',
      })
    }

    // Find the existing item if any using the product ID
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === product.toString()
    )

    // Update or add the item
    if (itemIndex > -1) {
      // Update existing item
      cart.cartItems[itemIndex].qty = qty
    } else {
      // Add new item
      const newItem = {
        _id,
        name,
        image,
        price,
        qty,
        product,
      }
      cart.cartItems.push(newItem)
    }

    // Calculate prices
    cart.itemsPrice = addDecimals(
      cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )

    cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 10)

    cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)))

    cart.totalPrice = (
      Number(cart.itemsPrice) +
      Number(cart.shippingPrice) +
      Number(cart.taxPrice)
    ).toFixed(2)

    // Save cart
    const updatedCart = await cart.save()
    console.log('Updated cart:', updatedCart)

    res.status(200).json(updatedCart)
  } catch (error) {
    console.error('Cart update error:', error)
    res.status(500).json({
      message: 'Failed to update cart',
      error: error.message,
      stack: error.stack,
    })
  }
})
// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const productId = req.params.id

  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  // Remove item from cart
  cart.cartItems = cart.cartItems.filter((x) => x._id.toString() !== productId)

  // Calculate prices
  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )

  cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 10)

  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)))

  cart.totalPrice = (
    Number(cart.itemsPrice) +
    Number(cart.shippingPrice) +
    Number(cart.taxPrice)
  ).toFixed(2)

  // Save cart
  await cart.save()

  res.status(200).json(cart)
})

// Update shipping address
const saveShippingAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { address, city, postalCode, country } = req.body

  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  cart.shippingAddress = { address, city, postalCode, country }

  await cart.save()

  res.status(200).json(cart)
})

// Update payment method
const savePaymentMethod = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { paymentMethod } = req.body

  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  cart.paymentMethod = paymentMethod

  await cart.save()

  res.status(200).json(cart)
})

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id

  let cart = await Cart.findOne({ user: userId })

  if (!cart) {
    res.status(404)
    throw new Error('Cart not found')
  }

  cart.cartItems = []
  cart.itemsPrice = '0.00'
  cart.taxPrice = '0.00'
  cart.shippingPrice = '0.00'
  cart.totalPrice = '0.00'

  await cart.save()

  res.status(200).json(cart)
})

export {
  getCart,
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
}
