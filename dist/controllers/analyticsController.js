"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
class AnalyticsController {
    constructor() {
        /**
         * Get dashboard statistics
         */
        this.getDashboardStatistics = async (req, res) => {
            try {
                const stats = await this.analyticsService.getDashboardStatistics();
                res.json(stats);
            }
            catch (error) {
                console.error('Error getting dashboard statistics:', error);
                res.status(500).json({ error: 'Failed to get dashboard statistics' });
            }
        };
        /**
         * Get device analytics
         */
        this.getDeviceAnalytics = async (req, res) => {
            try {
                const analytics = await this.analyticsService.getDeviceAnalytics();
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting device analytics:', error);
                res.status(500).json({ error: 'Failed to get device analytics' });
            }
        };
        /**
         * Get school analytics
         */
        this.getSchoolAnalytics = async (req, res) => {
            try {
                const analytics = await this.analyticsService.getSchoolAnalytics();
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting school analytics:', error);
                res.status(500).json({ error: 'Failed to get school analytics' });
            }
        };
        /**
         * Get user analytics
         */
        this.getUserAnalytics = async (req, res) => {
            try {
                const analytics = await this.analyticsService.getUserAnalytics();
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting user analytics:', error);
                res.status(500).json({ error: 'Failed to get user analytics' });
            }
        };
        /**
         * Get trend analytics
         */
        this.getTrendAnalytics = async (req, res) => {
            try {
                const { months = 12 } = req.query;
                const analytics = await this.analyticsService.getTrendAnalytics(parseInt(months));
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting trend analytics:', error);
                res.status(500).json({ error: 'Failed to get trend analytics' });
            }
        };
        /**
         * Generate analytics report
         */
        this.generateReport = async (req, res) => {
            try {
                const { type = 'comprehensive', format = 'json', includeCharts = false } = req.body;
                const report = await this.analyticsService.generateReport(type, {
                    format: format,
                    includeCharts: includeCharts,
                    filters: req.body.filters || {}
                });
                if (format === 'json') {
                    res.json(report);
                }
                else {
                    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="analytics-report.${format}"`);
                    res.send(report);
                }
            }
            catch (error) {
                console.error('Error generating analytics report:', error);
                res.status(500).json({ error: 'Failed to generate analytics report' });
            }
        };
        /**
         * Get device performance metrics
         */
        this.getDevicePerformance = async (req, res) => {
            try {
                const deviceId = parseInt(req.params.deviceId);
                const performance = await this.analyticsService.getDevicePerformanceMetrics(deviceId);
                res.json(performance);
            }
            catch (error) {
                console.error('Error getting device performance:', error);
                res.status(500).json({ error: 'Failed to get device performance metrics' });
            }
        };
        /**
         * Get school performance metrics
         */
        this.getSchoolPerformance = async (req, res) => {
            try {
                const schoolId = parseInt(req.params.schoolId);
                const performance = await this.analyticsService.getSchoolPerformanceMetrics(schoolId);
                res.json(performance);
            }
            catch (error) {
                console.error('Error getting school performance:', error);
                res.status(500).json({ error: 'Failed to get school performance metrics' });
            }
        };
        /**
         * Get cost analysis
         */
        this.getCostAnalysis = async (req, res) => {
            try {
                const { startDate, endDate, groupBy = 'month' } = req.query;
                const analysis = await this.analyticsService.getCostAnalysis({
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    groupBy: groupBy
                });
                res.json(analysis);
            }
            catch (error) {
                console.error('Error getting cost analysis:', error);
                res.status(500).json({ error: 'Failed to get cost analysis' });
            }
        };
        /**
         * Get maintenance analytics
         */
        this.getMaintenanceAnalytics = async (req, res) => {
            try {
                const filters = {
                    schoolId: req.query.schoolId ? parseInt(req.query.schoolId) : undefined,
                    deviceCategory: req.query.deviceCategory,
                    startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                    endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                };
                const analytics = await this.analyticsService.getMaintenanceAnalytics(filters);
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting maintenance analytics:', error);
                res.status(500).json({ error: 'Failed to get maintenance analytics' });
            }
        };
        /**
         * Get utilization analytics
         */
        this.getUtilizationAnalytics = async (req, res) => {
            try {
                const filters = {
                    schoolId: req.query.schoolId ? parseInt(req.query.schoolId) : undefined,
                    province: req.query.province,
                    district: req.query.district,
                    period: req.query.period || 'month',
                };
                const analytics = await this.analyticsService.getUtilizationAnalytics(filters);
                res.json(analytics);
            }
            catch (error) {
                console.error('Error getting utilization analytics:', error);
                res.status(500).json({ error: 'Failed to get utilization analytics' });
            }
        };
        this.analyticsService = new analyticsService_1.AnalyticsService();
    }
}
exports.AnalyticsController = AnalyticsController;
exports.default = new AnalyticsController();
