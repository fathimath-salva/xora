import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['all', 'men', 'women', 'unisex'],
      default: 'all'
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Category = mongoose.model('Category', categorySchema);
export default Category;
