import express from 'express'
import {
  initializekhalti,
  verifykhalti,
} from '../controllers/initializeKhaltiController.js'
import Item from '../models/itemModel.js'  

const router = express.Router()

// Khalti payment routes
router.post('/khalti/initiate', initializekhalti)
router.get('/khalti/verify', verifykhalti)

// Endpoint to create test item
router.post('/create-item', async (req, res) => {
  try {
    let itemData = await Item.create({
      name: req.body.name || 'Headphone',
      price: req.body.price || 500,
      inStock: req.body.inStock !== undefined ? req.body.inStock : true,
      category: req.body.category || 'electronics',
    })

    res.json({
      success: true,
      item: itemData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    })
  }
})

export default router // Change this to default export
