import mongoose from 'mongoose'
const { ObjectId } = mongoose.Schema

// ======================================
// SCHEMA DEFINITIONS
// ======================================

/**
 * Review Sub-Schema
 * Defines the structure for product reviews
 */
const reviewSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

/**
 * Main Product Schema
 * Defines the structure for products including inventory and discount information
 */
const productSchema = mongoose.Schema(
  {
    // Basic Product Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Inventory Management
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stock: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Reviews and Ratings
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Discount Information
    discount: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      active: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      name: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ======================================
// VIRTUAL PROPERTIES
// ======================================

/**
 * Virtual for calculating discounted price
 * Returns the discounted price if discount is active and valid
 * Otherwise returns the regular price
 */
productSchema.virtual('discountedPrice').get(function () {
  const now = new Date()
  const isDiscountValid =
    this.discount.active &&
    this.discount.percentage > 0 &&
    this.discount.startDate &&
    this.discount.endDate &&
    now >= this.discount.startDate &&
    now <= this.discount.endDate

  return isDiscountValid
    ? this.price * (1 - this.discount.percentage / 100)
    : this.price
})

// ======================================
// MIDDLEWARE/HOOKS
// ======================================

/**
 * Pre-save hook to automatically update stock status
 * based on quantity changes
 */
productSchema.pre('save', function (next) {
  if (this.isModified('quantity')) {
    this.stock = this.quantity > 0
  }
  next()
})

// ======================================
// MODEL EXPORT
// ======================================

const Product = mongoose.model('Product', productSchema)
export default Product
