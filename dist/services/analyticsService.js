"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const Device_1 = require("../entity/Device");
const School_1 = require("../entity/School");
const User_1 = require("../entity/User");
const data_source_1 = require("../data-source");
class AnalyticsService {
    constructor() {
        this.deviceRepository = data_source_1.AppDataSource.getRepository(Device_1.Device);
        this.schoolRepository = data_source_1.AppDataSource.getRepository(School_1.School);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStatistics() {
        const [overview, devicesByCategory, devicesByStatus, devicesByCondition, schoolsByProvince, schoolsByType, usersByRole, recentActivity, alerts] = await Promise.all([
            this.getOverviewStatistics(),
            this.getDevicesByCategory(),
            this.getDevicesByStatus(),
            this.getDevicesByCondition(),
            this.getSchoolsByProvince(),
            this.getSchoolsByType(),
            this.getUsersByRole(),
            this.getRecentActivity(),
            this.getAlerts()
        ]);
        return {
            overview,
            devicesByCategory,
            devicesByStatus,
            devicesByCondition,
            schoolsByProvince,
            schoolsByType,
            usersByRole,
            recentActivity,
            alerts
        };
    }
    /**
     * Get detailed device analytics
     */
    async getDeviceAnalytics() {
        const devices = await this.deviceRepository.find({
            relations: ['school']
        });
        const totalValue = devices.reduce((sum, device) => sum + device.purchaseCost, 0);
        const depreciatedValue = devices.reduce((sum, device) => sum + device.depreciationValue, 0);
        const maintenanceCosts = devices.reduce((sum, device) => sum + device.totalMaintenanceCost, 0);
        const devicesWithAge = devices.filter(d => d.ageInYears !== null);
        const averageAge = devicesWithAge.length > 0
            ? devicesWithAge.reduce((sum, d) => sum + (d.ageInYears || 0), 0) / devicesWithAge.length
            : 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeDevices = devices.filter(d => d.lastSeenAt && d.lastSeenAt > thirtyDaysAgo);
        const utilizationRate = devices.length > 0 ? (activeDevices.length / devices.length) * 100 : 0;
        const categoryDistribution = this.calculateCategoryDistribution(devices);
        const ageDistribution = this.calculateAgeDistribution(devices);
        const statusTrends = this.calculateStatusDistribution(devices);
        const topBrands = this.calculateTopBrands(devices);
        const provinceDistribution = this.calculateProvinceDistribution(devices);
        return {
            totalValue,
            averageAge: Math.round(averageAge * 100) / 100,
            depreciatedValue,
            maintenanceCosts,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
            categoryDistribution,
            ageDistribution,
            statusTrends,
            topBrands,
            provinceDistribution
        };
    }
    /**
     * Get detailed school analytics
     */
    async getSchoolAnalytics() {
        const schools = await this.schoolRepository.find({
            relations: ['devices']
        });
        const schoolsWithDevices = schools.filter(s => s.devices && s.devices.length > 0);
        const averageDevicesPerSchool = schoolsWithDevices.length > 0
            ? schoolsWithDevices.reduce((sum, s) => sum + s.devices.length, 0) / schoolsWithDevices.length
            : 0;
        const schoolsWithoutDevices = schools.length - schoolsWithDevices.length;
        const typeDistribution = schools.reduce((acc, school) => {
            acc[school.type] = (acc[school.type] || 0) + 1;
            return acc;
        }, {});
        const facilitiesAnalysis = {
            withElectricity: schools.filter(s => s.facilities?.hasElectricity).length,
            withInternet: schools.filter(s => s.facilities?.hasInternet).length,
            withLibrary: schools.filter(s => s.facilities?.hasLibrary).length,
            withLaboratory: schools.filter(s => s.facilities?.hasLaboratory).length,
        };
        const geographicDistribution = schools.reduce((acc, school) => {
            if (!acc[school.province])
                acc[school.province] = {};
            acc[school.province][school.district] = (acc[school.province][school.district] || 0) + 1;
            return acc;
        }, {});
        const totalStudents = schools.reduce((sum, s) => sum + (s.studentCount || 0), 0);
        const totalTeachers = schools.reduce((sum, s) => sum + (s.teacherCount || 0), 0);
        const schoolsWithStudentCount = schools.filter(s => s.studentCount);
        const schoolsWithTeacherCount = schools.filter(s => s.teacherCount);
        const enrollmentAnalysis = {
            totalStudents,
            totalTeachers,
            averageStudentsPerSchool: schoolsWithStudentCount.length > 0
                ? Math.round(totalStudents / schoolsWithStudentCount.length) : 0,
            averageTeachersPerSchool: schoolsWithTeacherCount.length > 0
                ? Math.round(totalTeachers / schoolsWithTeacherCount.length) : 0,
        };
        return {
            averageDevicesPerSchool: Math.round(averageDevicesPerSchool * 100) / 100,
            schoolsWithoutDevices,
            typeDistribution,
            facilitiesAnalysis,
            geographicDistribution,
            enrollmentAnalysis
        };
    }
    /**
     * Get detailed user analytics
     */
    async getUserAnalytics() {
        const users = await this.userRepository.find({
            relations: ['school']
        });
        const roleDistribution = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
        const statusDistribution = users.reduce((acc, user) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
        }, {});
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const activeUsersLastWeek = users.filter(u => u.lastLoginAt && u.lastLoginAt > oneWeekAgo).length;
        const activeUsersLastMonth = users.filter(u => u.lastLoginAt && u.lastLoginAt > oneMonthAgo).length;
        const neverLoggedIn = users.filter(u => !u.lastLoginAt).length;
        const loginActivity = {
            activeUsersLastWeek,
            activeUsersLastMonth,
            neverLoggedIn,
            averageLoginFrequency: 0 // This would require login tracking
        };
        const schoolUserDistribution = users.reduce((acc, user) => {
            const schoolName = user.school?.name || 'No School';
            acc[schoolName] = (acc[schoolName] || 0) + 1;
            return acc;
        }, {});
        const genderDistribution = users.reduce((acc, user) => {
            acc[user.gender] = (acc[user.gender] || 0) + 1;
            return acc;
        }, {});
        const ageDistribution = users.reduce((acc, user) => {
            const age = user.age;
            if (age === null) {
                acc['Unknown'] = (acc['Unknown'] || 0) + 1;
            }
            else if (age < 25) {
                acc['Under 25'] = (acc['Under 25'] || 0) + 1;
            }
            else if (age < 35) {
                acc['25-34'] = (acc['25-34'] || 0) + 1;
            }
            else if (age < 45) {
                acc['35-44'] = (acc['35-44'] || 0) + 1;
            }
            else if (age < 55) {
                acc['45-54'] = (acc['45-54'] || 0) + 1;
            }
            else {
                acc['55+'] = (acc['55+'] || 0) + 1;
            }
            return acc;
        }, {});
        return {
            roleDistribution,
            statusDistribution,
            loginActivity,
            schoolUserDistribution,
            genderDistribution,
            ageDistribution
        };
    }
    /**
     * Get trend analytics over time
     */
    async getTrendAnalytics(months = 12) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        // Generate monthly periods
        const periods = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            periods.push(current.toISOString().slice(0, 7)); // YYYY-MM format
            current.setMonth(current.getMonth() + 1);
        }
        const [deviceGrowth, schoolGrowth, userGrowth] = await Promise.all([
            this.getGrowthTrend('device', periods),
            this.getGrowthTrend('school', periods),
            this.getGrowthTrend('user', periods)
        ]);
        // Placeholder for maintenance and cost trends (would need maintenance tracking)
        const maintenanceTrends = periods.map(period => ({ period, count: 0, cost: 0 }));
        const costTrends = periods.map(period => ({ period, totalCost: 0, maintenanceCost: 0 }));
        return {
            deviceGrowth,
            schoolGrowth,
            userGrowth,
            maintenanceTrends,
            costTrends
        };
    }
    async getOverviewStatistics() {
        const [totalDevices, totalSchools, totalUsers, activeDevicesCount, onlineDevicesCount, maintenanceNeededCount] = await Promise.all([
            this.deviceRepository.count(),
            this.schoolRepository.count(),
            this.userRepository.count(),
            this.getActiveDevicesCount(),
            this.getOnlineDevicesCount(),
            this.getMaintenanceNeededCount()
        ]);
        return {
            totalDevices,
            totalSchools,
            totalUsers,
            activeDevices: activeDevicesCount,
            onlineDevices: onlineDevicesCount,
            devicesNeedingMaintenance: maintenanceNeededCount
        };
    }
    async getActiveDevicesCount() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return await this.deviceRepository.count({
            where: {
                status: Device_1.DeviceStatus.ACTIVE
            }
        });
    }
    async getOnlineDevicesCount() {
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        return await this.deviceRepository
            .createQueryBuilder('device')
            .where('device.lastSeenAt >= :thirtyMinutesAgo', { thirtyMinutesAgo })
            .getCount();
    }
    async getMaintenanceNeededCount() {
        const now = new Date();
        return await this.deviceRepository
            .createQueryBuilder('device')
            .where('device.nextMaintenanceDate <= :now', { now })
            .getCount();
    }
    async getDevicesByCategory() {
        const result = await this.deviceRepository
            .createQueryBuilder('device')
            .select('device.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .groupBy('device.category')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.category] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getDevicesByStatus() {
        const result = await this.deviceRepository
            .createQueryBuilder('device')
            .select('device.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('device.status')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getDevicesByCondition() {
        const result = await this.deviceRepository
            .createQueryBuilder('device')
            .select('device.condition', 'condition')
            .addSelect('COUNT(*)', 'count')
            .groupBy('device.condition')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.condition] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getSchoolsByProvince() {
        const result = await this.schoolRepository
            .createQueryBuilder('school')
            .select('school.province', 'province')
            .addSelect('COUNT(*)', 'count')
            .groupBy('school.province')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.province] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getSchoolsByType() {
        const result = await this.schoolRepository
            .createQueryBuilder('school')
            .select('school.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('school.type')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.type] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getUsersByRole() {
        const result = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.role] = parseInt(item.count);
            return acc;
        }, {});
    }
    async getRecentActivity() {
        const [recentDevices, recentSchools, recentUsers] = await Promise.all([
            this.deviceRepository.find({
                relations: ['school'],
                order: { createdAt: 'DESC' },
                take: 5
            }),
            this.schoolRepository.find({
                order: { createdAt: 'DESC' },
                take: 5
            }),
            this.userRepository.find({
                relations: ['school'],
                order: { createdAt: 'DESC' },
                take: 5
            })
        ]);
        return { recentDevices, recentSchools, recentUsers };
    }
    async getAlerts() {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [maintenanceAlerts, warrantyExpiringDevices, offlineDevices, inactiveSchools] = await Promise.all([
            this.deviceRepository.find({
                where: {
                // nextMaintenanceDate: LessThanOrEqual(now)
                },
                relations: ['school'],
                take: 10
            }),
            this.deviceRepository.find({
                // where: {
                //     warrantyExpiry: Between(now, thirtyDaysFromNow)
                // },
                relations: ['school'],
                take: 10
            }),
            this.deviceRepository.find({
                // where: {
                //     lastSeenAt: LessThan(sevenDaysAgo)
                // },
                relations: ['school'],
                take: 10
            }),
            this.schoolRepository.find({
                where: {
                    status: School_1.SchoolStatus.INACTIVE
                },
                take: 10
            })
        ]);
        return {
            maintenanceAlerts,
            warrantyExpiringDevices,
            offlineDevices,
            inactiveSchools
        };
    }
    calculateCategoryDistribution(devices) {
        const total = devices.length;
        const distribution = devices.reduce((acc, device) => {
            if (!acc[device.category]) {
                acc[device.category] = { count: 0, value: 0, percentage: 0 };
            }
            acc[device.category].count++;
            acc[device.category].value += device.purchaseCost;
            return acc;
        }, {});
        // Calculate percentages
        Object.keys(distribution).forEach(category => {
            distribution[category].percentage = Math.round((distribution[category].count / total) * 100 * 100) / 100;
        });
        return distribution;
    }
    calculateAgeDistribution(devices) {
        return devices.reduce((acc, device) => {
            const age = device.ageInYears;
            let ageGroup;
            if (age === null) {
                ageGroup = 'Unknown';
            }
            else if (age < 1) {
                ageGroup = 'Less than 1 year';
            }
            else if (age <= 2) {
                ageGroup = '1-2 years';
            }
            else if (age <= 5) {
                ageGroup = '3-5 years';
            }
            else {
                ageGroup = 'More than 5 years';
            }
            acc[ageGroup] = (acc[ageGroup] || 0) + 1;
            return acc;
        }, {});
    }
    calculateStatusDistribution(devices) {
        return devices.reduce((acc, device) => {
            acc[device.status] = (acc[device.status] || 0) + 1;
            return acc;
        }, {});
    }
    calculateTopBrands(devices) {
        const brandStats = devices.reduce((acc, device) => {
            if (!acc[device.brand]) {
                acc[device.brand] = { count: 0, value: 0 };
            }
            acc[device.brand].count++;
            acc[device.brand].value += device.purchaseCost;
            return acc;
        }, {});
        return Object.entries(brandStats)
            .map(([brand, stats]) => ({ brand, ...stats }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    calculateProvinceDistribution(devices) {
        return devices.reduce((acc, device) => {
            const province = device.school?.province || 'Unassigned';
            if (!acc[province]) {
                acc[province] = { devices: 0, value: 0 };
            }
            acc[province].devices++;
            acc[province].value += device.purchaseCost;
            return acc;
        }, {});
    }
    async getGrowthTrend(entityType, periods) {
        const repository = entityType === 'device' ? this.deviceRepository
            : entityType === 'school' ? this.schoolRepository
                : this.userRepository;
        const result = await repository
            .createQueryBuilder(entityType)
            .select(`DATE_TRUNC('month', ${entityType}.createdAt)`, 'period')
            .addSelect('COUNT(*)', 'count')
            .where(`${entityType}.createdAt >= :startDate`, {
            startDate: new Date(periods[0] + '-01')
        })
            .groupBy(`DATE_TRUNC('month', ${entityType}.createdAt)`)
            .orderBy('period', 'ASC')
            .getRawMany();
        // Fill in missing periods with 0 counts
        return periods.map(period => {
            const found = result.find(r => r.period.toISOString().slice(0, 7) === period);
            return {
                period,
                count: found ? parseInt(found.count) : 0
            };
        });
    }
    /**
     * Generate analytics report
     */
    async generateReport(type, options) {
        const [dashboard, deviceAnalytics, schoolAnalytics, userAnalytics] = await Promise.all([
            this.getDashboardStatistics(),
            this.getDeviceAnalytics(),
            this.getSchoolAnalytics(),
            this.getUserAnalytics()
        ]);
        const report = {
            generatedAt: new Date(),
            type,
            dashboard,
            deviceAnalytics,
            schoolAnalytics,
            userAnalytics
        };
        if (options.format === 'json') {
            return report;
        }
        else if (options.format === 'csv') {
            // Convert to CSV format
            return this.convertToCSV(report);
        }
        else {
            // Generate PDF (would need a PDF library)
            return report; // Placeholder
        }
    }
    /**
     * Get device performance metrics
     */
    async getDevicePerformanceMetrics(deviceId) {
        const device = await this.deviceRepository.findOne({
            where: { id: deviceId },
            relations: ['school']
        });
        if (!device) {
            throw new Error('Device not found');
        }
        const utilizationScore = this.calculateUtilizationScore(device);
        const reliabilityScore = this.calculateReliabilityScore(device);
        const costEfficiency = this.calculateCostEfficiency(device);
        return {
            device,
            utilizationScore,
            reliabilityScore,
            maintenanceHistory: device.maintenance?.repairs || [],
            costEfficiency,
            recommendations: this.generateDeviceRecommendations(device, utilizationScore, reliabilityScore)
        };
    }
    /**
     * Get school performance metrics
     */
    async getSchoolPerformanceMetrics(schoolId) {
        const school = await this.schoolRepository.findOne({
            where: { id: schoolId },
            relations: ['devices']
        });
        if (!school) {
            throw new Error('School not found');
        }
        const deviceUtilization = this.calculateSchoolDeviceUtilization(school);
        const totalValue = school.devices?.reduce((sum, d) => sum + d.purchaseCost, 0) || 0;
        const maintenanceEfficiency = this.calculateMaintenanceEfficiency(school.devices || []);
        const technologyReadiness = this.calculateTechnologyReadiness(school);
        return {
            school,
            deviceUtilization,
            totalValue,
            maintenanceEfficiency,
            technologyReadiness,
            recommendations: this.generateSchoolRecommendations(school, deviceUtilization, technologyReadiness)
        };
    }
    /**
     * Get cost analysis
     */
    async getCostAnalysis(options) {
        const devices = await this.deviceRepository.find({ relations: ['school'] });
        const totalPurchaseCost = devices.reduce((sum, d) => sum + d.purchaseCost, 0);
        const totalMaintenanceCost = devices.reduce((sum, d) => sum + d.totalMaintenanceCost, 0);
        const averageCostPerDevice = devices.length > 0 ? totalPurchaseCost / devices.length : 0;
        // Cost by category
        const costByCategory = devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + device.purchaseCost;
            return acc;
        }, {});
        return {
            totalPurchaseCost,
            totalMaintenanceCost,
            averageCostPerDevice,
            costByPeriod: [], // Would implement based on actual data
            costByCategory,
            costProjections: [] // Would implement projection algorithm
        };
    }
    /**
     * Get maintenance analytics
     */
    async getMaintenanceAnalytics(filters) {
        let query = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school');
        if (filters.schoolId) {
            query = query.andWhere('device.school_id = :schoolId', { schoolId: filters.schoolId });
        }
        if (filters.deviceCategory) {
            query = query.andWhere('device.category = :category', { category: filters.deviceCategory });
        }
        const devices = await query.getMany();
        const totalMaintenanceEvents = devices.reduce((sum, d) => sum + (d.maintenance?.repairs?.length || 0), 0);
        const totalMaintenanceCost = devices.reduce((sum, d) => sum + d.totalMaintenanceCost, 0);
        const averageCostPerEvent = totalMaintenanceEvents > 0
            ? totalMaintenanceCost / totalMaintenanceEvents : 0;
        const upcomingMaintenance = devices.filter(d => d.needsMaintenance && !d.maintenanceOverdue);
        const overdueMaintenance = devices.filter(d => d.maintenanceOverdue);
        const maintenanceByCategory = devices.reduce((acc, device) => {
            const cost = device.totalMaintenanceCost;
            acc[device.category] = (acc[device.category] || 0) + cost;
            return acc;
        }, {});
        return {
            totalMaintenanceEvents,
            averageCostPerEvent,
            maintenanceByCategory,
            upcomingMaintenance,
            overdueMaintenance,
            maintenanceEfficiency: this.calculateMaintenanceEfficiency(devices)
        };
    }
    /**
     * Get utilization analytics
     */
    async getUtilizationAnalytics(filters) {
        let query = this.deviceRepository.createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school');
        if (filters.schoolId) {
            query = query.andWhere('device.school_id = :schoolId', { schoolId: filters.schoolId });
        }
        if (filters.province) {
            query = query.andWhere('school.province = :province', { province: filters.province });
        }
        if (filters.district) {
            query = query.andWhere('school.district = :district', { district: filters.district });
        }
        const devices = await query.getMany();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeDevices = devices.filter(d => d.lastSeenAt && d.lastSeenAt > thirtyDaysAgo);
        const overallUtilization = devices.length > 0 ? (activeDevices.length / devices.length) * 100 : 0;
        const utilizationByCategory = devices.reduce((acc, device) => {
            const isActive = device.lastSeenAt && device.lastSeenAt > thirtyDaysAgo;
            if (!acc[device.category]) {
                acc[device.category] = { total: 0, active: 0 };
            }
            acc[device.category].total++;
            if (isActive)
                acc[device.category].active++;
            return acc;
        }, {});
        const utilizationByCategoryPercent = Object.entries(utilizationByCategory).reduce((acc, [category, stats]) => {
            acc[category] = (stats.active / stats.total) * 100;
            return acc;
        }, {});
        const underutilizedDevices = devices.filter(d => !d.lastSeenAt || d.daysSinceLastSeen === null || d.daysSinceLastSeen > 30);
        return {
            overallUtilization,
            utilizationByCategory: utilizationByCategoryPercent,
            utilizationBySchool: [], // Would implement school-level aggregation
            underutilizedDevices,
            recommendations: this.generateUtilizationRecommendations(overallUtilization, underutilizedDevices)
        };
    }
    // Helper methods
    convertToCSV(data) {
        // Simple CSV conversion - would need proper implementation
        return JSON.stringify(data);
    }
    calculateUtilizationScore(device) {
        if (!device.lastSeenAt)
            return 0;
        const daysSinceLastSeen = device.daysSinceLastSeen || 999;
        return Math.max(0, 100 - (daysSinceLastSeen * 3.33)); // 0% after 30 days
    }
    calculateReliabilityScore(device) {
        const age = device.ageInYears || 0;
        const repairCount = device.maintenance?.repairs?.length || 0;
        const baseScore = Math.max(0, 100 - (age * 10)); // Decrease by 10% per year
        const reliabilityPenalty = Math.min(50, repairCount * 10); // Up to 50% penalty for repairs
        return Math.max(0, baseScore - reliabilityPenalty);
    }
    calculateCostEfficiency(device) {
        const totalCost = device.purchaseCost + device.totalMaintenanceCost;
        const ageInYears = device.ageInYears || 1;
        const currentValue = device.depreciationValue;
        return (currentValue / totalCost) * 100;
    }
    generateDeviceRecommendations(device, utilization, reliability) {
        const recommendations = [];
        if (utilization < 30) {
            recommendations.push('Device appears underutilized - consider reassignment');
        }
        if (reliability < 50) {
            recommendations.push('Device reliability is low - consider replacement');
        }
        if (device.needsMaintenance) {
            recommendations.push('Schedule maintenance as soon as possible');
        }
        if (!device.isWarrantyActive && device.ageInYears && device.ageInYears > 5) {
            recommendations.push('Consider upgrading this aging device');
        }
        return recommendations;
    }
    calculateSchoolDeviceUtilization(school) {
        if (!school.devices || school.devices.length === 0)
            return 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeDevices = school.devices.filter(d => d.lastSeenAt && d.lastSeenAt > thirtyDaysAgo);
        return (activeDevices.length / school.devices.length) * 100;
    }
    calculateMaintenanceEfficiency(devices) {
        const devicesNeedingMaintenance = devices.filter(d => d.needsMaintenance);
        const overdueDevices = devices.filter(d => d.maintenanceOverdue);
        if (devicesNeedingMaintenance.length === 0)
            return 100;
        const onTimePercentage = ((devicesNeedingMaintenance.length - overdueDevices.length) / devicesNeedingMaintenance.length) * 100;
        return Math.max(0, onTimePercentage);
    }
    calculateTechnologyReadiness(school) {
        let score = 0;
        if (school.facilities?.hasElectricity)
            score += 25;
        if (school.facilities?.hasInternet)
            score += 25;
        if (school.facilities?.hasLibrary)
            score += 15;
        if (school.facilities?.hasLaboratory)
            score += 15;
        if ((school.facilities?.computerLabCount || 0) > 0)
            score += 20;
        return score;
    }
    generateSchoolRecommendations(school, utilization, readiness) {
        const recommendations = [];
        if (utilization < 50) {
            recommendations.push('Increase device utilization through training programs');
        }
        if (readiness < 70) {
            recommendations.push('Improve basic infrastructure for better technology adoption');
        }
        if (!school.facilities?.hasInternet) {
            recommendations.push('Priority: Establish internet connectivity');
        }
        if ((school.deviceCount || 0) === 0) {
            recommendations.push('Consider initial device allocation for this school');
        }
        return recommendations;
    }
    generateUtilizationRecommendations(overall, underutilized) {
        const recommendations = [];
        if (overall < 60) {
            recommendations.push('Overall device utilization is low - review deployment strategy');
        }
        if (underutilized.length > 0) {
            recommendations.push(`${underutilized.length} devices are underutilized - consider redistribution`);
        }
        return recommendations;
    }
}
exports.AnalyticsService = AnalyticsService;
