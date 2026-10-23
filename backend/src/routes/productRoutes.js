import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createCollection,
  renameCollection,
  removeCollection
} from '../controllers/productController.js';
import { getCollections } from '../controllers/productController.js';
import { optionalProtect, protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getProducts)
  .post(protect, adminOnly, createProduct);

router.get('/collections', optionalProtect, getCollections);
router.post('/collections', protect, adminOnly, createCollection);
router.put('/collections/:name', protect, adminOnly, renameCollection);
router.delete('/collections/:name', protect, adminOnly, removeCollection);

router.route('/:id')
  .get(optionalProtect, getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
