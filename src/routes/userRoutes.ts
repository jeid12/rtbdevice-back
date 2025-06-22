import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authorizeRoles } from '../middleware/authorizeRoles';

import { UserRole } from '../entity/User';

const router = Router();

// Protect user management routes
router.get('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.getAll);
router.get('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.getById);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.update);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), userController.delete);
router.patch('/:id/activate', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.setActive);
// Only admin and RTB-staff can add users (register)
router.post('/register', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/reset-password', userController.resetPassword);

export default router;
