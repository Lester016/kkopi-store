import { Router } from 'express';

import attendance from './attendanceRoutes';
import auth from './authRoutes';
import user from './userRoutes';

const router = Router();

router.get('/', (_, res) => {
  res.send('API ROUTES');
});

router.use(auth);
router.use('/users', user);
router.use('/attendance', attendance);

export default router;
