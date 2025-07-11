import { Request, Response } from 'express';
import { DeviceService } from '../services/deviceService';
import { PaginationQuery } from '../interfaces/pagination';

export class DeviceController {
    private deviceService: DeviceService;

    constructor() {
        this.deviceService = new DeviceService();
    }

    /**
     * Create a new device
     */
    createDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            // Basic validation
            const { serialNumber, model, purchaseCost, category } = req.body;
            
            if (!serialNumber || !model || purchaseCost === undefined || !category) {
                res.status(400).json({
                    success: false,
                    message: 'Serial number, model, purchase cost, and category are required'
                });
                return;
            }

            if (!['laptop', 'desktop', 'projector', 'other'].includes(category)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid category. Must be one of: laptop, desktop, projector, other'
                });
                return;
            }

            const device = await this.deviceService.createDevice(req.body);

            res.status(201).json({
                success: true,
                message: 'Device created successfully',
                data: device
            });
        } catch (error: any) {
            console.error('Error creating device:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create device',
                error: error.message
            });
        }
    };

    /**
     * Get all devices with pagination
     */
    getAllDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;

            // Parse pagination parameters
            const paginationQuery: PaginationQuery = {
                page: req.query.page as string,
                limit: req.query.limit as string,
                sortBy: req.query.sortBy as string,
                sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
            };

            const paginationOptions = {
                page: paginationQuery.page ? parseInt(paginationQuery.page) : undefined,
                limit: paginationQuery.limit ? parseInt(paginationQuery.limit) : undefined,
                sortBy: paginationQuery.sortBy,
                sortOrder: (paginationQuery.sortOrder as 'ASC' | 'DESC') || undefined
            };

            const result = await this.deviceService.getAllDevices(paginationOptions, schoolId);

            res.status(200).json({
                success: true,
                message: 'Devices retrieved successfully',
                data: result
            });
        } catch (error: any) {
            console.error('Error getting devices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve devices',
                error: error.message
            });
        }
    };

    /**
     * Get device by ID
     */
    getDeviceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            const device = await this.deviceService.getDeviceById(id);

            if (!device) {
                res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Device retrieved successfully',
                data: device
            });
        } catch (error: any) {
            console.error('Error getting device:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve device',
                error: error.message
            });
        }
    };

    /**
     * Update device
     */
    updateDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            const device = await this.deviceService.updateDevice(id, req.body);

            if (!device) {
                res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Device updated successfully',
                data: device
            });
        } catch (error: any) {
            console.error('Error updating device:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update device',
                error: error.message
            });
        }
    };

    /**
     * Delete device
     */
    deleteDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            const deleted = await this.deviceService.deleteDevice(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Device deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting device:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete device',
                error: error.message
            });
        }
    };

    /**
     * Assign device to school
     */
    assignDeviceToSchool = async (req: Request, res: Response): Promise<void> => {
        try {
            const deviceId = parseInt(req.params.id);
            const { schoolId } = req.body;

            if (isNaN(deviceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            if (!schoolId || isNaN(parseInt(schoolId))) {
                res.status(400).json({
                    success: false,
                    message: 'Valid school ID is required'
                });
                return;
            }

            const device = await this.deviceService.assignDeviceToSchool(deviceId, parseInt(schoolId));

            if (!device) {
                res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Device assigned to school successfully',
                data: device
            });
        } catch (error: any) {
            console.error('Error assigning device to school:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign device to school',
                error: error.message
            });
        }
    };

    /**
     * Unassign device from school
     */
    unassignDeviceFromSchool = async (req: Request, res: Response): Promise<void> => {
        try {
            const deviceId = parseInt(req.params.id);
            
            if (isNaN(deviceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            const device = await this.deviceService.unassignDeviceFromSchool(deviceId);

            if (!device) {
                res.status(404).json({
                    success: false,
                    message: 'Device not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Device unassigned from school successfully',
                data: device
            });
        } catch (error: any) {
            console.error('Error unassigning device from school:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to unassign device from school',
                error: error.message
            });
        }
    };

    /**
     * Bulk assign devices to school
     */
    bulkAssignDevicesToSchool = async (req: Request, res: Response): Promise<void> => {
        try {
            const { deviceIds, schoolId } = req.body;

            if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Device IDs must be a non-empty array'
                });
                return;
            }

            if (!schoolId || isNaN(parseInt(schoolId))) {
                res.status(400).json({
                    success: false,
                    message: 'Valid school ID is required'
                });
                return;
            }

            const devices = await this.deviceService.bulkAssignDevicesToSchool(deviceIds, parseInt(schoolId));

            res.status(200).json({
                success: true,
                message: 'Devices assigned to school successfully',
                data: devices
            });
        } catch (error: any) {
            console.error('Error bulk assigning devices to school:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign devices to school',
                error: error.message
            });
        }
    };

    /**
     * Bulk create devices
     */
    bulkCreateDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const { devices } = req.body;

            if (!Array.isArray(devices) || devices.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Devices must be a non-empty array'
                });
                return;
            }

            // Basic validation for each device
            for (const device of devices) {
                if (!device.serialNumber || !device.model || device.purchaseCost === undefined || !device.category) {
                    res.status(400).json({
                        success: false,
                        message: 'Each device must have serialNumber, model, purchaseCost, and category'
                    });
                    return;
                }

                if (!['laptop', 'desktop', 'projector', 'other'].includes(device.category)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid category in one or more devices'
                    });
                    return;
                }
            }

            const createdDevices = await this.deviceService.bulkCreateDevices(devices);

            res.status(201).json({
                success: true,
                message: 'Devices created successfully',
                data: createdDevices
            });
        } catch (error: any) {
            console.error('Error bulk creating devices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create devices',
                error: error.message
            });
        }
    };

    /**
     * Get devices by school
     */
    getDevicesBySchool = async (req: Request, res: Response): Promise<void> => {
        try {
            const schoolId = parseInt(req.params.schoolId);
            
            if (isNaN(schoolId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid school ID'
                });
                return;
            }

            const devices = await this.deviceService.getDevicesBySchool(schoolId);

            res.status(200).json({
                success: true,
                message: 'School devices retrieved successfully',
                data: devices
            });
        } catch (error: any) {
            console.error('Error getting school devices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve school devices',
                error: error.message
            });
        }
    };

    /**
     * Search devices
     */
    searchDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const searchTerm = req.query.q as string;
            const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;

            if (!searchTerm || searchTerm.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Search term is required'
                });
                return;
            }

            const devices = await this.deviceService.searchDevices(searchTerm.trim(), schoolId);

            res.status(200).json({
                success: true,
                message: 'Search completed successfully',
                data: devices
            });
        } catch (error: any) {
            console.error('Error searching devices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search devices',
                error: error.message
            });
        }
    };

    /**
     * Update device last seen timestamp
     */
    updateLastSeen = async (req: Request, res: Response): Promise<void> => {
        try {
            const deviceId = parseInt(req.params.id);
            
            if (isNaN(deviceId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid device ID'
                });
                return;
            }

            await this.deviceService.updateLastSeen(deviceId);

            res.status(200).json({
                success: true,
                message: 'Device last seen updated successfully'
            });
        } catch (error: any) {
            console.error('Error updating device last seen:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update device last seen',
                error: error.message
            });
        }
    };

    /**
     * Get device statistics
     */
    getDeviceStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;
            const statistics = await this.deviceService.getDeviceStatistics(schoolId);

            res.status(200).json({
                success: true,
                message: 'Device statistics retrieved successfully',
                data: statistics
            });
        } catch (error: any) {
            console.error('Error getting device statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve device statistics',
                error: error.message
            });
        }
    };
}
