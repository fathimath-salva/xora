import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  updateCustomerStatus
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/status', updateCustomerStatus);

export default router;
