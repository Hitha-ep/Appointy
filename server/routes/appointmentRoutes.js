import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);


router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/doctor/me', protect, authorize('doctor'), getDoctorAppointments);


router.get('/', protect, authorize('admin'), getAllAppointments);

router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/reschedule', protect, authorize('patient'), rescheduleAppointment);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;
