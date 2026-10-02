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
      type: [String],
      default: ['S', 'M', 'L', 'XL']
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
    fabricDetails: {
      type: String,
      default: '100% Organic Mulberry Silk & Italian Merino Wool blend. Dry clean only.'
    },
    fitDetails: {
      type: String,
      default: 'Tailored drape, true to size. Model is 5\'10" wearing size S.'
    },
    shippingDetails: {
      type: String,
      default: 'Complimentary express shipping across India. 30-day effortless returns.'
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
