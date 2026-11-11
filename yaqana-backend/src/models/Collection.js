import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, unique: true },
  slug: { type: String, required: true, lowercase: true, trim: true, maxlength: 120, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Collection', schema);
