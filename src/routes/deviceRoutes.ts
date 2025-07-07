import { Router } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();
const deviceController = new DeviceController();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Device CRUD operations
router.post('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL), deviceController.createDevice);
router.get('/', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL, UserRole.TECHNICIAN), deviceController.getAllDevices);
router.get('/search', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL, UserRole.TECHNICIAN), deviceController.searchDevices);
router.get('/statistics', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL), deviceController.getDeviceStatistics);
router.get('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL, UserRole.TECHNICIAN), deviceController.getDeviceById);
router.put('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL), deviceController.updateDevice);
router.delete('/:id', authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF), deviceController.deleteDevice);

// School assignment operations
router.put('/:id/assign', authorizeRoles(UserRole.ADMIN), deviceController.assignDeviceToSchool);
router.put('/:id/unassign', authorizeRoles(UserRole.ADMIN), deviceController.unassignDeviceFromSchool);

// School-specific device operations
router.get('/school/:schoolId', authorizeRoles(UserRole.ADMIN, UserRole.SCHOOL), deviceController.getDevicesBySchool);

// Bulk operations
router.post('/bulk/create', authorizeRoles(UserRole.ADMIN), deviceController.bulkCreateDevices);
router.put('/bulk/assign', authorizeRoles(UserRole.ADMIN), deviceController.bulkAssignDevicesToSchool);

// Device tracking
router.put('/:id/last-seen', authorizeRoles(UserRole.ADMIN, UserRole.SCHOOL), deviceController.updateLastSeen);

export default router;
