import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorProfile,
  getDoctorAvailableSlots,
  createDoctor,
  updateDoctor,
  updateDoctorAvailability,
  deleteDoctor,
  getSpecializations,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);


router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);

router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorAvailableSlots);


router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctor);
router.put('/:id/availability', protect, authorize('doctor', 'admin'), updateDoctorAvailability);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
