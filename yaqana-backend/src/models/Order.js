import mongoose from 'mongoose';
import { paiseToCatalogUnits } from '../utils/money.js';
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, image: { type: String, default: '' }, category: { type: String, default: '' },
  pricePaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger }, quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true }, colour: { type: String, required: true }
}, { _id: false, toJSON: { transform(_doc, ret) { ret.price = paiseToCatalogUnits(ret.pricePaise); return ret; } } });
const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, phone: { type: String, required: true }, addressLine1: { type: String, required: true },
  addressLine2: { type: String, default: '' }, city: { type: String, required: true }, state: { type: String, required: true },
  postalCode: { type: String, required: true }, country: { type: String, default: 'India' }
}, { _id: false });
const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  idempotencyKey: { type: String, select: false }, requestHash: { type: String, select: false },
  items: { type: [itemSchema], required: true }, shippingAddress: { type: addressSchema, required: true },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Google Pay (UPI)', 'PhonePe (UPI)', 'Paytm (UPI)', 'UPI', 'Test/Mock Online Payment'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Partially Refunded', 'Refunded'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'RTO'], default: 'Confirmed' },
  subtotalPaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger }, shippingFeePaise: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
  taxPaise: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger }, totalPaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  notes: { type: String, default: '', maxlength: 1000 }, statusHistory: [{ status: String, changedBy: mongoose.Schema.Types.ObjectId, reason: String, at: { type: Date, default: Date.now } }]
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform(_doc, ret) {
    ret.subtotal = paiseToCatalogUnits(ret.subtotalPaise);
    ret.shippingFee = paiseToCatalogUnits(ret.shippingFeePaise);
    ret.tax = paiseToCatalogUnits(ret.taxPaise);
    ret.total = paiseToCatalogUnits(ret.totalPaise);
    delete ret.requestHash; delete ret.__v;
    return ret;
  } }
});
schema.index({ customer: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } });
schema.index({ orderStatus: 1, createdAt: -1 });
schema.index({ paymentStatus: 1, createdAt: -1 });
export default mongoose.model('Order', schema);
