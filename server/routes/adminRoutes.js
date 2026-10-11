import express from 'express';
import {
  getDashboardStats,
  getAllDoctors,
  getAllPatients,
  getAdminAllAppointments,
  getAnalytics,
  addDoctor,
  updateDoctorById,
  deleteDoctorById,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();


router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatients);
router.get('/appointments', getAdminAllAppointments);
router.get('/analytics', getAnalytics);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctorById);
router.delete('/doctors/:id', deleteDoctorById);

export default router;
