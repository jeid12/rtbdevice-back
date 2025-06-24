"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const Device_1 = require("../entity/Device");
const School_1 = require("../entity/School");
const data_source_1 = require("../data-source");
class DeviceService {
    constructor() {
        this.deviceRepository = data_source_1.AppDataSource.getRepository(Device_1.Device);
        this.schoolRepository = data_source_1.AppDataSource.getRepository(School_1.School);
    }
    /**
     * Generate category prefix based on device category
     */
    getCategoryPrefix(category) {
        // Convert string to enum if needed
        let enumCategory;
        if (typeof category === 'string') {
            switch (category) {
                case 'laptop':
                    enumCategory = Device_1.DeviceCategory.LAPTOP;
                    break;
                case 'desktop':
                    enumCategory = Device_1.DeviceCategory.DESKTOP;
                    break;
                case 'projector':
                    enumCategory = Device_1.DeviceCategory.PROJECTOR;
                    break;
                case 'other':
                default:
                    enumCategory = Device_1.DeviceCategory.OTHER;
                    break;
            }
        }
        else {
            enumCategory = category;
        }
        const prefixMap = {
            [Device_1.DeviceCategory.LAPTOP]: 'LT',
            [Device_1.DeviceCategory.DESKTOP]: 'DT',
            [Device_1.DeviceCategory.PROJECTOR]: 'PT',
            [Device_1.DeviceCategory.OTHER]: 'OT'
        };
        return prefixMap[enumCategory];
    }
    /**
     * Generate default name tag for unassigned devices
     */
    generateDefaultNameTag(category) {
        const categoryPrefix = this.getCategoryPrefix(category);
        return `RTB/${categoryPrefix}/DEFAULT/001`;
    }
    /**
     * Generate school-based name tag
     */
    async generateSchoolNameTag(schoolId, category) {
        const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
        if (!school) {
            throw new Error('School not found');
        }
        const categoryPrefix = this.getCategoryPrefix(category);
        const districtPrefix = school.district.substring(0, 3).toUpperCase();
        // Find existing devices with similar name tag pattern for this school and category
        const existingDevices = await this.deviceRepository
            .createQueryBuilder('device')
            .where('device.school_id = :schoolId', { schoolId })
            .andWhere('device.name_tag LIKE :pattern', {
            pattern: `RTB/${categoryPrefix}/${districtPrefix}/%`
        })
            .orderBy('device.name_tag', 'DESC')
            .getMany();
        let nextNumber = 1;
        if (existingDevices.length > 0) {
            // Extract the number from the last device name tag
            const lastTag = existingDevices[0].name_tag;
            const numberMatch = lastTag.match(/\/(\d{3})$/);
            if (numberMatch) {
                nextNumber = parseInt(numberMatch[1]) + 1;
            }
        }
        const formattedNumber = nextNumber.toString().padStart(3, '0');
        return `RTB/${categoryPrefix}/${districtPrefix}/${formattedNumber}`;
    }
    /**
     * Create a new device
     */
    async createDevice(deviceData) {
        // Convert string category to enum if needed
        let category;
        if (typeof deviceData.category === 'string') {
            switch (deviceData.category) {
                case 'laptop':
                    category = Device_1.DeviceCategory.LAPTOP;
                    break;
                case 'desktop':
                    category = Device_1.DeviceCategory.DESKTOP;
                    break;
                case 'projector':
                    category = Device_1.DeviceCategory.PROJECTOR;
                    break;
                case 'other':
                default:
                    category = Device_1.DeviceCategory.OTHER;
                    break;
            }
        }
        else {
            category = deviceData.category;
        }
        let nameTag;
        if (deviceData.schoolId) {
            nameTag = await this.generateSchoolNameTag(deviceData.schoolId, category);
        }
        else {
            nameTag = this.generateDefaultNameTag(category);
        }
        // Get school entity if schoolId is provided
        let school = undefined;
        if (deviceData.schoolId) {
            const foundSchool = await this.schoolRepository.findOne({
                where: { id: deviceData.schoolId }
            });
            school = foundSchool || undefined;
        }
        const device = this.deviceRepository.create({
            serialNumber: deviceData.serialNumber,
            model: deviceData.model,
            brand: deviceData.brand || 'Unknown',
            purchaseCost: deviceData.purchaseCost,
            category: category,
            name_tag: nameTag,
            school: school,
            purchaseDate: deviceData.purchaseDate,
            specifications: deviceData.specifications
        });
        return await this.deviceRepository.save(device);
    }
    /**
     * Get all devices with pagination
     */
    async getAllDevices(page = 1, limit = 10, schoolId) {
        const queryBuilder = this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school');
        if (schoolId) {
            queryBuilder.where('device.school_id = :schoolId', { schoolId });
        }
        const total = await queryBuilder.getCount();
        const devices = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('device.createdAt', 'DESC')
            .getMany();
        return {
            devices,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    /**
     * Get device by ID
     */
    async getDeviceById(id) {
        return await this.deviceRepository.findOne({
            where: { id },
            relations: ['school']
        });
    }
    /**
     * Update device
     */
    async updateDevice(id, updateData) {
        const device = await this.getDeviceById(id);
        if (!device) {
            return null;
        }
        // Check if school assignment has changed
        if (updateData.schoolId !== undefined) {
            const currentSchoolId = device.school?.id;
            if (updateData.schoolId !== currentSchoolId) {
                // School assignment changed, regenerate name tag
                if (updateData.schoolId) {
                    updateData.name_tag = await this.generateSchoolNameTag(updateData.schoolId, updateData.category || device.category);
                }
                else {
                    updateData.name_tag = this.generateDefaultNameTag(updateData.category || device.category);
                }
            }
        }
        // Check if category changed but school remained same
        if (updateData.category && updateData.category !== device.category && updateData.schoolId === undefined) {
            if (device.school) {
                updateData.name_tag = await this.generateSchoolNameTag(device.school.id, updateData.category);
            }
            else {
                updateData.name_tag = this.generateDefaultNameTag(updateData.category);
            }
        }
        const updatePayload = { ...updateData };
        if (updateData.schoolId !== undefined) {
            updatePayload.school = updateData.schoolId ? { id: updateData.schoolId } : null;
            delete updatePayload.schoolId;
        }
        await this.deviceRepository.update(id, updatePayload);
        return await this.getDeviceById(id);
    }
    /**
     * Delete device
     */
    async deleteDevice(id) {
        const result = await this.deviceRepository.delete(id);
        return result.affected !== 0;
    }
    /**
     * Assign device to school
     */
    async assignDeviceToSchool(deviceId, schoolId) {
        const device = await this.getDeviceById(deviceId);
        if (!device) {
            return null;
        }
        const newNameTag = await this.generateSchoolNameTag(schoolId, device.category);
        await this.deviceRepository.update(deviceId, {
            school: { id: schoolId },
            name_tag: newNameTag
        });
        return await this.getDeviceById(deviceId);
    }
    /**
     * Unassign device from school
     */
    async unassignDeviceFromSchool(deviceId) {
        const device = await this.getDeviceById(deviceId);
        if (!device) {
            return null;
        }
        const defaultNameTag = this.generateDefaultNameTag(device.category);
        await this.deviceRepository.update(deviceId, {
            school: undefined,
            name_tag: defaultNameTag
        });
        return await this.getDeviceById(deviceId);
    }
    /**
     * Bulk assign devices to school
     */
    async bulkAssignDevicesToSchool(deviceIds, schoolId) {
        const devices = await this.deviceRepository.findByIds(deviceIds);
        const updatedDevices = [];
        for (const device of devices) {
            const newNameTag = await this.generateSchoolNameTag(schoolId, device.category);
            await this.deviceRepository.update(device.id, {
                school: { id: schoolId },
                name_tag: newNameTag
            });
            const updatedDevice = await this.getDeviceById(device.id);
            if (updatedDevice) {
                updatedDevices.push(updatedDevice);
            }
        }
        return updatedDevices;
    }
    /**
     * Bulk create devices
     */
    async bulkCreateDevices(devicesData) {
        const createdDevices = [];
        for (const deviceData of devicesData) {
            const device = await this.createDevice(deviceData);
            createdDevices.push(device);
        }
        return createdDevices;
    }
    /**
     * Get devices by school
     */
    async getDevicesBySchool(schoolId) {
        return await this.deviceRepository.find({
            where: { school: { id: schoolId } },
            relations: ['school'],
            order: { name_tag: 'ASC' }
        });
    }
    /**
     * Search devices
     */
    async searchDevices(searchTerm, schoolId) {
        const queryBuilder = this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where('device.name_tag ILIKE :search OR device.serialNumber ILIKE :search OR device.model ILIKE :search', { search: `%${searchTerm}%` });
        if (schoolId) {
            queryBuilder.andWhere('device.school_id = :schoolId', { schoolId });
        }
        return await queryBuilder
            .orderBy('device.name_tag', 'ASC')
            .getMany();
    }
    /**
     * Update device last seen timestamp
     */
    async updateLastSeen(deviceId) {
        await this.deviceRepository.update(deviceId, {
            lastSeenAt: new Date()
        });
    }
    /**
     * Get device statistics
     */
    async getDeviceStatistics(schoolId) {
        const queryBuilder = this.deviceRepository.createQueryBuilder('device');
        if (schoolId) {
            queryBuilder.where('device.school_id = :schoolId', { schoolId });
        }
        const devices = await queryBuilder.getMany();
        const total = devices.length;
        const byCategory = devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + 1;
            return acc;
        }, {});
        const assigned = devices.filter(d => d.school).length;
        const unassigned = total - assigned;
        const devicesWithAge = devices.filter(d => d.ageInYears !== null);
        const avgAge = devicesWithAge.length > 0
            ? devicesWithAge.reduce((sum, d) => sum + (d.ageInYears || 0), 0) / devicesWithAge.length
            : null;
        return {
            total,
            byCategory,
            assigned,
            unassigned,
            avgAge
        };
    }
}
exports.DeviceService = DeviceService;
