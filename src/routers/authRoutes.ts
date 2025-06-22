import { Router } from 'express';

import {
  authUser,
  refreshToken,
  registerUser,
  verifyUser,
} from '../controllers/authController';
import {
  LoginSchema,
  RegisterSchema,
  validateSchema,
} from '../middleware/validateSchema';

const router = Router();

router.get('/verify-email', verifyUser);
router.post('/register', validateSchema(RegisterSchema), registerUser);
router.post('/login', validateSchema(LoginSchema), authUser);
router.post('/refresh', refreshToken);

export default router;
