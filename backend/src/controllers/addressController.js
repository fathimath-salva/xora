import Address from '../models/Address.js';

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full recipient and address details.'
      });
    }

    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.'
      });
    }

    const { isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      address
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default address updated.',
      address
    });
  } catch (error) {
    next(error);
  }
};
