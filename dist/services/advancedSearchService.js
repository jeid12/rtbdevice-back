"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSearchService = void 0;
const Device_1 = require("../entity/Device");
const School_1 = require("../entity/School");
const User_1 = require("../entity/User");
const data_source_1 = require("../data-source");
class AdvancedSearchService {
    constructor() {
        this.deviceRepository = data_source_1.AppDataSource.getRepository(Device_1.Device);
        this.schoolRepository = data_source_1.AppDataSource.getRepository(School_1.School);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    /**
     * Advanced device search with filters, sorting, and pagination
     */
    async searchDevices(filters = {}, pagination = {}) {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
        const queryBuilder = this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school');
        // Apply filters
        this.applyDeviceFilters(queryBuilder, filters);
        // Apply sorting
        this.applyDeviceSorting(queryBuilder, sortBy, sortOrder);
        // Get total count
        const total = await queryBuilder.getCount();
        // Apply pagination
        const items = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return this.buildSearchResult(items, total, page, limit);
    }
    /**
     * Advanced school search with filters, sorting, and pagination
     */
    async searchSchools(filters = {}, pagination = {}) {
        const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = pagination;
        const queryBuilder = this.schoolRepository
            .createQueryBuilder('school')
            .leftJoinAndSelect('school.devices', 'devices')
            .leftJoinAndSelect('school.user', 'user');
        // Apply filters
        this.applySchoolFilters(queryBuilder, filters);
        // Apply sorting
        this.applySchoolSorting(queryBuilder, sortBy, sortOrder);
        // Get total count
        const total = await queryBuilder.getCount();
        // Apply pagination
        const items = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return this.buildSearchResult(items, total, page, limit);
    }
    /**
     * Advanced user search with filters, sorting, and pagination
     */
    async searchUsers(filters = {}, pagination = {}) {
        const { page = 1, limit = 20, sortBy = 'lastName', sortOrder = 'ASC' } = pagination;
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.school', 'school');
        // Apply filters
        this.applyUserFilters(queryBuilder, filters);
        // Apply sorting
        this.applyUserSorting(queryBuilder, sortBy, sortOrder);
        // Get total count
        const total = await queryBuilder.getCount();
        // Apply pagination
        const items = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return this.buildSearchResult(items, total, page, limit);
    }
    /**
     * Global search across all entities
     */
    async globalSearch(query, limit = 10) {
        const [devices, schools, users] = await Promise.all([
            this.searchDevices({ query }, { limit, page: 1 }),
            this.searchSchools({ query }, { limit, page: 1 }),
            this.searchUsers({ query }, { limit, page: 1 })
        ]);
        return {
            devices: devices.items,
            schools: schools.items,
            users: users.items
        };
    }
    /**
     * Get autocomplete suggestions
     */
    async getAutocompleteSuggestions(query, type = 'device', limit = 10) {
        if (!query || query.length < 2)
            return [];
        const queryLower = query.toLowerCase();
        switch (type) {
            case 'device':
                const devices = await this.deviceRepository
                    .createQueryBuilder('device')
                    .select(['device.name_tag', 'device.model', 'device.brand'])
                    .where('LOWER(device.name_tag) LIKE :query OR LOWER(device.model) LIKE :query OR LOWER(device.brand) LIKE :query', { query: `%${queryLower}%` })
                    .limit(limit)
                    .getMany();
                return [...new Set([
                        ...devices.map(d => d.name_tag),
                        ...devices.map(d => d.model),
                        ...devices.map(d => d.brand)
                    ])].filter(suggestion => suggestion.toLowerCase().includes(queryLower)).slice(0, limit);
            case 'school':
                const schools = await this.schoolRepository
                    .createQueryBuilder('school')
                    .select(['school.name', 'school.code', 'school.district'])
                    .where('LOWER(school.name) LIKE :query OR LOWER(school.code) LIKE :query OR LOWER(school.district) LIKE :query', { query: `%${queryLower}%` })
                    .limit(limit)
                    .getMany();
                return [...new Set([
                        ...schools.map(s => s.name),
                        ...schools.map(s => s.code),
                        ...schools.map(s => s.district)
                    ])].filter(suggestion => suggestion.toLowerCase().includes(queryLower)).slice(0, limit);
            case 'user':
                const users = await this.userRepository
                    .createQueryBuilder('user')
                    .select(['user.firstName', 'user.lastName', 'user.email'])
                    .where('LOWER(user.firstName) LIKE :query OR LOWER(user.lastName) LIKE :query OR LOWER(user.email) LIKE :query', { query: `%${queryLower}%` })
                    .limit(limit)
                    .getMany();
                return [...new Set([
                        ...users.map(u => u.firstName),
                        ...users.map(u => u.lastName),
                        ...users.map(u => u.email),
                        ...users.map(u => u.fullName)
                    ])].filter(suggestion => suggestion.toLowerCase().includes(queryLower)).slice(0, limit);
            default:
                return [];
        }
    }
    /**
     * Quick search for dashboard/header search
     */
    async quickSearch(query, limit = 5) {
        const queryLower = query.toLowerCase();
        const [devices, schools, users] = await Promise.all([
            this.deviceRepository
                .createQueryBuilder('device')
                .select(['device.id', 'device.name_tag'])
                .where('LOWER(device.name_tag) LIKE :query OR LOWER(device.serialNumber) LIKE :query', { query: `%${queryLower}%` })
                .limit(limit)
                .getMany(),
            this.schoolRepository
                .createQueryBuilder('school')
                .select(['school.id', 'school.name'])
                .where('LOWER(school.name) LIKE :query OR LOWER(school.code) LIKE :query', { query: `%${queryLower}%` })
                .limit(limit)
                .getMany(),
            this.userRepository
                .createQueryBuilder('user')
                .select(['user.id', 'user.firstName', 'user.lastName'])
                .where('LOWER(user.firstName) LIKE :query OR LOWER(user.lastName) LIKE :query OR LOWER(user.email) LIKE :query', { query: `%${queryLower}%` })
                .limit(limit)
                .getMany()
        ]);
        return {
            devices: devices.map(d => ({ id: d.id, name_tag: d.name_tag, type: 'device' })),
            schools: schools.map(s => ({ id: s.id, name: s.name, type: 'school' })),
            users: users.map(u => ({ id: u.id, fullName: u.fullName, type: 'user' }))
        };
    }
    /**
     * Get available search filter options
     */
    async getSearchFilters() {
        const [deviceBrands, provinces, districts] = await Promise.all([
            this.deviceRepository
                .createQueryBuilder('device')
                .select('DISTINCT device.brand', 'brand')
                .where('device.brand IS NOT NULL')
                .getRawMany(),
            this.schoolRepository
                .createQueryBuilder('school')
                .select('DISTINCT school.province', 'province')
                .where('school.province IS NOT NULL')
                .getRawMany(),
            this.schoolRepository
                .createQueryBuilder('school')
                .select('DISTINCT school.district', 'district')
                .where('school.district IS NOT NULL')
                .getRawMany()
        ]);
        return {
            devices: {
                categories: Object.values(Device_1.DeviceCategory),
                statuses: Object.values(Device_1.DeviceStatus),
                conditions: Object.values(Device_1.DeviceCondition),
                brands: deviceBrands.map(b => b.brand).sort(),
                provinces: provinces.map(p => p.province).sort(),
                districts: districts.map(d => d.district).sort()
            },
            schools: {
                types: Object.values(School_1.SchoolType),
                statuses: Object.values(School_1.SchoolStatus),
                provinces: provinces.map(p => p.province).sort(),
                districts: districts.map(d => d.district).sort()
            },
            users: {
                roles: Object.values(User_1.UserRole),
                statuses: Object.values(User_1.UserStatus)
            }
        };
    }
    applyDeviceFilters(queryBuilder, filters) {
        if (filters.query) {
            queryBuilder.andWhere('(device.name_tag ILIKE :query OR device.serialNumber ILIKE :query OR device.model ILIKE :query OR device.brand ILIKE :query OR school.name ILIKE :query)', { query: `%${filters.query}%` });
        }
        if (filters.category) {
            const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
            queryBuilder.andWhere('device.category IN (:...categories)', { categories });
        }
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            queryBuilder.andWhere('device.status IN (:...statuses)', { statuses });
        }
        if (filters.condition) {
            const conditions = Array.isArray(filters.condition) ? filters.condition : [filters.condition];
            queryBuilder.andWhere('device.condition IN (:...conditions)', { conditions });
        }
        if (filters.schoolId) {
            queryBuilder.andWhere('device.school_id = :schoolId', { schoolId: filters.schoolId });
        }
        if (filters.province) {
            queryBuilder.andWhere('school.province = :province', { province: filters.province });
        }
        if (filters.district) {
            queryBuilder.andWhere('school.district = :district', { district: filters.district });
        }
        if (filters.dateFrom) {
            queryBuilder.andWhere('device.purchaseDate >= :dateFrom', { dateFrom: filters.dateFrom });
        }
        if (filters.dateTo) {
            queryBuilder.andWhere('device.purchaseDate <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.priceMin) {
            queryBuilder.andWhere('device.purchaseCost >= :priceMin', { priceMin: filters.priceMin });
        }
        if (filters.priceMax) {
            queryBuilder.andWhere('device.purchaseCost <= :priceMax', { priceMax: filters.priceMax });
        }
        if (filters.isOnline !== undefined) {
            const thirtyMinutesAgo = new Date();
            thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
            if (filters.isOnline) {
                queryBuilder.andWhere('device.lastSeenAt >= :thirtyMinutesAgo', { thirtyMinutesAgo });
            }
            else {
                queryBuilder.andWhere('(device.lastSeenAt < :thirtyMinutesAgo OR device.lastSeenAt IS NULL)', { thirtyMinutesAgo });
            }
        }
        if (filters.needsMaintenance) {
            const now = new Date();
            queryBuilder.andWhere('device.nextMaintenanceDate <= :now', { now });
        }
        if (filters.hasWarranty) {
            const now = new Date();
            queryBuilder.andWhere('device.warrantyExpiry > :now', { now });
        }
    }
    applySchoolFilters(queryBuilder, filters) {
        if (filters.query) {
            queryBuilder.andWhere('(school.name ILIKE :query OR school.code ILIKE :query OR school.district ILIKE :query OR school.sector ILIKE :query)', { query: `%${filters.query}%` });
        }
        if (filters.type) {
            const types = Array.isArray(filters.type) ? filters.type : [filters.type];
            queryBuilder.andWhere('school.type IN (:...types)', { types });
        }
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            queryBuilder.andWhere('school.status IN (:...statuses)', { statuses });
        }
        if (filters.province) {
            queryBuilder.andWhere('school.province = :province', { province: filters.province });
        }
        if (filters.district) {
            queryBuilder.andWhere('school.district = :district', { district: filters.district });
        }
        if (filters.hasDevices !== undefined) {
            if (filters.hasDevices) {
                queryBuilder.andWhere('devices.id IS NOT NULL');
            }
            else {
                queryBuilder.andWhere('devices.id IS NULL');
            }
        }
        if (filters.hasElectricity !== undefined) {
            queryBuilder.andWhere("school.facilities->>'hasElectricity' = :hasElectricity", { hasElectricity: filters.hasElectricity.toString() });
        }
        if (filters.hasInternet !== undefined) {
            queryBuilder.andWhere("school.facilities->>'hasInternet' = :hasInternet", { hasInternet: filters.hasInternet.toString() });
        }
    }
    applyUserFilters(queryBuilder, filters) {
        if (filters.query) {
            queryBuilder.andWhere('(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query OR user.phone ILIKE :query)', { query: `%${filters.query}%` });
        }
        if (filters.role) {
            const roles = Array.isArray(filters.role) ? filters.role : [filters.role];
            queryBuilder.andWhere('user.role IN (:...roles)', { roles });
        }
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            queryBuilder.andWhere('user.status IN (:...statuses)', { statuses });
        }
        if (filters.schoolId) {
            queryBuilder.andWhere('user.school_id = :schoolId', { schoolId: filters.schoolId });
        }
        if (filters.isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters.hasSchool !== undefined) {
            if (filters.hasSchool) {
                queryBuilder.andWhere('user.school_id IS NOT NULL');
            }
            else {
                queryBuilder.andWhere('user.school_id IS NULL');
            }
        }
        if (filters.lastLoginFrom) {
            queryBuilder.andWhere('user.lastLoginAt >= :lastLoginFrom', { lastLoginFrom: filters.lastLoginFrom });
        }
        if (filters.lastLoginTo) {
            queryBuilder.andWhere('user.lastLoginAt <= :lastLoginTo', { lastLoginTo: filters.lastLoginTo });
        }
    }
    applyDeviceSorting(queryBuilder, sortBy, sortOrder) {
        const validSortFields = ['name_tag', 'serialNumber', 'model', 'purchaseCost', 'category', 'status', 'condition', 'lastSeenAt', 'purchaseDate', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? `device.${sortBy}` : 'device.createdAt';
        queryBuilder.orderBy(sortField, sortOrder);
    }
    applySchoolSorting(queryBuilder, sortBy, sortOrder) {
        const validSortFields = ['name', 'code', 'district', 'province', 'type', 'status', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? `school.${sortBy}` : 'school.name';
        queryBuilder.orderBy(sortField, sortOrder);
    }
    applyUserSorting(queryBuilder, sortBy, sortOrder) {
        const validSortFields = ['firstName', 'lastName', 'email', 'role', 'status', 'lastLoginAt', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? `user.${sortBy}` : 'user.lastName';
        queryBuilder.orderBy(sortField, sortOrder);
    }
    buildSearchResult(items, total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        return {
            items,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }
}
exports.AdvancedSearchService = AdvancedSearchService;
