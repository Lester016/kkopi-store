import { Router } from 'express';

import {
  addEmployeeDetails,
  deleteUser,
  getAllUsers,
  getUser,
  getUserSchedule,
  updateSchedule,
  updateUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import {
  AddEmployeeDetailsSchema,
  UpdateScheduleSchema,
  UpdateUserSchema,
  validateSchema,
} from '../middleware/validateSchema';

const router = Router();

router.route('/').get(protect, getAllUsers);
router.route('/:id').get(protect, getUser);
router.route('/:id').put(protect, validateSchema(UpdateUserSchema), updateUser);
router.route('/:id').delete(protect, deleteUser);
router.route('/:id/schedule').get(protect, getUserSchedule);
router
  .route('/:id/schedule')
  .put(protect, validateSchema(UpdateScheduleSchema), updateSchedule);
router
  .route('/:id/create-employee')
  .post(protect, validateSchema(AddEmployeeDetailsSchema), addEmployeeDetails);

export default router;
