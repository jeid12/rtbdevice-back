import { Repository, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Application, ApplicationType, ApplicationStatus, ApplicationPriority, ApplicationDeviceIssue } from '../entity/Application';
import { School } from '../entity/School';
import { Device } from '../entity/Device';
import { sendNewApplicationNotification, sendMaintenanceRequestNotification, sendApplicationStatusChangeNotification } from './emailService';

export interface CreateNewDeviceApplicationData {
    type: ApplicationType.NEW_DEVICE_REQUEST;
    title: string;
    description: string;
    schoolId: number;
    requestedDeviceCount: number;
    requestedDeviceType: string;
    justification: string;
    priority?: ApplicationPriority;
    applicationLetterPath?: string;
}

export interface CreateMaintenanceApplicationData {
    type: ApplicationType.MAINTENANCE_REQUEST;
    title: string;
    description: string;
    schoolId: number;
    deviceIssues: {
        deviceId: number;
        problemDescription: string;
    }[];
    priority?: ApplicationPriority;
}

export interface UpdateApplicationData {
    title?: string;
    description?: string;
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    assignedTo?: string;
    estimatedCompletionDate?: Date;
    adminNotes?: string;
    rejectionReason?: string;
    estimatedCost?: number;
    actualCost?: number;
}

export interface ApplicationSearchFilters {
    type?: ApplicationType;
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    schoolId?: number;
    assignedTo?: string;
    dateFrom?: Date;
    dateTo?: Date;
    isOverdue?: boolean;
}

class ApplicationService {
    private applicationRepository: Repository<Application>;
    private applicationDeviceIssueRepository: Repository<ApplicationDeviceIssue>;
    private schoolRepository: Repository<School>;
    private deviceRepository: Repository<Device>;

    constructor() {
        this.applicationRepository = AppDataSource.getRepository(Application);
        this.applicationDeviceIssueRepository = AppDataSource.getRepository(ApplicationDeviceIssue);
        this.schoolRepository = AppDataSource.getRepository(School);
        this.deviceRepository = AppDataSource.getRepository(Device);
    }

    async createNewDeviceApplication(data: CreateNewDeviceApplicationData): Promise<Application> {
        const school = await this.schoolRepository.findOne({ where: { id: data.schoolId } });
        if (!school) {
            throw new Error('School not found');
        }

        const application = this.applicationRepository.create({
            type: data.type,
            title: data.title,
            description: data.description,
            school: school,
            requestedDeviceCount: data.requestedDeviceCount,
            requestedDeviceType: data.requestedDeviceType,
            justification: data.justification,
            priority: data.priority || ApplicationPriority.MEDIUM,
            applicationLetterPath: data.applicationLetterPath,
            status: ApplicationStatus.PENDING,
        });

        const savedApplication = await this.applicationRepository.save(application);

        // Send notification email to admins
        try {
            await sendNewApplicationNotification(savedApplication);
        } catch (error) {
            console.error('Failed to send application notification email:', error);
        }

        return savedApplication;
    }

    async createMaintenanceApplication(data: CreateMaintenanceApplicationData): Promise<Application> {
        const school = await this.schoolRepository.findOne({ where: { id: data.schoolId } });
        if (!school) {
            throw new Error('School not found');
        }

        // Validate all devices exist
        const deviceIds = data.deviceIssues.map(issue => issue.deviceId);
        const devices = await this.deviceRepository.find({ where: { id: In(deviceIds) } });
        
        if (devices.length !== deviceIds.length) {
            throw new Error('One or more devices not found');
        }

        const application = this.applicationRepository.create({
            type: data.type,
            title: data.title,
            description: data.description,
            school: school,
            priority: data.priority || ApplicationPriority.MEDIUM,
            status: ApplicationStatus.PENDING,
        });

        const savedApplication = await this.applicationRepository.save(application);

        // Create device issues
        const deviceIssues = data.deviceIssues.map(issueData => {
            const device = devices.find(d => d.id === issueData.deviceId);
            return this.applicationDeviceIssueRepository.create({
                application: savedApplication,
                device: device!,
                problemDescription: issueData.problemDescription,
            });
        });

        await this.applicationDeviceIssueRepository.save(deviceIssues);

        // Reload with device issues
        const completeApplication = await this.applicationRepository.findOne({
            where: { id: savedApplication.id },
            relations: ['school', 'deviceIssues', 'deviceIssues.device'],
        });

        // Send notification email to admins
        try {
            await sendMaintenanceRequestNotification(completeApplication!);
        } catch (error) {
            console.error('Failed to send maintenance request notification email:', error);
        }

        return completeApplication!;
    }

    async getApplicationById(id: number): Promise<Application | null> {
        return await this.applicationRepository.findOne({
            where: { id },
            relations: ['school', 'deviceIssues', 'deviceIssues.device'],
        });
    }

