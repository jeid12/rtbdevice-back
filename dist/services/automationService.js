"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const Device_1 = require("../entity/Device");
const School_1 = require("../entity/School");
const User_1 = require("../entity/User");
const data_source_1 = require("../data-source");
const emailService_1 = require("./emailService");
class AutomationService {
    constructor() {
        this.automationRules = [];
        this.deviceRepository = data_source_1.AppDataSource.getRepository(Device_1.Device);
        this.schoolRepository = data_source_1.AppDataSource.getRepository(School_1.School);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.initializeDefaultRules();
    }
    /**
     * Initialize default automation rules
     */
    initializeDefaultRules() {
        this.automationRules = [
            {
                id: 'maintenance-reminder',
                name: 'Maintenance Reminder',
                description: 'Send maintenance reminders for devices due for service',
                enabled: true,
                triggerType: 'schedule',
                trigger: { cron: '0 9 * * MON' }, // Every Monday at 9 AM
                actions: [
                    {
                        type: 'email',
                        parameters: {
                            template: 'maintenance-reminder',
                            recipients: ['admin', 'school']
                        }
                    }
                ]
            },
            {
                id: 'warranty-expiry-alert',
                name: 'Warranty Expiry Alert',
                description: 'Alert when device warranties are about to expire',
                enabled: true,
                triggerType: 'schedule',
                trigger: { cron: '0 10 1 * *' }, // First day of month at 10 AM
                actions: [
                    {
                        type: 'email',
                        parameters: {
                            template: 'warranty-expiry',
                            recipients: ['admin']
                        }
                    }
                ]
            },
            {
                id: 'offline-device-detection',
                name: 'Offline Device Detection',
                description: 'Detect devices that have been offline for extended periods',
                enabled: true,
                triggerType: 'schedule',
                trigger: { cron: '0 */6 * * *' }, // Every 6 hours
                actions: [
                    {
                        type: 'status_change',
                        parameters: {
                            newStatus: Device_1.DeviceStatus.INACTIVE,
                            condition: 'offline_7_days'
                        }
                    },
                    {
                        type: 'notification',
                        parameters: {
                            message: 'Device has been offline for 7+ days'
                        }
                    }
                ]
            },
            {
                id: 'auto-school-assignment',
                name: 'Auto School Assignment',
                description: 'Automatically assign school users to their schools',
                enabled: true,
                triggerType: 'event',
                trigger: { event: 'user_created', role: User_1.UserRole.SCHOOL },
                actions: [
                    {
                        type: 'assignment',
                        parameters: {
                            type: 'user_to_school'
                        }
                    }
                ]
            },
            {
                id: 'device-aging-update',
                name: 'Device Aging Update',
                description: 'Update device conditions based on age and usage',
                enabled: true,
                triggerType: 'schedule',
                trigger: { cron: '0 2 1 * *' }, // First day of month at 2 AM
                actions: [
                    {
                        type: 'status_change',
                        parameters: {
                            type: 'age_based_condition_update'
                        }
                    }
                ]
            }
        ];
    }
    /**
     * Execute all enabled automation rules
     */
    async executeAutomationRules() {
        let totalRulesExecuted = 0;
        let successfulExecutions = 0;
        let failedExecutions = 0;
        let devicesProcessed = 0;
        let notificationsSent = 0;
        let maintenanceScheduled = 0;
        for (const rule of this.automationRules) {
            if (!rule.enabled)
                continue;
            try {
                totalRulesExecuted++;
                const result = await this.executeRule(rule);
                successfulExecutions++;
                devicesProcessed += result.devicesProcessed;
                notificationsSent += result.notificationsSent;
                maintenanceScheduled += result.maintenanceScheduled;
                rule.lastRun = new Date();
            }
            catch (error) {
                console.error(`Failed to execute rule ${rule.id}:`, error);
                failedExecutions++;
            }
        }
        const automationEfficiency = totalRulesExecuted > 0
            ? (successfulExecutions / totalRulesExecuted) * 100
            : 0;
        return {
            totalRulesExecuted,
            successfulExecutions,
            failedExecutions,
            devicesProcessed,
            notificationsSent,
            maintenanceScheduled,
            automationEfficiency
        };
    }
    /**
     * Execute a specific automation rule
     */
    async executeRule(rule) {
        let devicesProcessed = 0;
        let notificationsSent = 0;
        let maintenanceScheduled = 0;
        switch (rule.id) {
            case 'maintenance-reminder':
                const result1 = await this.executeMaintenanceReminder();
                devicesProcessed += result1.devicesProcessed;
                notificationsSent += result1.notificationsSent;
                maintenanceScheduled += result1.maintenanceScheduled;
                break;
            case 'warranty-expiry-alert':
                const result2 = await this.executeWarrantyExpiryAlert();
                devicesProcessed += result2.devicesProcessed;
                notificationsSent += result2.notificationsSent;
                break;
            case 'offline-device-detection':
                const result3 = await this.executeOfflineDeviceDetection();
                devicesProcessed += result3.devicesProcessed;
                break;
            case 'device-aging-update':
                const result4 = await this.executeDeviceAgingUpdate();
                devicesProcessed += result4.devicesProcessed;
                break;
            default:
                console.log(`Unknown rule: ${rule.id}`);
        }
        return { devicesProcessed, notificationsSent, maintenanceScheduled };
    }
    /**
     * Send maintenance reminders for devices due for service
     */
    async executeMaintenanceReminder() {
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        const devicesDueForMaintenance = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.nextMaintenanceDate <= :oneWeekFromNow', { oneWeekFromNow })
            .andWhere('device.nextMaintenanceDate IS NOT NULL')
            .getMany();
        // Send email notifications
        if (devicesDueForMaintenance.length > 0) {
            const adminEmails = ['admin@rtb.gov.rw']; // Would get from admin users in real implementation
            await (0, emailService_1.sendMaintenanceReminder)(devicesDueForMaintenance, adminEmails);
        }
        let maintenanceScheduled = 0;
        for (const device of devicesDueForMaintenance) {
            // Schedule maintenance
            await this.scheduleDeviceMaintenance(device);
            maintenanceScheduled++;
        }
        return {
            devicesProcessed: devicesDueForMaintenance.length,
            notificationsSent: devicesDueForMaintenance.length,
            maintenanceScheduled
        };
    }
    /**
     * Alert for devices with warranties about to expire
     */
    async executeWarrantyExpiryAlert() {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const devicesWithExpiringWarranty = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.warrantyExpiry BETWEEN :now AND :thirtyDaysFromNow', {
            now,
            thirtyDaysFromNow
        })
            .getMany();
        // Send email notifications
        if (devicesWithExpiringWarranty.length > 0) {
            const adminEmails = ['admin@rtb.gov.rw']; // Would get from admin users in real implementation
            await (0, emailService_1.sendWarrantyExpiryAlert)(devicesWithExpiringWarranty, adminEmails);
        }
        return {
            devicesProcessed: devicesWithExpiringWarranty.length,
            notificationsSent: devicesWithExpiringWarranty.length
        };
    }
    /**
     * Detect and handle offline devices
     */
    async executeOfflineDeviceDetection() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const offlineDevices = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.lastSeenAt < :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('device.status = :activeStatus', { activeStatus: Device_1.DeviceStatus.ACTIVE })
            .getMany();
        // Send email notifications for offline devices
        if (offlineDevices.length > 0) {
            const adminEmails = ['admin@rtb.gov.rw']; // Would get from admin users in real implementation
            await (0, emailService_1.sendOfflineDeviceAlert)(offlineDevices, adminEmails);
        }
        // Update status of offline devices
        for (const device of offlineDevices) {
            await this.deviceRepository.update(device.id, {
                status: Device_1.DeviceStatus.INACTIVE
            });
        }
        return {
            devicesProcessed: offlineDevices.length
        };
    }
    /**
     * Update device conditions based on age and usage patterns
     */
    async executeDeviceAgingUpdate() {
        const devices = await this.deviceRepository.find();
        let processedCount = 0;
        for (const device of devices) {
            const age = device.ageInYears;
            if (age === null)
                continue;
            let newCondition = device.condition;
            // Age-based condition degradation
            if (age >= 5 && device.condition === Device_1.DeviceCondition.EXCELLENT) {
                newCondition = Device_1.DeviceCondition.GOOD;
            }
            else if (age >= 7 && device.condition === Device_1.DeviceCondition.GOOD) {
                newCondition = Device_1.DeviceCondition.FAIR;
            }
            else if (age >= 10 && device.condition === Device_1.DeviceCondition.FAIR) {
                newCondition = Device_1.DeviceCondition.POOR;
            }
            // Usage-based condition assessment
            const daysSinceLastSeen = device.daysSinceLastSeen;
            if (daysSinceLastSeen && daysSinceLastSeen > 30) {
                // Device not used recently, might need inspection
                if (device.condition === Device_1.DeviceCondition.EXCELLENT) {
                    newCondition = Device_1.DeviceCondition.GOOD;
                }
            }
            if (newCondition !== device.condition) {
                await this.deviceRepository.update(device.id, {
                    condition: newCondition
                });
                processedCount++;
            }
        }
        return { devicesProcessed: processedCount };
    }
    /**
     * Auto-assign school users to their schools based on email domain or other criteria
     */
    async autoAssignSchoolUsers() {
        const schoolUsers = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.school', 'school')
            .where('user.role = :role', { role: User_1.UserRole.SCHOOL })
            .andWhere('user.school_id IS NULL')
            .getMany();
        const schools = await this.schoolRepository.find();
        let assignedCount = 0;
        for (const user of schoolUsers) {
            // Try to match user email domain with school
            const emailDomain = user.email.split('@')[1];
            // Look for school with matching domain or similar name
            const matchingSchool = schools.find(school => school.email?.includes(emailDomain) ||
                user.email.toLowerCase().includes(school.name.toLowerCase().replace(/\s+/g, '')));
            if (matchingSchool) {
                await this.userRepository.update(user.id, {
                    school: matchingSchool
                });
                assignedCount++;
            }
        }
        return assignedCount;
    }
    /**
     * Schedule maintenance for a device
     */
    async scheduleDeviceMaintenance(device) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 7); // Schedule for next week
        const maintenanceSchedule = {
            deviceId: device.id,
            scheduledDate,
            type: 'preventive',
            description: `Scheduled preventive maintenance for ${device.name_tag}`,
            priority: device.condition === Device_1.DeviceCondition.POOR ? 'high' : 'medium',
            estimatedCost: this.estimateMaintenanceCost(device)
        };
        // Update device next maintenance date
        const nextMaintenance = new Date(scheduledDate);
        nextMaintenance.setMonth(nextMaintenance.getMonth() + 6); // Next maintenance in 6 months
        await this.deviceRepository.update(device.id, {
            nextMaintenanceDate: nextMaintenance
        });
        return maintenanceSchedule;
    }
    /**
     * Create new automation rule
     */
    async createAutomationRule(rule) {
        const newRule = {
            ...rule,
            id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        };
        this.automationRules.push(newRule);
        return newRule;
    }
    /**
     * Delete automation rule
     */
    async deleteAutomationRule(ruleId) {
        const ruleIndex = this.automationRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex === -1)
            return false;
        this.automationRules.splice(ruleIndex, 1);
        return true;
    }
    /**
     * Toggle automation rule enabled/disabled
     */
    async toggleAutomationRule(ruleId) {
        const rule = this.automationRules.find(r => r.id === ruleId);
        if (!rule)
            return null;
        rule.enabled = !rule.enabled;
        return rule;
    }
    /**
     * Execute specific automation rule
     */
    async executeAutomationRule(ruleId) {
        const rule = this.automationRules.find(r => r.id === ruleId);
        if (!rule)
            throw new Error('Automation rule not found');
        return this.executeRule(rule);
    }
    /**
     * Get automation rules
     */
    getAutomationRules() {
        return this.automationRules;
    }
    /**
     * Update automation rule
     */
    updateAutomationRule(ruleId, updates) {
        const ruleIndex = this.automationRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex === -1)
            return false;
        this.automationRules[ruleIndex] = {
            ...this.automationRules[ruleIndex],
            ...updates
        };
        return true;
    }
    /**
     * Get maintenance schedule
     */
    async getMaintenanceSchedule(filters = {}) {
        let query = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.nextMaintenanceDate IS NOT NULL');
        if (filters.startDate) {
            query = query.andWhere('device.nextMaintenanceDate >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            query = query.andWhere('device.nextMaintenanceDate <= :endDate', { endDate: filters.endDate });
        }
        if (filters.schoolId) {
            query = query.andWhere('device.school_id = :schoolId', { schoolId: filters.schoolId });
        }
        const devices = await query.getMany();
        return devices.map(device => ({
            deviceId: device.id,
            scheduledDate: device.nextMaintenanceDate,
            type: 'preventive',
            description: `Scheduled maintenance for ${device.name_tag}`,
            priority: this.getMaintenancePriority(device),
            estimatedCost: this.estimateMaintenanceCost(device),
            assignedTechnician: 'TBD'
        })).filter(schedule => !filters.priority || schedule.priority === filters.priority);
    }
    /**
     * Schedule maintenance
     */
    async scheduleMaintenance(maintenanceData) {
        if (!maintenanceData.deviceId) {
            throw new Error('Device ID is required');
        }
        const device = await this.deviceRepository.findOne({
            where: { id: maintenanceData.deviceId }
        });
        if (!device) {
            throw new Error('Device not found');
        }
        // Update device with new maintenance date
        device.nextMaintenanceDate = maintenanceData.scheduledDate;
        await this.deviceRepository.save(device);
        return {
            deviceId: device.id,
            scheduledDate: maintenanceData.scheduledDate,
            type: maintenanceData.type,
            description: maintenanceData.description,
            priority: maintenanceData.priority,
            estimatedCost: maintenanceData.estimatedCost,
            assignedTechnician: maintenanceData.assignedTechnician
        };
    }
    /**
     * Update maintenance schedule
     */
    async updateMaintenanceSchedule(deviceId, updates) {
        const device = await this.deviceRepository.findOne({
            where: { id: deviceId }
        });
        if (!device) {
            throw new Error('Device not found');
        }
        if (updates.scheduledDate) {
            device.nextMaintenanceDate = updates.scheduledDate;
            await this.deviceRepository.save(device);
        }
        return {
            deviceId: device.id,
            scheduledDate: device.nextMaintenanceDate,
            type: 'preventive',
            description: `Updated maintenance for ${device.name_tag}`,
            priority: this.getMaintenancePriority(device),
            estimatedCost: this.estimateMaintenanceCost(device),
            assignedTechnician: updates.assignedTechnician || 'TBD'
        };
    }
    /**
     * Check for devices needing maintenance
     */
    async checkMaintenanceNeeded() {
        const now = new Date();
        return this.deviceRepository.find({
            where: {
            // This would need proper SQL query for nextMaintenanceDate <= now
            },
            relations: ['school']
        });
    }
    /**
     * Check for warranty expiries
     */
    async checkWarrantyExpiries(daysAhead = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.warrantyExpiry IS NOT NULL')
            .andWhere('device.warrantyExpiry <= :futureDate', { futureDate })
            .andWhere('device.warrantyExpiry > :now', { now: new Date() })
            .getMany();
    }
    /**
     * Detect offline devices
     */
    async detectOfflineDevices(hoursOffline = 24) {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - hoursOffline);
        return this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.lastSeenAt IS NOT NULL')
            .andWhere('device.lastSeenAt < :thresholdDate', { thresholdDate })
            .getMany();
    }
    /**
     * Auto-assign users to schools (wrapper method)
     */
    async autoAssignUsersToSchools(dryRun = false) {
        if (dryRun) {
            // Return simulation results without making changes
            const unassignedUsers = await this.userRepository.find({
                where: { role: 'school' }
            });
            return {
                assignedUsers: unassignedUsers.length,
                assignments: unassignedUsers.map(user => ({
                    userId: user.id,
                    schoolId: 1, // Mock assignment
                    reason: 'Simulated assignment based on location'
                }))
            };
        }
        const assignedCount = await this.autoAssignSchoolUsers();
        return {
            assignedUsers: assignedCount,
            assignments: []
        };
    }
    /**
     * Update device aging
     */
    async updateDeviceAging() {
        const devices = await this.deviceRepository.find();
        let updatedCount = 0;
        for (const device of devices) {
            if (device.purchaseDate) {
                const newAge = device.ageInYears;
                if (newAge !== null && newAge !== device.age) {
                    device.age = newAge;
                    await this.deviceRepository.save(device);
                    updatedCount++;
                }
            }
        }
        return { updatedDevices: updatedCount };
    }
    /**
     * Get automation report
     */
    async getAutomationReport(filters = {}) {
        const enabledRules = this.automationRules.filter(r => r.enabled);
        const totalRulesExecuted = enabledRules.length;
        // Mock report data - would implement proper tracking
        return {
            totalRulesExecuted,
            successfulExecutions: Math.floor(totalRulesExecuted * 0.9),
            failedExecutions: Math.floor(totalRulesExecuted * 0.1),
            devicesProcessed: await this.deviceRepository.count(),
            notificationsSent: Math.floor(totalRulesExecuted * 2),
            maintenanceScheduled: Math.floor(totalRulesExecuted * 0.5),
            automationEfficiency: 90
        };
    }
    /**
     * Run all automation rules
     */
    async runAllAutomations() {
        return this.executeAutomationRules();
    }
    /**
     * Get automation statistics
     */
    async getAutomationStatistics() {
        const totalRules = this.automationRules.length;
        const enabledRules = this.automationRules.filter(r => r.enabled).length;
        const disabledRules = totalRules - enabledRules;
        return {
            totalRules,
            enabledRules,
            disabledRules,
            lastExecutionTime: this.automationRules
                .map(r => r.lastRun)
                .filter(Boolean)
                .sort()
                .pop(),
            averageExecutionTime: 2.5, // Mock value in seconds
            successRate: 90 // Mock value as percentage
        };
    }
    /**
     * Optimize device assignments across schools
     */
    async optimizeDeviceAssignments() {
        const devices = await this.deviceRepository.find({
            relations: ['school']
        });
        const schools = await this.schoolRepository.find({
            relations: ['devices']
        });
        const optimizations = [];
        // Find underutilized devices
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        for (const device of devices) {
            const isUnderutilized = !device.lastSeenAt || device.lastSeenAt < thirtyDaysAgo;
            if (isUnderutilized && device.school) {
                // Find schools that need this type of device
                const schoolsNeedingDevice = schools.filter(school => {
                    const hasDevicesOfType = school.devices?.some(d => d.category === device.category);
                    const deviceCount = school.devices?.filter(d => d.category === device.category).length || 0;
                    return !hasDevicesOfType || deviceCount < 2; // Schools with fewer than 2 devices of this type
                });
                if (schoolsNeedingDevice.length > 0) {
                    // Recommend the closest school (simplified logic)
                    const recommendedSchool = schoolsNeedingDevice[0];
                    optimizations.push({
                        deviceId: device.id,
                        currentSchoolId: device.school.id,
                        recommendedSchoolId: recommendedSchool.id,
                        reason: `Device underutilized at ${device.school.name}, could benefit ${recommendedSchool.name}`,
                        priority: 'medium'
                    });
                }
            }
        }
        return {
            optimization: optimizations,
            summary: {
                totalDevicesAnalyzed: devices.length,
                optimizationsFound: optimizations.length,
                potentialSavings: optimizations.length * 1000 // Rough estimate
            }
        };
    }
    // Helper methods
    getMaintenancePriority(device) {
        if (device.condition === 'broken')
            return 'critical';
        if (device.condition === 'poor')
            return 'high';
        if (device.maintenanceOverdue)
            return 'high';
        if (device.needsMaintenance)
            return 'medium';
        return 'low';
    }
    estimateMaintenanceCost(device) {
        const baseCost = device.purchaseCost * 0.1; // 10% of purchase cost
        const ageFactor = (device.ageInYears || 0) * 0.02; // 2% increase per year
        return Math.round(baseCost * (1 + ageFactor));
    }
}
exports.AutomationService = AutomationService;
