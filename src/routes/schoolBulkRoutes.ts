import { Router } from 'express';
import multer from 'multer';
import { schoolBulkController } from '../controllers/schoolBulkController';

const upload = multer();
const router = Router();

router.post('/bulk-upload', upload.single('file'), schoolBulkController.bulkUpload);

export default router;
