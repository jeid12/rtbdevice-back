import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { School } from './School';

export enum DeviceCategory {
    LAPTOP = 'laptop',
    DESKTOP = 'desktop',
    PROJECTOR = 'projector',
    OTHER = 'other',
}

export enum DeviceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    MAINTENANCE = 'maintenance',
    DAMAGED = 'damaged',
    LOST = 'lost',
    DISPOSED = 'disposed',
}

export enum DeviceCondition {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
    BROKEN = 'broken',
}

@Index('IDX_DEVICE_SERIAL', ['serialNumber'], { unique: true })
@Index('IDX_DEVICE_NAME_TAG', ['name_tag'], { unique: true })
@Index('IDX_DEVICE_CATEGORY', ['category'])
@Index('IDX_DEVICE_MODEL', ['model'])
@Index('IDX_DEVICE_PURCHASE_DATE', ['purchaseDate'])
@Index('IDX_DEVICE_STATUS', ['status'])
@Index('IDX_DEVICE_CONDITION', ['condition'])
@Index('IDX_DEVICE_LAST_SEEN', ['lastSeenAt'])
@Index('IDX_DEVICE_SEARCH', ['name_tag', 'serialNumber', 'model'])
@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name_tag!: string;

    @Column({ unique: true })
    serialNumber!: string;

    @Column()
    model!: string;

    @Column()
    brand!: string;

    @Column()
    purchaseCost!: number;

    @Column({
        type: 'enum',
        enum: DeviceCategory,
        default: DeviceCategory.OTHER,
    })
    category!: DeviceCategory;

    @Column({
        type: 'enum',
        enum: DeviceStatus,
        default: DeviceStatus.ACTIVE,
    })
    status!: DeviceStatus;

    @Column({
        type: 'enum',
        enum: DeviceCondition,
        default: DeviceCondition.GOOD,
    })
    condition!: DeviceCondition;

    @Column({ type: 'timestamp', nullable: true })
    lastSeenAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastMaintenanceDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextMaintenanceDate?: Date;

    @Column({ nullable: true })
    warrantyExpiry?: Date;

    @Column({ nullable: true })
    supplier?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ nullable: true })
    assignedToUser?: string;

    @Column({ nullable: true })
    assignedToUserContact?: string;

    @ManyToOne(() => School, (school) => school.devices, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'school_id' })
    school?: School;

    @Column({ type: 'date', nullable: true })
    purchaseDate?: Date;

    @Column({ type: 'jsonb', nullable: true })
    specifications?: {
        storage?: string;
        ram?: string;
        processor?: string;
        graphics?: string;
        screenSize?: string;
        operatingSystem?: string;
        macAddress?: string;
        ipAddress?: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    software?: {
        installedPrograms?: string[];
        licenses?: {
            name: string;
            key: string;
            expiryDate?: Date;
        }[];
    };

    @Column({ type: 'jsonb', nullable: true })
    maintenance?: {
        lastService?: Date;
        nextService?: Date;
        serviceProvider?: string;
        issues?: string[];
        repairs?: {
            date: Date;
            description: string;
            cost: number;
            provider: string;
        }[];
    };

    @Column({ type: 'int', nullable: true })
    age?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Computed properties
    get ageInYears(): number | null {
        if (!this.purchaseDate) return null;
        const now = new Date();
        const purchase = new Date(this.purchaseDate);
        let age = now.getFullYear() - purchase.getFullYear();
        const m = now.getMonth() - purchase.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < purchase.getDate())) {
            age--;
        }
        return age;
    }

    get isWarrantyActive(): boolean {
        if (!this.warrantyExpiry) return false;
        return new Date() < new Date(this.warrantyExpiry);
    }

    get daysSinceLastSeen(): number | null {
        if (!this.lastSeenAt) return null;
        const now = new Date();
        const lastSeen = new Date(this.lastSeenAt);
        const diffTime = Math.abs(now.getTime() - lastSeen.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    get isOnline(): boolean {
        if (!this.lastSeenAt) return false;
        const now = new Date();
        const lastSeen = new Date(this.lastSeenAt);
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
        return diffMinutes <= 30; // Consider online if seen within 30 minutes
    }

    get needsMaintenance(): boolean {
        if (!this.nextMaintenanceDate) return false;
        const now = new Date();
        const nextMaintenance = new Date(this.nextMaintenanceDate);
        return now >= nextMaintenance;
    }

    get maintenanceOverdue(): boolean {
        if (!this.nextMaintenanceDate) return false;
        const now = new Date();
        const nextMaintenance = new Date(this.nextMaintenanceDate);
        const daysPast = (now.getTime() - nextMaintenance.getTime()) / (1000 * 60 * 60 * 24);
        return daysPast > 0;
    }

    get statusDisplay(): string {
        const statusMap = {
            [DeviceStatus.ACTIVE]: 'Active',
            [DeviceStatus.INACTIVE]: 'Inactive',
            [DeviceStatus.MAINTENANCE]: 'Under Maintenance',
            [DeviceStatus.DAMAGED]: 'Damaged',
            [DeviceStatus.LOST]: 'Lost',
            [DeviceStatus.DISPOSED]: 'Disposed',
        };
        return statusMap[this.status];
    }

    get conditionDisplay(): string {
        const conditionMap = {
            [DeviceCondition.EXCELLENT]: 'Excellent',
            [DeviceCondition.GOOD]: 'Good',
            [DeviceCondition.FAIR]: 'Fair',
            [DeviceCondition.POOR]: 'Poor',
            [DeviceCondition.BROKEN]: 'Broken',
        };
        return conditionMap[this.condition];
    }

    get categoryDisplay(): string {
        const categoryMap = {
            [DeviceCategory.LAPTOP]: 'Laptop',
            [DeviceCategory.DESKTOP]: 'Desktop',
            [DeviceCategory.PROJECTOR]: 'Projector',
            [DeviceCategory.OTHER]: 'Other',
        };
        return categoryMap[this.category];
    }

    get depreciationValue(): number {
        const age = this.ageInYears;
        if (!age || age <= 0) return this.purchaseCost;
        
        // Simple depreciation: 20% per year for first 3 years, then 10% per year
        let depreciationRate = 0;
        if (age <= 3) {
            depreciationRate = age * 0.2;
        } else {
            depreciationRate = 0.6 + ((age - 3) * 0.1);
        }
        
        const currentValue = this.purchaseCost * (1 - Math.min(depreciationRate, 0.9));
        return Math.max(currentValue, this.purchaseCost * 0.1); // Minimum 10% of original value
    }

    get totalMaintenanceCost(): number {
        if (!this.maintenance?.repairs) return 0;
        return this.maintenance.repairs.reduce((sum, repair) => sum + repair.cost, 0);
    }
}