    async getAllApplications(filters?: ApplicationSearchFilters): Promise<Application[]> {
        const queryBuilder = this.applicationRepository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.school', 'school')
            .leftJoinAndSelect('application.deviceIssues', 'deviceIssues')
            .leftJoinAndSelect('deviceIssues.device', 'device');

        if (filters?.type) {
            queryBuilder.andWhere('application.type = :type', { type: filters.type });
        }

        if (filters?.status) {
            queryBuilder.andWhere('application.status = :status', { status: filters.status });
        }

        if (filters?.priority) {
            queryBuilder.andWhere('application.priority = :priority', { priority: filters.priority });
        }

        if (filters?.schoolId) {
            queryBuilder.andWhere('application.school.id = :schoolId', { schoolId: filters.schoolId });
        }

        if (filters?.assignedTo) {
            queryBuilder.andWhere('application.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
        }

        if (filters?.dateFrom) {
            queryBuilder.andWhere('application.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
        }

        if (filters?.dateTo) {
            queryBuilder.andWhere('application.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }

        if (filters?.isOverdue) {
            queryBuilder
                .andWhere('application.estimatedCompletionDate IS NOT NULL')
                .andWhere('application.estimatedCompletionDate < :now', { now: new Date() })
                .andWhere('application.status != :completed', { completed: ApplicationStatus.COMPLETED });
        }

        return await queryBuilder
            .orderBy('application.createdAt', 'DESC')
            .getMany();
    }

    async getApplicationsBySchool(schoolId: number): Promise<Application[]> {
        return await this.applicationRepository.find({
            where: { school: { id: schoolId } },
            relations: ['school', 'deviceIssues', 'deviceIssues.device'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateApplication(id: number, data: UpdateApplicationData): Promise<Application | null> {
        const application = await this.getApplicationById(id);
        if (!application) {
            return null;
        }

        const previousStatus = application.status;

        // Update fields
        Object.assign(application, data);

        // Set completion date if status changed to completed
        if (data.status === ApplicationStatus.COMPLETED && previousStatus !== ApplicationStatus.COMPLETED) {
            application.completedAt = new Date();
        }

        // Set assignment date if assignedTo is being set for the first time
        if (data.assignedTo && !application.assignedAt) {
            application.assignedAt = new Date();
        }

        const updatedApplication = await this.applicationRepository.save(application);

        // Send status change notification
        if (data.status && data.status !== previousStatus) {
            try {
                await sendApplicationStatusChangeNotification(updatedApplication, previousStatus);
            } catch (error) {
                console.error('Failed to send status change notification email:', error);
            }
        }

        return updatedApplication;
    }

    async assignApplication(id: number, assignedTo: string): Promise<Application | null> {
        return await this.updateApplication(id, {
            assignedTo,
            status: ApplicationStatus.IN_PROGRESS,
        });
    }

    async approveApplication(id: number, estimatedCost?: number, estimatedCompletionDate?: Date): Promise<Application | null> {
        const updateData: UpdateApplicationData = {
            status: ApplicationStatus.APPROVED,
        };

        if (estimatedCost !== undefined) {
            updateData.estimatedCost = estimatedCost;
        }

        if (estimatedCompletionDate) {
            updateData.estimatedCompletionDate = estimatedCompletionDate;
        }

        return await this.updateApplication(id, updateData);
    }

    async rejectApplication(id: number, rejectionReason: string): Promise<Application | null> {
        return await this.updateApplication(id, {
            status: ApplicationStatus.REJECTED,
            rejectionReason,
        });
    }

    async completeApplication(id: number, actualCost?: number): Promise<Application | null> {
        const updateData: UpdateApplicationData = {
            status: ApplicationStatus.COMPLETED,
        };

        if (actualCost !== undefined) {
            updateData.actualCost = actualCost;
        }

        return await this.updateApplication(id, updateData);
    }

    async updateDeviceIssue(issueId: number, actionTaken: string, resolved: boolean = false): Promise<ApplicationDeviceIssue | null> {
        const issue = await this.applicationDeviceIssueRepository.findOne({
            where: { id: issueId },
            relations: ['application', 'device'],
        });

        if (!issue) {
            return null;
        }

        issue.actionTaken = actionTaken;
        if (resolved) {
            issue.resolvedAt = new Date();
        }

        return await this.applicationDeviceIssueRepository.save(issue);
    }

    async deleteApplication(id: number): Promise<boolean> {
        const result = await this.applicationRepository.delete(id);
        return result.affected! > 0;
    }

    async getApplicationStatistics(): Promise<any> {
        const totalApplications = await this.applicationRepository.count();
        const pendingApplications = await this.applicationRepository.count({
            where: { status: ApplicationStatus.PENDING },
        });
        const approvedApplications = await this.applicationRepository.count({
            where: { status: ApplicationStatus.APPROVED },
        });
        const completedApplications = await this.applicationRepository.count({
            where: { status: ApplicationStatus.COMPLETED },
        });
        const rejectedApplications = await this.applicationRepository.count({
            where: { status: ApplicationStatus.REJECTED },
        });

        const newDeviceRequests = await this.applicationRepository.count({
            where: { type: ApplicationType.NEW_DEVICE_REQUEST },
        });
        const maintenanceRequests = await this.applicationRepository.count({
            where: { type: ApplicationType.MAINTENANCE_REQUEST },
        });

        // Get overdue applications
        const overdueApplications = await this.applicationRepository
            .createQueryBuilder('application')
            .where('application.estimatedCompletionDate IS NOT NULL')
            .andWhere('application.estimatedCompletionDate < :now', { now: new Date() })
            .andWhere('application.status != :completed', { completed: ApplicationStatus.COMPLETED })
            .getCount();

        return {
            total: totalApplications,
            pending: pendingApplications,
            approved: approvedApplications,
            completed: completedApplications,
            rejected: rejectedApplications,
            newDeviceRequests,
            maintenanceRequests,
            overdue: overdueApplications,
        };
    }

    async getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]> {
        return await this.applicationRepository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.school', 'school')
            .leftJoinAndSelect('application.deviceIssues', 'deviceIssues')
            .leftJoinAndSelect('deviceIssues.device', 'device')
            .where('application.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('application.createdAt', 'DESC')
            .getMany();
    }
}

export const applicationService = new ApplicationService();
