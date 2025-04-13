// controllers/favoriteController.js
import Favorite from '../models/favoriteModel.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import Product from '../models/productModel.js' // Assuming you have a Product model

// Add a product to user's favorites
const addToFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.body
  const userId = req.user._id

  try {
    // Check if this product-user favorite combination already exists
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId
    })

    if (existingFavorite) {
      return res.status(400).json({ message: 'Product is already in favorites' })
    }

    // Create new favorite
    const favorite = new Favorite({
      user: userId,
      product: productId
    })

    await favorite.save()

    // Get the product details to return to the client
    const product = await Product.findById(productId)

    res.status(201).json({
      message: 'Product added to favorites',
      favorite: {
        _id: favorite._id,
        product
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message })
  }
})

// Remove a product from user's favorites
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id

  const result = await Favorite.findOneAndDelete({
    user: userId,
    product: productId
  })

  if (!result) {
    return res.status(404).json({ message: 'Favorite not found' })
  }

  res.status(200).json({ message: 'Product removed from favorites' })
})

// Get all favorites for a user with product details
const getUserFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const favorites = await Favorite.find({ user: userId }).populate('product')

  // Transform data to match the format expected by the client
  const formattedFavorites = favorites.map(fav => fav.product)

  res.status(200).json(formattedFavorites)
})

export { addToFavorites, removeFromFavorites, getUserFavorites }