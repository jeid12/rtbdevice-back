import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Device } from './Device';

export enum SchoolType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TVET = 'tvet',
  UNIVERSITY = 'university',
  OTHER = 'other',
}

export enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Index('IDX_SCHOOL_NAME', ['name'])
@Index('IDX_SCHOOL_CODE', ['code'], { unique: true })
@Index('IDX_SCHOOL_PROVINCE', ['province'])
@Index('IDX_SCHOOL_DISTRICT', ['district'])
@Index('IDX_SCHOOL_SECTOR', ['sector'])
@Index('IDX_SCHOOL_TYPE', ['type'])
@Index('IDX_SCHOOL_STATUS', ['status'])
@Index('IDX_SCHOOL_SEARCH', ['name', 'code', 'district'])
@Entity()
export class School {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    code!: string;

    @Column()
    province!: string;

    @Column()
    district!: string;

    @Column()
    sector!: string;

    @Column({ nullable: true })
    cell?: string;

    @Column({ nullable: true })
    village?: string;

    @Column({
        type: 'enum',
        enum: SchoolType,
        default: SchoolType.PRIMARY,
    })
    type!: SchoolType;

    @Column({
        type: 'enum',
        enum: SchoolStatus,
        default: SchoolStatus.PENDING,
    })
    status!: SchoolStatus;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ type: 'int', nullable: true })
    studentCount?: number;

    @Column({ type: 'int', nullable: true })
    teacherCount?: number;

    @Column({ type: 'date', nullable: true })
    establishedDate?: Date;

    @Column({ type: 'jsonb', nullable: true })
    coordinates?: {
        latitude: number;
        longitude: number;
    };

    @Column({ type: 'jsonb', nullable: true })
    facilities?: {
        hasElectricity?: boolean;
        hasInternet?: boolean;
        hasLibrary?: boolean;
        hasLaboratory?: boolean;
        computerLabCount?: number;
    };

    @Column({ type: 'jsonb', nullable: true })
    contact?: {
        headmasterName?: string;
        headmasterPhone?: string;
        headmasterEmail?: string;
        itManagerName?: string;
        itManagerPhone?: string;
        itManagerEmail?: string;
    };

    @Column({ type: 'timestamp', nullable: true })
    lastInspectionDate?: Date;

    @Column({ type: 'text', nullable: true })
    inspectionNotes?: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Device, (device) => device.school)
    devices!: Device[];

    @OneToMany(() => User, (user) => user.school)
    schoolUsers!: User[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Computed properties
    get fullAddress(): string {
        const parts = [this.village, this.cell, this.sector, this.district, this.province]
            .filter(Boolean);
        return parts.join(', ');
    }

    get deviceCount(): number {
        return this.devices?.length || 0;
    }

    get activeDeviceCount(): number {
        if (!this.devices) return 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return this.devices.filter(device => 
            device.lastSeenAt && device.lastSeenAt > thirtyDaysAgo
        ).length;
    }

    get devicesByCategory(): Record<string, number> {
        if (!this.devices) return {};
        return this.devices.reduce((acc, device) => {
            acc[device.category] = (acc[device.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    get averageDeviceAge(): number | null {
        if (!this.devices || this.devices.length === 0) return null;
        const devicesWithAge = this.devices.filter(d => d.ageInYears !== null);
        if (devicesWithAge.length === 0) return null;
        const totalAge = devicesWithAge.reduce((sum, d) => sum + (d.ageInYears || 0), 0);
        return Math.round((totalAge / devicesWithAge.length) * 100) / 100;
    }

    get totalDeviceValue(): number {
        if (!this.devices) return 0;
        return this.devices.reduce((sum, device) => sum + device.purchaseCost, 0);
    }

    get isActive(): boolean {
        return this.status === SchoolStatus.ACTIVE;
    }

    get schoolTypeDisplay(): string {
        const typeMap = {
            [SchoolType.PRIMARY]: 'Primary School',
            [SchoolType.SECONDARY]: 'Secondary School',
            [SchoolType.TVET]: 'TVET Institution',
            [SchoolType.UNIVERSITY]: 'University',
            [SchoolType.OTHER]: 'Other',
        };
        return typeMap[this.type];
    }

    get districtCode(): string {
        return this.district.substring(0, 3).toUpperCase();
    }
}