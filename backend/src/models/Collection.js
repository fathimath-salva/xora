import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100, unique: true },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
