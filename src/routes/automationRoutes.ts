import { Router } from 'express';
import automationController from '../controllers/automationController';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();

// Automation rules management
router.get('/rules', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.getAutomationRules
);

router.post('/rules', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.createAutomationRule
);

router.put('/rules/:id', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.updateAutomationRule
);

router.delete('/rules/:id', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.deleteAutomationRule
);

router.patch('/rules/:id/toggle', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.toggleAutomationRule
);

router.post('/rules/:id/execute', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.executeAutomationRule
);

// Maintenance scheduling
router.get('/maintenance/schedule', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    automationController.getMaintenanceSchedule
);

router.post('/maintenance/schedule', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    automationController.scheduleMaintenance
);

router.put('/maintenance/schedule/:deviceId', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    automationController.updateMaintenanceSchedule
);

// Monitoring and checks
router.get('/maintenance/needed', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    automationController.checkMaintenanceNeeded
);

router.get('/warranty/expiring', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.checkWarrantyExpiries
);

router.get('/devices/offline', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    automationController.detectOfflineDevices
);

// Optimization
router.post('/optimize/devices', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.optimizeDeviceAssignments
);

router.post('/optimize/users', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.autoAssignUsersToSchools
);

// Maintenance operations
router.post('/devices/aging/update', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.updateDeviceAging
);

// Reporting
router.get('/reports', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.getAutomationReport
);

router.get('/statistics', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.getAutomationStatistics
);

// Execute all automations
router.post('/run-all', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    automationController.runAllAutomations
);

export default router;
