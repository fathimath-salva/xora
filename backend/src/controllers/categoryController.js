import Category from '../models/Category.js';
import Product from '../models/Product.js';

const requiredCategorySlugs = new Set(['t-shirts', 'hoodies', 'shirts', 'trousers']);
const toCategorySlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getCategories = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const categories = await Category.find(isAdmin ? {} : { slug: { $in: ['t-shirts', 'hoodies', 'shirts', 'trousers'] }, active: { $ne: false } }).sort({ name: 1 });

    // Calculate real-time product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const escapedCategory = cat.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const count = await Product.countDocuments({
          category: { $regex: new RegExp(`^${escapedCategory}$`, 'i') },
          gender: { $in: ['men', 'unisex'] },
          active: { $ne: false }
        });
        return {
          ...cat.toObject(),
          itemCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: isAdmin ? categoriesWithCount : categoriesWithCount.filter((category) => ['t-shirts', 'hoodies', 'shirts', 'trousers'].includes(category.slug))
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, gender } = req.body;

    if (!name || !requiredCategorySlugs.has(toCategorySlug(String(name)))) {
      return res.status(400).json({
        success: false,
        message: 'Use one of the four catalogue categories: T-Shirts, Hoodies, Shirts, or Trousers.'
      });
    }

    const slug = toCategorySlug(name);
    const existing = await Category.findOne({ slug });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      gender: gender || 'all'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    const { name, description, image, gender } = req.body;
    if (name && name !== category.name) {
      return res.status(400).json({ success: false, message: 'The four customer catalogue category names are fixed.' });
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (gender) category.gender = gender;
    if (typeof req.body.active === 'boolean' && !requiredCategorySlugs.has(category.slug)) category.active = req.body.active;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    if (requiredCategorySlugs.has(category.slug)) {
      return res.status(409).json({ success: false, message: 'The four customer catalogue categories cannot be deleted.' });
    }

    category.active = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category archived successfully.'
    });
  } catch (error) {
    next(error);
  }
};
