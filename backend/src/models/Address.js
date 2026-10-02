import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address Line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State / Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Address = mongoose.model('Address', addressSchema);
export default Address;
