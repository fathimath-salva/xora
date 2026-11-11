import mongoose from 'mongoose';
import { paiseToCatalogUnits } from '../utils/money.js';

const colourSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  hex: { type: String, default: '#D4C5B9', match: /^#[0-9A-Fa-f]{6}$/ }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  description: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'men' },
  pricePaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  discountPricePaise: { type: Number, default: null, min: 0, validate: (value) => value == null || Number.isSafeInteger(value) },
  sizes: { type: [String], default: [] },
  colours: { type: [colourSchema], default: [] },
  stock: { type: Number, default: 0, min: 0, validate: Number.isInteger },
  images: { type: [String], default: [] },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  fabricDetails: { type: String, trim: true, default: '' },
  fitDetails: { type: String, trim: true, default: '' },
  careInstructions: { type: String, trim: true, default: '' },
  collectionName: { type: String, trim: true, default: '' },
  measurements: { type: mongoose.Schema.Types.Mixed, default: undefined },
  shippingDetails: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform(_doc, ret) {
    // Compatibility adapter for the unchanged storefront, which currently reads legacy catalogue-unit `price` fields.
    ret.price = paiseToCatalogUnits(ret.pricePaise);
    ret.discountPrice = ret.discountPricePaise == null ? null : paiseToCatalogUnits(ret.discountPricePaise);
    ret.collection = ret.collectionName;
    delete ret.__v;
    return ret;
  } },
  toObject: { virtuals: true }
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });
productSchema.index({ active: 1, gender: 1, category: 1, createdAt: -1 });
productSchema.index({ active: 1, newArrival: 1, createdAt: -1 });
productSchema.index({ collectionName: 1, active: 1 });
export default mongoose.model('Product', productSchema);
