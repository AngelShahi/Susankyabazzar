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
    // New discount fields
    discount: {
      percentage: { type: Number, default: 0 },
      active: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date },
      name: { type: String, default: '' }, // e.g., "Dashain Discount"
    },
  },
  {
    timestamps: true,
  }
)

// Add virtual for getting the discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (
    this.discount.active &&
    this.discount.percentage > 0 &&
    new Date() >= this.discount.startDate &&
    new Date() <= this.discount.endDate
  ) {
    return this.price * (1 - this.discount.percentage / 100)
  }
  return this.price
})

// Ensure virtuals are included when converting to JSON
productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

// Enforce consistent stock calculation
productSchema.pre('save', function (next) {
  // If quantity is 0 or less, set stock to false, otherwise true
  if (this.isModified('quantity')) {
    this.stock = this.quantity > 0
  }
  next()
})

const Product = mongoose.model('Product', productSchema)
export default Product
