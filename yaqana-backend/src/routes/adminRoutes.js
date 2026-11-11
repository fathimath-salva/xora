import { Router } from 'express';
import { getDashboardStats, getCustomers, updateCustomerStatus } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/status', updateCustomerStatus);
export default router;
