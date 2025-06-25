import { Repository } from 'typeorm';
import { Device, DeviceCategory } from '../entity/Device';
import { School } from '../entity/School';
import { AppDataSource } from '../data-source';
import { PaginationOptions, PaginatedResponse, validatePaginationOptions, createPaginatedResponse } from '../interfaces/pagination';

export class DeviceService {
    private deviceRepository: Repository<Device>;
    private schoolRepository: Repository<School>;

    constructor() {
        this.deviceRepository = AppDataSource.getRepository(Device);
        this.schoolRepository = AppDataSource.getRepository(School);
    }

    /**
     * Generate category prefix based on device category
     */
    private getCategoryPrefix(category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other'): string {
        // Convert string to enum if needed
        let enumCategory: DeviceCategory;
        if (typeof category === 'string') {
            switch (category) {
                case 'laptop':
                    enumCategory = DeviceCategory.LAPTOP;
                    break;
                case 'desktop':
                    enumCategory = DeviceCategory.DESKTOP;
                    break;
                case 'projector':
                    enumCategory = DeviceCategory.PROJECTOR;
                    break;
                case 'other':
                default:
                    enumCategory = DeviceCategory.OTHER;
                    break;
            }
        } else {
            enumCategory = category;
        }

        const prefixMap = {
            [DeviceCategory.LAPTOP]: 'LT',
            [DeviceCategory.DESKTOP]: 'DT',
            [DeviceCategory.PROJECTOR]: 'PT',
            [DeviceCategory.OTHER]: 'OT'
        };
        return prefixMap[enumCategory];
    }

    /**
     * Generate default name tag for unassigned devices
     */
    private generateDefaultNameTag(category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other'): string {
        const categoryPrefix = this.getCategoryPrefix(category);
        return `RTB/${categoryPrefix}/DEFAULT/001`;
    }

    /**
     * Generate school-based name tag
     */
    private async generateSchoolNameTag(schoolId: number, category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other'): Promise<string> {
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
    async createDevice(deviceData: {
        serialNumber: string;
        model: string;
        brand?: string;
        purchaseCost: number;
        category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other';
        schoolId?: number;
        purchaseDate?: Date;
        specifications?: {
            storage?: string;
            ram?: string;
            processor?: string;
        };
    }): Promise<Device> {
        // Convert string category to enum if needed
        let category: DeviceCategory;
        if (typeof deviceData.category === 'string') {
            switch (deviceData.category) {
                case 'laptop':
                    category = DeviceCategory.LAPTOP;
                    break;
                case 'desktop':
                    category = DeviceCategory.DESKTOP;
                    break;
                case 'projector':
                    category = DeviceCategory.PROJECTOR;
                    break;
                case 'other':
                default:
                    category = DeviceCategory.OTHER;
                    break;
            }
        } else {
            category = deviceData.category;
        }

        let nameTag: string;
        if (deviceData.schoolId) {
            nameTag = await this.generateSchoolNameTag(deviceData.schoolId, category);
        } else {
            nameTag = this.generateDefaultNameTag(category);
        }

        // Get school entity if schoolId is provided
        let school: School | undefined = undefined;
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
    async getAllDevices(paginationOptions?: PaginationOptions, schoolId?: number): Promise<PaginatedResponse<Device>> {
        const validatedPagination = validatePaginationOptions(paginationOptions || {});
        const { page, limit, sortBy, sortOrder } = validatedPagination;

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
            .orderBy(`device.${sortBy}`, sortOrder)
            .getMany();

        return createPaginatedResponse(devices, total, page, limit);
    }

    /**
     * Get device by ID
     */
    async getDeviceById(id: number): Promise<Device | null> {
        return await this.deviceRepository.findOne({
            where: { id },
            relations: ['school']
        });
    }

    /**
     * Update device
     */
    async updateDevice(id: number, updateData: Partial<{
        serialNumber: string;
        model: string;
        brand: string;
        purchaseCost: number;
        category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other';
        schoolId?: number;
        purchaseDate?: Date;
        specifications?: {
            storage?: string;
            ram?: string;
            processor?: string;
        };
        lastSeenAt?: Date;
        name_tag?: string;
    }>): Promise<Device | null> {
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
                    updateData.name_tag = await this.generateSchoolNameTag(
                        updateData.schoolId, 
                        updateData.category || device.category
                    );
                } else {
                    updateData.name_tag = this.generateDefaultNameTag(
                        updateData.category || device.category
                    );
                }
            }
        }

