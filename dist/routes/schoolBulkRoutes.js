"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const schoolBulkController_1 = require("../controllers/schoolBulkController");
const upload = (0, multer_1.default)();
const router = (0, express_1.Router)();
router.post('/bulk-upload', upload.single('file'), schoolBulkController_1.schoolBulkController.bulkUpload);
exports.default = router;
