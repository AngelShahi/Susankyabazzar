// ============================================
// BACKEND: Fixed Cart Controller
// ============================================

import asyncHandler from '../middlewares/asyncHandler.js'
import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'
import { addDecimals } from '../utils/cartUtils.js'

// Get cart for current user
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id

  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'cartItems.product',
    select: 'name image price quantity discount',
  })

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      cartItems: [],
      itemsPrice: '0.00',
      taxPrice: '0.00',
      shippingPrice: '0.00',
      totalPrice: '0.00',
    })
  }

  // Ensure quantity is set for each cart item
  cart.cartItems = await Promise.all(
    cart.cartItems.map(async (item) => {
      const itemObject = item.toObject()
      // Use product.quantity if available, otherwise fallback to existing item.quantity or fetch from Product
      if (!itemObject.quantity) {
        const product = await Product.findById(item.product)
        itemObject.quantity = product?.quantity ?? item.quantity ?? 20
      }
      return itemObject
    })
  )

  res.status(200).json(cart)
})

// FIXED: Add item to cart with proper total calculations
const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { _id, name, image, price, qty, product, discount } = req.body

    console.log('Request body:', req.body)

    // Validate incoming data
    if (!product || !name || price === undefined || qty === undefined) {
      return res
        .status(400)
        .json({ message: 'Missing required product information' })
    }

    // Fetch the product to validate price, discount, and quantity
    const productDoc = await Product.findById(product)
    console.log('Product document:', productDoc)
    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Use productDoc.quantity as the source of truth
    const quantity = productDoc.quantity ?? 20 // Fallback to 20 if undefined

    // Validate quantity against stock
    if (qty > quantity) {
      return res
        .status(400)
        .json({ message: `Only ${quantity} items available in stock` })
    }

    // Calculate the correct price based on current discount status
    const now = new Date()
    const isDiscountValid =
      discount &&
      discount.active &&
      discount.percentage > 0 &&
      discount.startDate &&
      discount.endDate &&
      now >= new Date(discount.startDate) &&
      now <= new Date(discount.endDate)

    const expectedPrice = isDiscountValid
      ? productDoc.price * (1 - discount.percentage / 100)
      : productDoc.price

    // Validate provided price
    if (Math.abs(price - expectedPrice) > 0.01) {
      return res.status(400).json({
        message: 'Provided price does not match current product price',
      })
    }

    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
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
      cart.cartItems[itemIndex].price = price
      cart.cartItems[itemIndex].discount = isDiscountValid ? discount : null
      cart.cartItems[itemIndex].quantity = quantity // Ensure quantity is set
    } else {
      // Add new item
      const newItem = {
        _id,
        name,
        image,
        price,
        qty,
        product,
        discount: isDiscountValid ? discount : null,
        quantity, // Ensure quantity is set
      }
      cart.cartItems.push(newItem)
    }

    // FIXED: Calculate cart totals after updating items
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

    // Log cart before saving to verify quantity
    console.log('Cart before save:', JSON.stringify(cart, null, 2))

    // Save cart
    const updatedCart = await cart.save()

    // FIXED: Populate product details before sending response
    await updatedCart.populate({
      path: 'cartItems.product',
      select: 'name image price quantity discount',
    })

    console.log('Updated cart:', updatedCart)

    res.status(200).json(updatedCart)
  } catch (error) {
    console.error('Cart update error:', error)
    res.status(500).json({
      message: 'Failed to update cart',
      error: error.message,
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
