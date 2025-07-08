import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();

// Public routes (no authentication required)
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/reset-password', userController.resetPassword);

// Protected routes (authentication required)
router.use(authenticateJWT);

router.get('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.getAll);
router.get('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.getById);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.update);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), userController.delete);
router.patch('/:id/activate', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.setActive);
router.post('/register', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.register);

export default router;
