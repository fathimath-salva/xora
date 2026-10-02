import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Calculate real-time product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
        });
        return {
          ...cat.toObject(),
          itemCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, gender } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (gender) category.gender = gender;

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

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
