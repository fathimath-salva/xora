import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    gender: {
      type: String,
      required: [true, 'Gender target is required'],
      enum: ['men', 'women', 'unisex'],
      default: 'unisex'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price must be positive']
    },
    sizes: {
      type: [String], default: []
    },
    colours: [
      {
        name: { type: String, required: true },
        hex: { type: String, default: '#D4C5B9' }
      }
    ],
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 20,
      min: [0, 'Stock cannot be negative']
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: [(val) => val.length > 0, 'Please provide at least one product image']
    },
    featured: {
      type: Boolean,
      default: false
    },
    newArrival: {
      type: Boolean,
      default: false
    },
    bestSeller: {
      type: Boolean,
      default: false
    },
    fabricDetails: { type: String, trim: true, default: '' },
    fitDetails: { type: String, trim: true, default: '' },
    careInstructions: { type: String, trim: true, default: '' },
    collectionName: { type: String, trim: true, default: '' },
    measurements: { type: mongoose.Schema.Types.Mixed, default: undefined },
    shippingDetails: { type: String, trim: true, default: '' },
    // Legacy catalogue records predate the active flag. Treat a missing flag as
    // active; explicit false remains the archive state used by admin actions.
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual('collection').get(function () { return this.collectionName; }).set(function (value) { this.collectionName = value; });

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ gender: 1, category: 1, createdAt: -1 });
productSchema.index({ newArrival: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
export default Product;
