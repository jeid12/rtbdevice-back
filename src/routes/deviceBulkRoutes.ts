import { Router } from 'express';
import { DeviceBulkController } from '../controllers/deviceBulkController';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';
import multer from 'multer';

const router = Router();
const deviceBulkController = new DeviceBulkController();

// Configure multer for Excel file upload
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Import/Export routes - Admin only
router.post('/import', authorizeRoles(UserRole.ADMIN), upload.single('excel'), deviceBulkController.importDevicesFromExcel);

router.get('/export', authorizeRoles(UserRole.ADMIN, UserRole.SCHOOL), deviceBulkController.exportDevicesToExcel);

router.get('/template', authorizeRoles(UserRole.ADMIN), deviceBulkController.generateDeviceTemplate);

// Bulk operations - Admin only
router.delete('/delete', authorizeRoles(UserRole.ADMIN), deviceBulkController.bulkDeleteDevices);

export default router;
