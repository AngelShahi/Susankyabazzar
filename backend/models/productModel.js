import mongoose from 'mongoose'
const { ObjectId } = mongoose.Schema

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
)

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true }, // Main inventory field
    stock: { type: Boolean, default: true },
    category: { type: ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

// Enforce consistent stock calculation
productSchema.pre('save', function (next) {
  // If quantity is 0 or less, set stock to false, otherwise true
  // Only update stock if it's not explicitly set (allows admin override)
  if (this.isModified('quantity')) {
    this.stock = this.quantity > 0
  }
  next()
})

const Product = mongoose.model('Product', productSchema)
export default Product
