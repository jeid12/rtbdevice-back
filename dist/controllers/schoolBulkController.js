"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolBulkController = void 0;
const schoolService_1 = require("../services/schoolService");
const xlsx_1 = __importDefault(require("xlsx"));
const User_1 = require("../entity/User");
const data_source_1 = require("../data-source");
exports.schoolBulkController = {
    bulkUpload: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const workbook = xlsx_1.default.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = xlsx_1.default.utils.sheet_to_json(sheet);
            const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
            const results = [];
            for (const row of rows) {
                try {
                    const user = await userRepo.findOne({ where: { email: row.userEmail } });
                    if (!user)
                        throw new Error('User not found: ' + row.userEmail);
                    if (user.role !== User_1.UserRole.SCHOOL)
                        throw new Error('User is not a school: ' + row.userEmail);
                    await schoolService_1.schoolService.create({ ...row, userId: user.id });
                    results.push({ row, status: 'success' });
                }
                catch (err) {
                    results.push({ row, status: 'error', error: err.message });
                }
            }
            return res.json({ results });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};
