import { Router } from 'express';

import multer from 'multer';
import {
  checkIn,
  checkOut,
  getAttendanceRecords,
} from '../controllers/attendanceController';
import { getAllUsers, getUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { UpdateUserSchema, validateSchema } from '../middleware/validateSchema';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(protect, getAllUsers);
router.route('/check-in').post(protect, upload.single('image'), checkIn);
router.route('/check-out').post(protect, upload.single('image'), checkOut);
router.route('/records').get(protect, getAttendanceRecords);

export default router;
