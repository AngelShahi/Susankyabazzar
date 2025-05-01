// Packages import
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Utils / Config
import connectDB from './config/db.js'

// Routes
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js' // Added payment routes

dotenv.config()
const port = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Initialize Express App
const app = express()

// Middleware
app.use(express.json()) // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })) // For parsing form data
app.use(cookieParser()) // To handle cookies

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/payment', paymentRoutes) // Added payment routes

// Static uploads folder
const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Start server
app.listen(port, () => console.log(`Server running on port: ${port}`))
