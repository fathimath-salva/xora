import mongoose from 'mongoose';
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String, required: true, maxlength: 20 },
  colour: { type: String, required: true, maxlength: 50 },
  quantity: { type: Number, required: true, min: 1, max: 20 }
}, { timestamps: true });
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, items: { type: [itemSchema], default: [] } }, { timestamps: true });
export default mongoose.model('Cart', schema);
