import { Router } from 'express';
import { ApplicationController, upload } from '../controllers/applicationController';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();
const applicationController = new ApplicationController();

// School routes - schools can create applications and view their own
router.post('/new-device', upload.single('applicationLetter'), authorizeRoles(UserRole.SCHOOL, UserRole.ADMIN), applicationController.createNewDeviceApplication);
router.post('/maintenance', authorizeRoles(UserRole.SCHOOL, UserRole.ADMIN), applicationController.createMaintenanceApplication);
router.get('/school/:schoolId', authorizeRoles(UserRole.SCHOOL, UserRole.ADMIN), applicationController.getApplicationsBySchool);
router.get('/:id', authorizeRoles(UserRole.SCHOOL, UserRole.ADMIN), applicationController.getApplicationById);
router.get('/:id/download-letter', authorizeRoles(UserRole.SCHOOL, UserRole.ADMIN), applicationController.downloadApplicationLetter);

// Admin routes - admins can view all applications and manage them
router.get('/', authorizeRoles(UserRole.ADMIN), applicationController.getAllApplications);
router.put('/:id', authorizeRoles(UserRole.ADMIN), applicationController.updateApplication);
router.post('/:id/assign', authorizeRoles(UserRole.ADMIN), applicationController.assignApplication);
router.post('/:id/approve', authorizeRoles(UserRole.ADMIN), applicationController.approveApplication);
router.post('/:id/reject', authorizeRoles(UserRole.ADMIN), applicationController.rejectApplication);
router.post('/:id/complete', authorizeRoles(UserRole.ADMIN), applicationController.completeApplication);
router.put('/device-issue/:issueId', authorizeRoles(UserRole.ADMIN, UserRole.TECHNICIAN), applicationController.updateDeviceIssue);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), applicationController.deleteApplication);
router.get('/stats/overview', authorizeRoles(UserRole.ADMIN), applicationController.getApplicationStatistics);

export default router;
