import { Router } from 'express';
import { schoolController } from '../controllers/schoolController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Basic CRUD operations
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.create);
router.get('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL), schoolController.getAll);
router.get('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL), schoolController.getById);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.update);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), schoolController.delete);

// User assignment operations
router.post('/:schoolId/assign-user', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.assignUser);
router.delete('/:schoolId/unassign-user', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.unassignUser);

// Helper endpoints
router.get('/utils/without-users', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.getSchoolsWithoutUsers);
router.get('/utils/available-users', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), schoolController.getAvailableUsers);

export default router;
