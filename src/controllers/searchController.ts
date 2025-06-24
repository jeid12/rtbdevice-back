import { Request, Response } from 'express';
import { AdvancedSearchService, SearchFilters, SchoolSearchFilters, UserSearchFilters, PaginationOptions } from '../services/advancedSearchService';

export class SearchController {
    private searchService: AdvancedSearchService;

    constructor() {
        this.searchService = new AdvancedSearchService();
    }

    /**
     * Search devices with advanced filters
     */
    searchDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters: SearchFilters = {
                query: req.query.query as string,
                category: req.query.category as any,
                status: req.query.status as any,
                condition: req.query.condition as any,
                schoolId: req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined,
                province: req.query.province as string,
                district: req.query.district as string,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
                priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
                priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
                ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
                ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
                isOnline: req.query.isOnline ? req.query.isOnline === 'true' : undefined,
                needsMaintenance: req.query.needsMaintenance ? req.query.needsMaintenance === 'true' : undefined,
                hasWarranty: req.query.hasWarranty ? req.query.hasWarranty === 'true' : undefined,
            };

            const pagination: PaginationOptions = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: req.query.sortBy as string || 'createdAt',
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
            };

            const result = await this.searchService.searchDevices(filters, pagination);
            res.json(result);
        } catch (error) {
            console.error('Error searching devices:', error);
            res.status(500).json({ error: 'Failed to search devices' });
        }
    };

    /**
     * Search schools with advanced filters
     */
    searchSchools = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters: SchoolSearchFilters = {
                query: req.query.query as string,
                type: req.query.type as any,
                status: req.query.status as any,
                province: req.query.province as string,
                district: req.query.district as string,
                hasDevices: req.query.hasDevices ? req.query.hasDevices === 'true' : undefined,
                deviceCountMin: req.query.deviceCountMin ? parseInt(req.query.deviceCountMin as string) : undefined,
                deviceCountMax: req.query.deviceCountMax ? parseInt(req.query.deviceCountMax as string) : undefined,
                hasElectricity: req.query.hasElectricity ? req.query.hasElectricity === 'true' : undefined,
                hasInternet: req.query.hasInternet ? req.query.hasInternet === 'true' : undefined,
            };

            const pagination: PaginationOptions = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: req.query.sortBy as string || 'name',
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
            };

            const result = await this.searchService.searchSchools(filters, pagination);
            res.json(result);
        } catch (error) {
            console.error('Error searching schools:', error);
            res.status(500).json({ error: 'Failed to search schools' });
        }
    };

    /**
     * Search users with advanced filters
     */
    searchUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters: UserSearchFilters = {
                query: req.query.query as string,
                role: req.query.role as any,
                status: req.query.status as any,
                schoolId: req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined,
                isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
                hasSchool: req.query.hasSchool ? req.query.hasSchool === 'true' : undefined,
                lastLoginFrom: req.query.lastLoginFrom ? new Date(req.query.lastLoginFrom as string) : undefined,
                lastLoginTo: req.query.lastLoginTo ? new Date(req.query.lastLoginTo as string) : undefined,
            };

            const pagination: PaginationOptions = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                sortBy: req.query.sortBy as string || 'firstName',
                sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
            };

            const result = await this.searchService.searchUsers(filters, pagination);
            res.json(result);
        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({ error: 'Failed to search users' });
        }
    };

    /**
     * Global search across all entities
     */
    globalSearch = async (req: Request, res: Response): Promise<void> => {
        try {
            const { query, limit = 10 } = req.query;
            
            if (!query) {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            const result = await this.searchService.globalSearch(
                query as string,
                parseInt(limit as string)
            );
            res.json(result);
        } catch (error) {
            console.error('Error in global search:', error);
            res.status(500).json({ error: 'Failed to perform global search' });
        }
    };

    /**
     * Get autocomplete suggestions
     */
    getAutocompleteSuggestions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { query, type, limit = 10 } = req.query;
            
            if (!query) {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            const result = await this.searchService.getAutocompleteSuggestions(
                query as string,
                type as 'device' | 'school' | 'user',
                parseInt(limit as string)
            );
            res.json(result);
        } catch (error) {
            console.error('Error getting autocomplete suggestions:', error);
            res.status(500).json({ error: 'Failed to get autocomplete suggestions' });
        }
    };

    /**
     * Get search filters options
     */
    getSearchFilters = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.searchService.getSearchFilters();
            res.json(result);
        } catch (error) {
            console.error('Error getting search filters:', error);
            res.status(500).json({ error: 'Failed to get search filters' });
        }
    };

    /**
     * Get quick search results
     */
    quickSearch = async (req: Request, res: Response): Promise<void> => {
        try {
            const { query, limit = 5 } = req.query;
            
            if (!query) {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            const result = await this.searchService.quickSearch(
                query as string,
                parseInt(limit as string)
            );
            res.json(result);
        } catch (error) {
            console.error('Error in quick search:', error);
            res.status(500).json({ error: 'Failed to perform quick search' });
        }
    };
}

export default new SearchController();
