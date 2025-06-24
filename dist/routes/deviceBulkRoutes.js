"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceBulkController_1 = require("../controllers/deviceBulkController");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const deviceBulkController = new deviceBulkController_1.DeviceBulkController();
// Configure multer for Excel file upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        }
        else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Import/Export routes - Admin only
router.post('/import', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), upload.single('excel'), deviceBulkController.importDevicesFromExcel);
router.get('/export', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.SCHOOL), deviceBulkController.exportDevicesToExcel);
router.get('/template', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceBulkController.generateDeviceTemplate);
// Bulk operations - Admin only
router.delete('/delete', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), deviceBulkController.bulkDeleteDevices);
exports.default = router;
