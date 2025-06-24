"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const advancedSearchService_1 = require("../services/advancedSearchService");
class SearchController {
    constructor() {
        /**
         * Search devices with advanced filters
         */
        this.searchDevices = async (req, res) => {
            try {
                const filters = {
                    query: req.query.query,
                    category: req.query.category,
                    status: req.query.status,
                    condition: req.query.condition,
                    schoolId: req.query.schoolId ? parseInt(req.query.schoolId) : undefined,
                    province: req.query.province,
                    district: req.query.district,
                    dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
                    dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
                    priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : undefined,
                    priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : undefined,
                    ageMin: req.query.ageMin ? parseInt(req.query.ageMin) : undefined,
                    ageMax: req.query.ageMax ? parseInt(req.query.ageMax) : undefined,
                    isOnline: req.query.isOnline ? req.query.isOnline === 'true' : undefined,
                    needsMaintenance: req.query.needsMaintenance ? req.query.needsMaintenance === 'true' : undefined,
                    hasWarranty: req.query.hasWarranty ? req.query.hasWarranty === 'true' : undefined,
                };
                const pagination = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 20,
                    sortBy: req.query.sortBy || 'createdAt',
                    sortOrder: req.query.sortOrder || 'DESC',
                };
                const result = await this.searchService.searchDevices(filters, pagination);
                res.json(result);
            }
            catch (error) {
                console.error('Error searching devices:', error);
                res.status(500).json({ error: 'Failed to search devices' });
            }
        };
        /**
         * Search schools with advanced filters
         */
        this.searchSchools = async (req, res) => {
            try {
                const filters = {
                    query: req.query.query,
                    type: req.query.type,
                    status: req.query.status,
                    province: req.query.province,
                    district: req.query.district,
                    hasDevices: req.query.hasDevices ? req.query.hasDevices === 'true' : undefined,
                    deviceCountMin: req.query.deviceCountMin ? parseInt(req.query.deviceCountMin) : undefined,
                    deviceCountMax: req.query.deviceCountMax ? parseInt(req.query.deviceCountMax) : undefined,
                    hasElectricity: req.query.hasElectricity ? req.query.hasElectricity === 'true' : undefined,
                    hasInternet: req.query.hasInternet ? req.query.hasInternet === 'true' : undefined,
                };
                const pagination = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 20,
                    sortBy: req.query.sortBy || 'name',
                    sortOrder: req.query.sortOrder || 'ASC',
                };
                const result = await this.searchService.searchSchools(filters, pagination);
                res.json(result);
            }
            catch (error) {
                console.error('Error searching schools:', error);
                res.status(500).json({ error: 'Failed to search schools' });
            }
        };
        /**
         * Search users with advanced filters
         */
        this.searchUsers = async (req, res) => {
            try {
                const filters = {
                    query: req.query.query,
                    role: req.query.role,
                    status: req.query.status,
                    schoolId: req.query.schoolId ? parseInt(req.query.schoolId) : undefined,
                    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
                    hasSchool: req.query.hasSchool ? req.query.hasSchool === 'true' : undefined,
                    lastLoginFrom: req.query.lastLoginFrom ? new Date(req.query.lastLoginFrom) : undefined,
                    lastLoginTo: req.query.lastLoginTo ? new Date(req.query.lastLoginTo) : undefined,
                };
                const pagination = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 20,
                    sortBy: req.query.sortBy || 'firstName',
                    sortOrder: req.query.sortOrder || 'ASC',
                };
                const result = await this.searchService.searchUsers(filters, pagination);
                res.json(result);
            }
            catch (error) {
                console.error('Error searching users:', error);
                res.status(500).json({ error: 'Failed to search users' });
            }
        };
        /**
         * Global search across all entities
         */
        this.globalSearch = async (req, res) => {
            try {
                const { query, limit = 10 } = req.query;
                if (!query) {
                    res.status(400).json({ error: 'Search query is required' });
                    return;
                }
                const result = await this.searchService.globalSearch(query, parseInt(limit));
                res.json(result);
            }
            catch (error) {
                console.error('Error in global search:', error);
                res.status(500).json({ error: 'Failed to perform global search' });
            }
        };
        /**
         * Get autocomplete suggestions
         */
        this.getAutocompleteSuggestions = async (req, res) => {
            try {
                const { query, type, limit = 10 } = req.query;
                if (!query) {
                    res.status(400).json({ error: 'Search query is required' });
                    return;
                }
                const result = await this.searchService.getAutocompleteSuggestions(query, type, parseInt(limit));
                res.json(result);
            }
            catch (error) {
                console.error('Error getting autocomplete suggestions:', error);
                res.status(500).json({ error: 'Failed to get autocomplete suggestions' });
            }
        };
        /**
         * Get search filters options
         */
        this.getSearchFilters = async (req, res) => {
            try {
                const result = await this.searchService.getSearchFilters();
                res.json(result);
            }
            catch (error) {
                console.error('Error getting search filters:', error);
                res.status(500).json({ error: 'Failed to get search filters' });
            }
        };
        /**
         * Get quick search results
         */
        this.quickSearch = async (req, res) => {
            try {
                const { query, limit = 5 } = req.query;
                if (!query) {
                    res.status(400).json({ error: 'Search query is required' });
                    return;
                }
                const result = await this.searchService.quickSearch(query, parseInt(limit));
                res.json(result);
            }
            catch (error) {
                console.error('Error in quick search:', error);
                res.status(500).json({ error: 'Failed to perform quick search' });
            }
        };
        this.searchService = new advancedSearchService_1.AdvancedSearchService();
    }
}
exports.SearchController = SearchController;
exports.default = new SearchController();
