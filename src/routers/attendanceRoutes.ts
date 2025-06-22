import { Router } from 'express';

import {
  checkIn,
  checkOut,
  getAttendanceRecords,
} from '../controllers/attendanceController';
import { getAllUsers, getUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { UpdateUserSchema, validateSchema } from '../middleware/validateSchema';

const router = Router();

router.route('/').get(protect, getAllUsers);
router.route('/check-in').post(protect, checkIn);
router.route('/check-out').post(protect, checkOut);
router.route('/records').get(protect, getAttendanceRecords);

export default router;
