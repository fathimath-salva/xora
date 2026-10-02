import express from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  syncCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.put('/update', updateQuantity);
router.post('/sync', syncCart);
router.delete('/:itemId', removeFromCart);

export default router;
