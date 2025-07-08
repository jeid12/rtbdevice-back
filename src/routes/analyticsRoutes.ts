import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/authenticateJWT';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Dashboard statistics
router.get('/dashboard', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.getDashboardStatistics
);

// General analytics - accessible to all authenticated users
router.get('/', 
    analyticsController.getDashboardStatistics
);

// Device analytics
router.get('/devices', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    analyticsController.getDeviceAnalytics
);

// School analytics
router.get('/schools', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.getSchoolAnalytics
);

// User analytics
router.get('/users', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.getUserAnalytics
);

// Trend analytics
router.get('/trends', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.getTrendAnalytics
);

// Generate analytics report
router.post('/reports', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.generateReport
);

// Device performance metrics
router.get('/devices/:deviceId/performance', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL, UserRole.TECHNICIAN),
    analyticsController.getDevicePerformance
);

// School performance metrics
router.get('/schools/:schoolId/performance', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    analyticsController.getSchoolPerformance
);

// Cost analysis
router.get('/costs', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    analyticsController.getCostAnalysis
);

// Maintenance analytics
router.get('/maintenance', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.TECHNICIAN),
    analyticsController.getMaintenanceAnalytics
);

// Utilization analytics
router.get('/utilization', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    analyticsController.getUtilizationAnalytics
);

export default router;
