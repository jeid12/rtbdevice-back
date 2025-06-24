"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = __importDefault(require("../controllers/analyticsController"));
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
// Dashboard statistics
router.get('/dashboard', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.getDashboardStatistics);
// Device analytics
router.get('/devices', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), analyticsController_1.default.getDeviceAnalytics);
// School analytics
router.get('/schools', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.getSchoolAnalytics);
// User analytics
router.get('/users', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.getUserAnalytics);
// Trend analytics
router.get('/trends', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.getTrendAnalytics);
// Generate analytics report
router.post('/reports', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.generateReport);
// Device performance metrics
router.get('/devices/:deviceId/performance', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL, User_1.UserRole.TECHNICIAN), analyticsController_1.default.getDevicePerformance);
// School performance metrics
router.get('/schools/:schoolId/performance', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), analyticsController_1.default.getSchoolPerformance);
// Cost analysis
router.get('/costs', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), analyticsController_1.default.getCostAnalysis);
// Maintenance analytics
router.get('/maintenance', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), analyticsController_1.default.getMaintenanceAnalytics);
// Utilization analytics
router.get('/utilization', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), analyticsController_1.default.getUtilizationAnalytics);
exports.default = router;
