import { Request, Response } from 'express';
import { applicationService, ApplicationSearchFilters } from '../services/applicationService';
import { ApplicationType, ApplicationStatus, ApplicationPriority } from '../entity/Application';
import { PaginationQuery } from '../interfaces/pagination';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/applications';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `application-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'));
    }
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export class ApplicationController {
    createNewDeviceApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                title,
                description,
                schoolId,
                requestedDeviceCount,
                requestedDeviceType,
                justification,
                priority
            } = req.body;

            // Validate required fields
            if (!title || !description || !schoolId || !requestedDeviceCount || !requestedDeviceType || !justification) {
                res.status(400).json({
                    error: 'Missing required fields: title, description, schoolId, requestedDeviceCount, requestedDeviceType, justification'
                });
                return;
            }

            const applicationData = {
                type: ApplicationType.NEW_DEVICE_REQUEST as const,
                title,
                description,
                schoolId: parseInt(schoolId),
                requestedDeviceCount: parseInt(requestedDeviceCount),
                requestedDeviceType,
                justification,
                priority: priority || ApplicationPriority.MEDIUM,
                applicationLetterPath: req.file ? req.file.path : undefined,
            };

            const application = await applicationService.createNewDeviceApplication(applicationData);
            res.status(201).json(application);
        } catch (error) {
            console.error('Error creating new device application:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    createMaintenanceApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                title,
                description,
                schoolId,
                deviceIssues,
                priority
            } = req.body;

            // Validate required fields
            if (!title || !description || !schoolId || !deviceIssues || !Array.isArray(deviceIssues) || deviceIssues.length === 0) {
                res.status(400).json({
                    error: 'Missing required fields: title, description, schoolId, deviceIssues (array)'
                });
                return;
            }

            // Validate device issues format
            for (const issue of deviceIssues) {
                if (!issue.deviceId || !issue.problemDescription) {
                    res.status(400).json({
                        error: 'Each device issue must have deviceId and problemDescription'
                    });
                    return;
                }
            }

            const applicationData = {
                type: ApplicationType.MAINTENANCE_REQUEST as const,
                title,
                description,
                schoolId: parseInt(schoolId),
                deviceIssues: deviceIssues.map((issue: any) => ({
                    deviceId: parseInt(issue.deviceId),
                    problemDescription: issue.problemDescription
                })),
                priority: priority || ApplicationPriority.MEDIUM,
            };

            const application = await applicationService.createMaintenanceApplication(applicationData);
            res.status(201).json(application);
        } catch (error) {
            console.error('Error creating maintenance application:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    getAllApplications = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters: ApplicationSearchFilters = {};

            // Parse query parameters
            if (req.query.type) {
                filters.type = req.query.type as ApplicationType;
            }
            if (req.query.status) {
                filters.status = req.query.status as ApplicationStatus;
            }
            if (req.query.priority) {
                filters.priority = req.query.priority as ApplicationPriority;
            }
            if (req.query.schoolId) {
                filters.schoolId = parseInt(req.query.schoolId as string);
            }
            if (req.query.assignedTo) {
                filters.assignedTo = req.query.assignedTo as string;
            }
            if (req.query.dateFrom) {
                filters.dateFrom = new Date(req.query.dateFrom as string);
            }
            if (req.query.dateTo) {
                filters.dateTo = new Date(req.query.dateTo as string);
            }
            if (req.query.isOverdue === 'true') {
                filters.isOverdue = true;
            }

            // Parse pagination parameters
            const paginationQuery: PaginationQuery = {
                page: req.query.page as string,
                limit: req.query.limit as string,
                sortBy: req.query.sortBy as string,
                sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
            };

            filters.pagination = {
                page: paginationQuery.page ? parseInt(paginationQuery.page) : undefined,
                limit: paginationQuery.limit ? parseInt(paginationQuery.limit) : undefined,
                sortBy: paginationQuery.sortBy,
                sortOrder: (paginationQuery.sortOrder as 'ASC' | 'DESC') || undefined
            };

            const result = await applicationService.getAllApplications(filters);
            res.json(result);
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getApplicationById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const application = await applicationService.getApplicationById(id);
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error fetching application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getApplicationsBySchool = async (req: Request, res: Response): Promise<void> => {
        try {
            const schoolId = parseInt(req.params.schoolId);
            if (isNaN(schoolId)) {
                res.status(400).json({ error: 'Invalid school ID' });
                return;
            }

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

            const result = await applicationService.getApplicationsBySchool(schoolId, paginationOptions);
            res.json(result);
        } catch (error) {
            console.error('Error fetching school applications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    updateApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const updateData = req.body;

            // Convert string dates to Date objects
            if (updateData.estimatedCompletionDate) {
                updateData.estimatedCompletionDate = new Date(updateData.estimatedCompletionDate);
            }

            const application = await applicationService.updateApplication(id, updateData);
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error updating application:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
        }
    };

    assignApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const { assignedTo } = req.body;
            if (!assignedTo) {
                res.status(400).json({ error: 'assignedTo is required' });
                return;
            }

            const application = await applicationService.assignApplication(id, assignedTo);
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error assigning application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    approveApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const { estimatedCost, estimatedCompletionDate } = req.body;

            const application = await applicationService.approveApplication(
                id,
                estimatedCost ? parseFloat(estimatedCost) : undefined,
                estimatedCompletionDate ? new Date(estimatedCompletionDate) : undefined
            );

            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error approving application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    rejectApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const { rejectionReason } = req.body;
            if (!rejectionReason) {
                res.status(400).json({ error: 'rejectionReason is required' });
                return;
            }

            const application = await applicationService.rejectApplication(id, rejectionReason);
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error rejecting application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    completeApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const { actualCost } = req.body;

            const application = await applicationService.completeApplication(
                id,
                actualCost ? parseFloat(actualCost) : undefined
            );

            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error completing application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    updateDeviceIssue = async (req: Request, res: Response): Promise<void> => {
        try {
            const issueId = parseInt(req.params.issueId);
            if (isNaN(issueId)) {
                res.status(400).json({ error: 'Invalid issue ID' });
                return;
            }

            const { actionTaken, resolved } = req.body;
            if (!actionTaken) {
                res.status(400).json({ error: 'actionTaken is required' });
                return;
            }

            const issue = await applicationService.updateDeviceIssue(issueId, actionTaken, resolved);
            if (!issue) {
                res.status(404).json({ error: 'Device issue not found' });
                return;
            }

            res.json(issue);
        } catch (error) {
            console.error('Error updating device issue:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    deleteApplication = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const deleted = await applicationService.deleteApplication(id);
            if (!deleted) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json({ message: 'Application deleted successfully' });
        } catch (error) {
            console.error('Error deleting application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    getApplicationStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const statistics = await applicationService.getApplicationStatistics();
            res.json(statistics);
        } catch (error) {
            console.error('Error fetching application statistics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    downloadApplicationLetter = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid application ID' });
                return;
            }

            const application = await applicationService.getApplicationById(id);
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            if (!application.applicationLetterPath) {
                res.status(404).json({ error: 'No application letter found' });
                return;
            }

            if (!fs.existsSync(application.applicationLetterPath)) {
                res.status(404).json({ error: 'Application letter file not found' });
                return;
            }

            res.download(application.applicationLetterPath, `application-${id}-letter.pdf`);
        } catch (error) {
            console.error('Error downloading application letter:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
