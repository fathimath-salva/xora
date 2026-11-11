import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  description: { type: String, default: '', maxlength: 500 },
  image: { type: String, default: '' },
  gender: { type: String, enum: ['all', 'men', 'women', 'unisex'], default: 'all' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ name: 1 }, { unique: true });
export default mongoose.model('Category', schema);
