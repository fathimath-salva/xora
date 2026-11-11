import { Router } from 'express';
import { getCategories, createCategory, updateCategory, archiveCategory } from '../controllers/catalogController.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', optionalAuth, getCategories);
router.post('/', requireAuth, requireAdmin, createCategory);
router.put('/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/:id', requireAuth, requireAdmin, archiveCategory);
export default router;
