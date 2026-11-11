import mongoose from 'mongoose';
import Address from '../models/Address.js';
import { asyncHandler, httpError } from '../utils/http.js';
const fields = ['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'];
function validateAddress(body) {
  for (const key of ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode']) if (!String(body?.[key] || '').trim()) throw httpError(400, `${key} is required.`);
  if (!/^\d{6}$/.test(String(body.postalCode))) throw httpError(400, 'Enter a valid 6-digit PIN code.');
  if (!/^\d{10}$/.test(String(body.phone).replace(/\D/g, ''))) throw httpError(400, 'Enter a valid 10-digit phone number.');
}
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, addresses });
});
export const createAddress = asyncHandler(async (req, res) => {
  validateAddress(req.body);
  const shouldDefault = req.body.isDefault === true || !(await Address.exists({ user: req.user._id }));
  if (shouldDefault) await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  const data = Object.fromEntries(fields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  const address = await Address.create({ ...data, country: data.country || 'India', user: req.user._id, isDefault: shouldDefault });
  res.status(201).json({ success: true, message: 'Address saved successfully.', address });
});
export const updateAddress = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Address not found.');
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw httpError(404, 'Address not found.');
  const next = { ...address.toObject(), ...req.body };
  validateAddress(next);
  for (const key of fields) if (req.body[key] !== undefined) address[key] = req.body[key];
  if (req.body.isDefault === true) {
    await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    address.isDefault = true;
  }
  await address.save();
  res.json({ success: true, message: 'Address updated successfully.', address });
});
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw httpError(404, 'Address not found.');
  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (next) { next.isDefault = true; await next.save(); }
  }
  res.json({ success: true, message: 'Address deleted successfully.' });
});
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw httpError(404, 'Address not found.');
  await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();
  res.json({ success: true, message: 'Default address updated.', address });
});
