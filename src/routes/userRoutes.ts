import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);

export default router;
