import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
  addressLine2: { type: String, trim: true, default: '', maxlength: 200 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  country: { type: String, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ user: 1, isDefault: -1, createdAt: -1 });
export default mongoose.model('Address', schema);
