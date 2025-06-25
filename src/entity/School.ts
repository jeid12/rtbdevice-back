import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Device } from './Device';
import { Application } from './Application';

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

    @Column({ type: 'int', nullable: true })
    studentCount?: number;

    @Column({ type: 'int', nullable: true })
    teacherCount?: number;

    @OneToOne(() => User, (user) => user.assignedSchool, { 
        onDelete: 'SET NULL',
        eager: true 
    })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @OneToMany(() => Device, (device) => device.school)
    devices!: Device[];

    @OneToMany(() => Application, (application) => application.school)
    applications!: Application[];



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

    get districtCode(): string {
        return this.district.substring(0, 3).toUpperCase();
    }

    get applicationCount(): number {
        return this.applications?.length || 0;
    }

    get pendingApplicationCount(): number {
        return this.applications?.filter(app => app.isPending).length || 0;
    }

    get completedApplicationCount(): number {
        return this.applications?.filter(app => app.isCompleted).length || 0;
    }

    get hasActiveApplications(): boolean {
        return this.applications?.some(app => 
            app.status === 'pending' || 
            app.status === 'under_review' || 
            app.status === 'approved' || 
            app.status === 'in_progress'
        ) || false;
    }
}