        // Check if category changed but school remained same
        if (updateData.category && updateData.category !== device.category && updateData.schoolId === undefined) {
            if (device.school) {
                updateData.name_tag = await this.generateSchoolNameTag(
                    device.school.id,
                    updateData.category
                );
            } else {
                updateData.name_tag = this.generateDefaultNameTag(updateData.category);
            }
        }

        const updatePayload: any = { ...updateData };
        if (updateData.schoolId !== undefined) {
            updatePayload.school = updateData.schoolId ? { id: updateData.schoolId } as School : null;
            delete updatePayload.schoolId;
        }

        await this.deviceRepository.update(id, updatePayload);

        return await this.getDeviceById(id);
    }

    /**
     * Delete device
     */
    async deleteDevice(id: number): Promise<boolean> {
        const result = await this.deviceRepository.delete(id);
        return result.affected !== 0;
    }

    /**
     * Assign device to school
     */
    async assignDeviceToSchool(deviceId: number, schoolId: number): Promise<Device | null> {
        const device = await this.getDeviceById(deviceId);
        if (!device) {
            return null;
        }

        const newNameTag = await this.generateSchoolNameTag(schoolId, device.category);
        
        await this.deviceRepository.update(deviceId, {
            school: { id: schoolId } as School,
            name_tag: newNameTag
        });

        return await this.getDeviceById(deviceId);
    }

    /**
     * Unassign device from school
     */
    async unassignDeviceFromSchool(deviceId: number): Promise<Device | null> {
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
    async bulkAssignDevicesToSchool(deviceIds: number[], schoolId: number): Promise<Device[]> {
        const devices = await this.deviceRepository.findByIds(deviceIds);
        const updatedDevices: Device[] = [];

        for (const device of devices) {
            const newNameTag = await this.generateSchoolNameTag(schoolId, device.category);
            
            await this.deviceRepository.update(device.id, {
                school: { id: schoolId } as School,
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
    async bulkCreateDevices(devicesData: Array<{
        serialNumber: string;
        model: string;
        brand?: string;
        purchaseCost: number;
        category: DeviceCategory | 'laptop' | 'desktop' | 'projector' | 'other';
        schoolId?: number;
        purchaseDate?: Date;
        specifications?: {
            storage?: string;
            ram?: string;
            processor?: string;
        };
    }>): Promise<Device[]> {
        const createdDevices: Device[] = [];

        for (const deviceData of devicesData) {
            const device = await this.createDevice(deviceData);
            createdDevices.push(device);
        }

        return createdDevices;
    }

    /**
     * Get devices by school
     */
    async getDevicesBySchool(schoolId: number): Promise<Device[]> {
        return await this.deviceRepository.find({
            where: { school: { id: schoolId } },
            relations: ['school'],
            order: { name_tag: 'ASC' }
        });
    }

    /**
     * Search devices
     */
    async searchDevices(searchTerm: string, schoolId?: number): Promise<Device[]> {
        const queryBuilder = this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.school', 'school')
            .where(
                'device.name_tag ILIKE :search OR device.serialNumber ILIKE :search OR device.model ILIKE :search',
                { search: `%${searchTerm}%` }
            );

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
    async updateLastSeen(deviceId: number): Promise<void> {
        await this.deviceRepository.update(deviceId, {
            lastSeenAt: new Date()
        });
    }

    /**
     * Get device statistics
     */
    async getDeviceStatistics(schoolId?: number): Promise<{
        total: number;
        byCategory: Record<string, number>;
        assigned: number;
        unassigned: number;
        avgAge: number | null;
    }> {
        const queryBuilder = this.deviceRepository.createQueryBuilder('device');
        
        if (schoolId) {
            queryBuilder.where('device.school_id = :schoolId', { schoolId });
        }

        const devices = await queryBuilder.getMany();
        
        const total = devices.length;
        const byCategory = devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
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
