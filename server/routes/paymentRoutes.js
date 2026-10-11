import express from 'express';
import { createOrder, verifyPayment, demoPay, getRazorpayKey } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/key', protect, getRazorpayKey);
router.post('/create-order', protect, authorize('patient'), createOrder);
router.post('/verify', protect, authorize('patient'), verifyPayment);
router.post('/demo-pay', protect, authorize('patient'), demoPay);

export default router;
