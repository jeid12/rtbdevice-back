import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/reset-password', userController.resetPassword);

export default router;
