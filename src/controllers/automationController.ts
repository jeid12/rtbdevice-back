import { Request, Response } from 'express';
import { AutomationService, AutomationRule, MaintenanceSchedule } from '../services/automationService';

export class AutomationController {
    private automationService: AutomationService;

    constructor() {
        this.automationService = new AutomationService();
    }

    /**
     * Get all automation rules
     */
    getAutomationRules = async (req: Request, res: Response): Promise<void> => {
        try {
            const rules = this.automationService.getAutomationRules();
            res.json(rules);
        } catch (error) {
            console.error('Error getting automation rules:', error);
            res.status(500).json({ error: 'Failed to get automation rules' });
        }
    };

    /**
     * Create new automation rule
     */
    createAutomationRule = async (req: Request, res: Response): Promise<void> => {
        try {
            const rule: Omit<AutomationRule, 'id'> = req.body;
            const createdRule = await this.automationService.createAutomationRule(rule);
            res.status(201).json(createdRule);
        } catch (error) {
            console.error('Error creating automation rule:', error);
            res.status(500).json({ error: 'Failed to create automation rule' });
        }
    };

    /**
     * Update automation rule
     */
    updateAutomationRule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updates = req.body;
            const success = this.automationService.updateAutomationRule(id, updates);
            if (success) {
                res.json({ message: 'Automation rule updated successfully' });
            } else {
                res.status(404).json({ error: 'Automation rule not found' });
            }
        } catch (error) {
            console.error('Error updating automation rule:', error);
            res.status(500).json({ error: 'Failed to update automation rule' });
        }
    };

    /**
     * Delete automation rule
     */
    deleteAutomationRule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const success = await this.automationService.deleteAutomationRule(id);
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Automation rule not found' });
            }
        } catch (error) {
            console.error('Error deleting automation rule:', error);
            res.status(500).json({ error: 'Failed to delete automation rule' });
        }
    };

    /**
     * Toggle automation rule enabled/disabled
     */
    toggleAutomationRule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const rule = await this.automationService.toggleAutomationRule(id);
            if (rule) {
                res.json(rule);
            } else {
                res.status(404).json({ error: 'Automation rule not found' });
            }
        } catch (error) {
            console.error('Error toggling automation rule:', error);
            res.status(500).json({ error: 'Failed to toggle automation rule' });
        }
    };

    /**
     * Execute automation rule manually
     */
    executeAutomationRule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await this.automationService.executeAutomationRule(id);
            res.json(result);
        } catch (error) {
            console.error('Error executing automation rule:', error);
            res.status(500).json({ error: 'Failed to execute automation rule' });
        }
    };

    /**
     * Get maintenance schedule
     */
    getMaintenanceSchedule = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                startDate,
                endDate,
                schoolId,
                priority
            } = req.query;

            const filters = {
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                schoolId: schoolId ? parseInt(schoolId as string) : undefined,
                priority: priority as 'low' | 'medium' | 'high' | 'critical'
            };

            const schedule = await this.automationService.getMaintenanceSchedule(filters);
            res.json(schedule);
        } catch (error) {
            console.error('Error getting maintenance schedule:', error);
            res.status(500).json({ error: 'Failed to get maintenance schedule' });
        }
    };

    /**
     * Schedule maintenance
     */
    scheduleMaintenance = async (req: Request, res: Response): Promise<void> => {
        try {
            const maintenanceData: Omit<MaintenanceSchedule, 'deviceId'> & { deviceId?: number } = req.body;
            const scheduled = await this.automationService.scheduleMaintenance(maintenanceData);
            res.status(201).json(scheduled);
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            res.status(500).json({ error: 'Failed to schedule maintenance' });
        }
    };

    /**
     * Update maintenance schedule
     */
    updateMaintenanceSchedule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { deviceId } = req.params;
            const updates = req.body;
            const updated = await this.automationService.updateMaintenanceSchedule(
                parseInt(deviceId),
                updates
            );
            res.json(updated);
        } catch (error) {
            console.error('Error updating maintenance schedule:', error);
            res.status(500).json({ error: 'Failed to update maintenance schedule' });
        }
    };

    /**
     * Check for devices needing maintenance
     */
    checkMaintenanceNeeded = async (req: Request, res: Response): Promise<void> => {
        try {
            const devicesNeedingMaintenance = await this.automationService.checkMaintenanceNeeded();
            res.json(devicesNeedingMaintenance);
        } catch (error) {
            console.error('Error checking maintenance needed:', error);
            res.status(500).json({ error: 'Failed to check maintenance needed' });
        }
    };

    /**
     * Check for warranty expiries
     */
    checkWarrantyExpiries = async (req: Request, res: Response): Promise<void> => {
        try {
            const { daysAhead = 30 } = req.query;
            const expiringDevices = await this.automationService.checkWarrantyExpiries(
                parseInt(daysAhead as string)
            );
            res.json(expiringDevices);
        } catch (error) {
            console.error('Error checking warranty expiries:', error);
            res.status(500).json({ error: 'Failed to check warranty expiries' });
        }
    };

    /**
     * Detect offline devices
     */
    detectOfflineDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const { hoursOffline = 24 } = req.query;
            const offlineDevices = await this.automationService.detectOfflineDevices(
                parseInt(hoursOffline as string)
            );
            res.json(offlineDevices);
        } catch (error) {
            console.error('Error detecting offline devices:', error);
            res.status(500).json({ error: 'Failed to detect offline devices' });
        }
    };

    /**
     * Optimize device assignments
     */
    optimizeDeviceAssignments = async (req: Request, res: Response): Promise<void> => {
        try {
            const { dryRun = false } = req.query;
            const optimizations = await this.automationService.optimizeDeviceAssignments();
            res.json({
                dryRun: dryRun === 'true',
                optimizations: optimizations.optimization,
                totalOptimizations: optimizations.optimization.length
            });
        } catch (error) {
            console.error('Error optimizing device assignments:', error);
            res.status(500).json({ error: 'Failed to optimize device assignments' });
        }
    };

    /**
     * Auto-assign users to schools
     */
    autoAssignUsersToSchools = async (req: Request, res: Response): Promise<void> => {
        try {
            const { dryRun = false } = req.query;
            const assignments = await this.automationService.autoAssignUsersToSchools(
                dryRun === 'true'
            );
            res.json(assignments);
        } catch (error) {
            console.error('Error auto-assigning users to schools:', error);
            res.status(500).json({ error: 'Failed to auto-assign users to schools' });
        }
    };

    /**
     * Update device aging
     */
    updateDeviceAging = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.automationService.updateDeviceAging();
            res.json(result);
        } catch (error) {
            console.error('Error updating device aging:', error);
            res.status(500).json({ error: 'Failed to update device aging' });
        }
    };

    /**
     * Get automation report
     */
    getAutomationReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                startDate,
                endDate
            } = req.query;

            const filters = {
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined
            };

            const report = await this.automationService.getAutomationReport(filters);
            res.json(report);
        } catch (error) {
            console.error('Error getting automation report:', error);
            res.status(500).json({ error: 'Failed to get automation report' });
        }
    };

    /**
     * Run all automation rules
     */
    runAllAutomations = async (req: Request, res: Response): Promise<void> => {
        try {
            const results = await this.automationService.runAllAutomations();
            res.json(results);
        } catch (error) {
            console.error('Error running all automations:', error);
            res.status(500).json({ error: 'Failed to run all automations' });
        }
    };

    /**
     * Get automation statistics
     */
    getAutomationStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.automationService.getAutomationStatistics();
            res.json(stats);
        } catch (error) {
            console.error('Error getting automation statistics:', error);
            res.status(500).json({ error: 'Failed to get automation statistics' });
        }
    };
}

export default new AutomationController();
