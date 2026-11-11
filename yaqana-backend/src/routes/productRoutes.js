import { Router } from 'express';
import {
  getProducts, getProductById, createProduct, updateProduct, archiveProduct,
  getCollections, createCollection, renameCollection, removeCollection
} from '../controllers/catalogController.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', optionalAuth, getProducts);
router.get('/collections', optionalAuth, getCollections);
router.post('/collections', requireAuth, requireAdmin, createCollection);
router.put('/collections/:name', requireAuth, requireAdmin, renameCollection);
router.delete('/collections/:name', requireAuth, requireAdmin, removeCollection);
router.post('/', requireAuth, requireAdmin, createProduct);
router.get('/:id', optionalAuth, getProductById);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, archiveProduct);
export default router;
