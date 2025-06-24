"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const automationController_1 = __importDefault(require("../controllers/automationController"));
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
// Automation rules management
router.get('/rules', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.getAutomationRules);
router.post('/rules', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.createAutomationRule);
router.put('/rules/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.updateAutomationRule);
router.delete('/rules/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.deleteAutomationRule);
router.patch('/rules/:id/toggle', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.toggleAutomationRule);
router.post('/rules/:id/execute', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.executeAutomationRule);
// Maintenance scheduling
router.get('/maintenance/schedule', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), automationController_1.default.getMaintenanceSchedule);
router.post('/maintenance/schedule', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), automationController_1.default.scheduleMaintenance);
router.put('/maintenance/schedule/:deviceId', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), automationController_1.default.updateMaintenanceSchedule);
// Monitoring and checks
router.get('/maintenance/needed', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), automationController_1.default.checkMaintenanceNeeded);
router.get('/warranty/expiring', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.checkWarrantyExpiries);
router.get('/devices/offline', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.TECHNICIAN), automationController_1.default.detectOfflineDevices);
// Optimization
router.post('/optimize/devices', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.optimizeDeviceAssignments);
router.post('/optimize/users', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.autoAssignUsersToSchools);
// Maintenance operations
router.post('/devices/aging/update', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.updateDeviceAging);
// Reporting
router.get('/reports', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.getAutomationReport);
router.get('/statistics', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.getAutomationStatistics);
// Execute all automations
router.post('/run-all', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), automationController_1.default.runAllAutomations);
exports.default = router;
