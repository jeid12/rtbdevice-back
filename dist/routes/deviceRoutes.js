"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceController_1 = require("../controllers/deviceController");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
const deviceController = new deviceController_1.DeviceController();
// Device CRUD operations
router.post('/', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.createDevice);
router.get('/', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.getAllDevices);
router.get('/search', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.searchDevices);
router.get('/statistics', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.getDeviceStatistics);
router.get('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.getDeviceById);
router.put('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.updateDevice);
router.delete('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceController.deleteDevice);
// School assignment operations
router.put('/:id/assign', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceController.assignDeviceToSchool);
router.put('/:id/unassign', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceController.unassignDeviceFromSchool);
// School-specific device operations
router.get('/school/:schoolId', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.getDevicesBySchool);
// Bulk operations
router.post('/bulk/create', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceController.bulkCreateDevices);
router.put('/bulk/assign', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceController.bulkAssignDevicesToSchool);
// Device tracking
router.put('/:id/last-seen', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceController.updateLastSeen);
exports.default = router;
