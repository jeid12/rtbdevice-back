"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceBulkController = void 0;
const deviceService_1 = require("../services/deviceService");
const XLSX = __importStar(require("xlsx"));
class DeviceBulkController {
    constructor() {
        /**
         * Import devices from Excel file
         */
        this.importDevicesFromExcel = async (req, res) => {
            try {
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        message: 'Excel file is required'
                    });
                    return;
                }
                // Read the Excel file
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                if (data.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Excel file is empty'
                    });
                    return;
                }
                const devices = [];
                const errors = [];
                // Validate and transform data
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    try {
                        // Required fields validation
                        if (!row.serialNumber || !row.model || !row.purchaseCost || !row.category) {
                            errors.push(`Row ${i + 2}: Missing required fields (serialNumber, model, purchaseCost, category)`);
                            continue;
                        }
                        // Category validation
                        if (!['laptop', 'desktop', 'projector', 'other'].includes(row.category?.toLowerCase())) {
                            errors.push(`Row ${i + 2}: Invalid category "${row.category}". Must be: laptop, desktop, projector, or other`);
                            continue;
                        }
                        // Purchase cost validation
                        const purchaseCost = parseFloat(row.purchaseCost);
                        if (isNaN(purchaseCost) || purchaseCost < 0) {
                            errors.push(`Row ${i + 2}: Invalid purchase cost "${row.purchaseCost}"`);
                            continue;
                        }
                        const devicePayload = {
                            serialNumber: row.serialNumber.toString().trim(),
                            model: row.model.toString().trim(),
                            purchaseCost: purchaseCost,
                            category: row.category.toString().toLowerCase().trim(),
                            schoolId: row.schoolId ? parseInt(row.schoolId) : undefined,
                            purchaseDate: row.purchaseDate ? new Date(row.purchaseDate) : undefined,
                        };
                        // Add specifications only if they exist
                        const specs = {};
                        if (row.storage?.toString().trim())
                            specs.storage = row.storage.toString().trim();
                        if (row.ram?.toString().trim())
                            specs.ram = row.ram.toString().trim();
                        if (row.processor?.toString().trim())
                            specs.processor = row.processor.toString().trim();
                        if (Object.keys(specs).length > 0) {
                            devicePayload.specifications = specs;
                        }
                        devices.push(devicePayload);
                    }
                    catch (error) {
                        errors.push(`Row ${i + 2}: Error processing row - ${error}`);
                    }
                }
                if (errors.length > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation errors found',
                        errors: errors,
                        validDevices: devices.length,
                        totalRows: data.length
                    });
                    return;
                }
                // Create devices
                const createdDevices = await this.deviceService.bulkCreateDevices(devices);
                res.status(201).json({
                    success: true,
                    message: `Successfully imported ${createdDevices.length} devices`,
                    data: {
                        imported: createdDevices.length,
                        devices: createdDevices
                    }
                });
            }
            catch (error) {
                console.error('Error importing devices from Excel:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to import devices from Excel',
                    error: error.message
                });
            }
        };
        /**
         * Export devices to Excel file
         */
        this.exportDevicesToExcel = async (req, res) => {
            try {
                const schoolId = req.query.schoolId ? parseInt(req.query.schoolId) : undefined;
                let devices;
                if (schoolId) {
                    devices = await this.deviceService.getDevicesBySchool(schoolId);
                }
                else {
                    const result = await this.deviceService.getAllDevices(1, 1000); // Get up to 1000 devices
                    devices = result.devices;
                }
                // Transform devices for Excel export
                const excelData = devices.map(device => ({
                    'Name Tag': device.name_tag,
                    'Serial Number': device.serialNumber,
                    'Model': device.model,
                    'Category': device.category,
                    'Purchase Cost': device.purchaseCost,
                    'School': device.school?.name || 'Unassigned',
                    'District': device.school?.district || 'N/A',
                    'Purchase Date': device.purchaseDate ? device.purchaseDate.toISOString().split('T')[0] : '',
                    'Age (Years)': device.ageInYears || '',
                    'Storage': device.specifications?.storage || '',
                    'RAM': device.specifications?.ram || '',
                    'Processor': device.specifications?.processor || '',
                    'Last Seen': device.lastSeenAt ? device.lastSeenAt.toISOString() : '',
                    'Created At': device.createdAt.toISOString().split('T')[0],
                    'Updated At': device.updatedAt.toISOString().split('T')[0]
                }));
                // Create workbook and worksheet
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(excelData);
                // Set column widths
                const columnWidths = [
                    { wch: 20 }, // Name Tag
                    { wch: 20 }, // Serial Number
                    { wch: 25 }, // Model
                    { wch: 12 }, // Category
                    { wch: 15 }, // Purchase Cost
                    { wch: 30 }, // School
                    { wch: 15 }, // District
                    { wch: 15 }, // Purchase Date
                    { wch: 12 }, // Age
                    { wch: 15 }, // Storage
                    { wch: 15 }, // RAM
                    { wch: 20 }, // Processor
                    { wch: 20 }, // Last Seen
                    { wch: 15 }, // Created At
                    { wch: 15 }, // Updated At
                ];
                worksheet['!cols'] = columnWidths;
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');
                // Generate buffer
                const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                // Set response headers
                const filename = schoolId ? `devices_school_${schoolId}.xlsx` : 'all_devices.xlsx';
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(excelBuffer);
            }
            catch (error) {
                console.error('Error exporting devices to Excel:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to export devices to Excel',
                    error: error.message
                });
            }
        };
        /**
         * Generate device template Excel file
         */
        this.generateDeviceTemplate = async (req, res) => {
            try {
                // Template data with example row
                const templateData = [
                    {
                        'serialNumber': 'ABC123456',
                        'model': 'Dell Latitude 7420',
                        'category': 'laptop',
                        'purchaseCost': 850000,
                        'schoolId': '1',
                        'purchaseDate': '2024-01-15',
                        'storage': '512GB SSD',
                        'ram': '16GB',
                        'processor': 'Intel Core i7'
                    }
                ];
                // Create workbook and worksheet
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(templateData);
                // Add instructions as comments or additional sheet
                const instructions = [
                    ['Field', 'Description', 'Required', 'Example'],
                    ['serialNumber', 'Unique serial number of the device', 'Yes', 'ABC123456'],
                    ['model', 'Device model name', 'Yes', 'Dell Latitude 7420'],
                    ['category', 'Device category (laptop, desktop, projector, other)', 'Yes', 'laptop'],
                    ['purchaseCost', 'Purchase cost in Rwandan Francs', 'Yes', '850000'],
                    ['schoolId', 'ID of school to assign device to (optional)', 'No', '1'],
                    ['purchaseDate', 'Purchase date in YYYY-MM-DD format (optional)', 'No', '2024-01-15'],
                    ['storage', 'Storage specification (optional)', 'No', '512GB SSD'],
                    ['ram', 'RAM specification (optional)', 'No', '16GB'],
                    ['processor', 'Processor specification (optional)', 'No', 'Intel Core i7']
                ];
                const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
                // Set column widths for both sheets
                worksheet['!cols'] = [
                    { wch: 15 }, // serialNumber
                    { wch: 25 }, // model
                    { wch: 12 }, // category
                    { wch: 15 }, // purchaseCost
                    { wch: 10 }, // schoolId
                    { wch: 15 }, // purchaseDate
                    { wch: 15 }, // storage
                    { wch: 15 }, // ram
                    { wch: 20 }, // processor
                ];
                instructionSheet['!cols'] = [
                    { wch: 15 }, // Field
                    { wch: 50 }, // Description
                    { wch: 10 }, // Required
                    { wch: 20 }, // Example
                ];
                XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');
                // Generate buffer
                const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                // Set response headers
                res.setHeader('Content-Disposition', 'attachment; filename="device_import_template.xlsx"');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(excelBuffer);
            }
            catch (error) {
                console.error('Error generating device template:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to generate device template',
                    error: error.message
                });
            }
        };
        /**
         * Bulk delete devices
         */
        this.bulkDeleteDevices = async (req, res) => {
            try {
                const { deviceIds } = req.body;
                if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Device IDs must be a non-empty array'
                    });
                    return;
                }
                let deletedCount = 0;
                const errors = [];
                for (const deviceId of deviceIds) {
                    try {
                        const deleted = await this.deviceService.deleteDevice(parseInt(deviceId));
                        if (deleted) {
                            deletedCount++;
                        }
                        else {
                            errors.push(`Device with ID ${deviceId} not found`);
                        }
                    }
                    catch (error) {
                        errors.push(`Error deleting device ${deviceId}: ${error}`);
                    }
                }
                res.status(200).json({
                    success: true,
                    message: `Bulk delete completed. ${deletedCount} devices deleted.`,
                    data: {
                        deleted: deletedCount,
                        requested: deviceIds.length,
                        errors: errors
                    }
                });
            }
            catch (error) {
                console.error('Error bulk deleting devices:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to bulk delete devices',
                    error: error.message
                });
            }
        };
        this.deviceService = new deviceService_1.DeviceService();
    }
}
exports.DeviceBulkController = DeviceBulkController;
