import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor() {
        this.analyticsService = new AnalyticsService();
    }

    /**
     * Get dashboard statistics
     */
    getDashboardStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.analyticsService.getDashboardStatistics();
            res.json(stats);
        } catch (error) {
            console.error('Error getting dashboard statistics:', error);
            res.status(500).json({ error: 'Failed to get dashboard statistics' });
        }
    };

    /**
     * Get device analytics
     */
    getDeviceAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const analytics = await this.analyticsService.getDeviceAnalytics();
            res.json(analytics);
        } catch (error) {
            console.error('Error getting device analytics:', error);
            res.status(500).json({ error: 'Failed to get device analytics' });
        }
    };

    /**
     * Get school analytics
     */
    getSchoolAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const analytics = await this.analyticsService.getSchoolAnalytics();
            res.json(analytics);
        } catch (error) {
            console.error('Error getting school analytics:', error);
            res.status(500).json({ error: 'Failed to get school analytics' });
        }
    };

    /**
     * Get user analytics
     */
    getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const analytics = await this.analyticsService.getUserAnalytics();
            res.json(analytics);
        } catch (error) {
            console.error('Error getting user analytics:', error);
            res.status(500).json({ error: 'Failed to get user analytics' });
        }
    };

    /**
     * Get trend analytics
     */
    getTrendAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                months = 12
            } = req.query;

            const analytics = await this.analyticsService.getTrendAnalytics(
                parseInt(months as string)
            );
            res.json(analytics);
        } catch (error) {
            console.error('Error getting trend analytics:', error);
            res.status(500).json({ error: 'Failed to get trend analytics' });
        }
    };

    /**
     * Generate analytics report
     */
    generateReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                type = 'comprehensive',
                format = 'json',
                includeCharts = false
            } = req.body;

            const report = await this.analyticsService.generateReport(
                type as 'summary' | 'detailed' | 'comprehensive',
                {
                    format: format as 'json' | 'csv' | 'pdf',
                    includeCharts: includeCharts as boolean,
                    filters: req.body.filters || {}
                }
            );

            if (format === 'json') {
                res.json(report);
            } else {
                res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-report.${format}"`);
                res.send(report);
            }
        } catch (error) {
            console.error('Error generating analytics report:', error);
            res.status(500).json({ error: 'Failed to generate analytics report' });
        }
    };

    /**
     * Get device performance metrics
     */
    getDevicePerformance = async (req: Request, res: Response): Promise<void> => {
        try {
            const deviceId = parseInt(req.params.deviceId);
            const performance = await this.analyticsService.getDevicePerformanceMetrics(deviceId);
            res.json(performance);
        } catch (error) {
            console.error('Error getting device performance:', error);
            res.status(500).json({ error: 'Failed to get device performance metrics' });
        }
    };

    /**
     * Get school performance metrics
     */
    getSchoolPerformance = async (req: Request, res: Response): Promise<void> => {
        try {
            const schoolId = parseInt(req.params.schoolId);
            const performance = await this.analyticsService.getSchoolPerformanceMetrics(schoolId);
            res.json(performance);
        } catch (error) {
            console.error('Error getting school performance:', error);
            res.status(500).json({ error: 'Failed to get school performance metrics' });
        }
    };

    /**
     * Get cost analysis
     */
    getCostAnalysis = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                startDate,
                endDate,
                groupBy = 'month'
            } = req.query;

            const analysis = await this.analyticsService.getCostAnalysis({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                groupBy: groupBy as 'day' | 'week' | 'month' | 'year'
            });
            res.json(analysis);
        } catch (error) {
            console.error('Error getting cost analysis:', error);
            res.status(500).json({ error: 'Failed to get cost analysis' });
        }
    };

    /**
     * Get maintenance analytics
     */
    getMaintenanceAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters = {
                schoolId: req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined,
                deviceCategory: req.query.deviceCategory as any,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            };

            const analytics = await this.analyticsService.getMaintenanceAnalytics(filters);
            res.json(analytics);
        } catch (error) {
            console.error('Error getting maintenance analytics:', error);
            res.status(500).json({ error: 'Failed to get maintenance analytics' });
        }
    };

    /**
     * Get utilization analytics
     */
    getUtilizationAnalytics = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters = {
                schoolId: req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined,
                province: req.query.province as string,
                district: req.query.district as string,
                period: req.query.period as 'day' | 'week' | 'month' || 'month',
            };

            const analytics = await this.analyticsService.getUtilizationAnalytics(filters);
            res.json(analytics);
        } catch (error) {
            console.error('Error getting utilization analytics:', error);
            res.status(500).json({ error: 'Failed to get utilization analytics' });
        }
    };
}

export default new AnalyticsController();
