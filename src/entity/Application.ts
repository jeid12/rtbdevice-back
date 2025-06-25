import 'reflect-metadata';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    Index,
    OneToMany
} from 'typeorm';
import { School } from './School';
import { Device } from './Device';

export enum ApplicationType {
    NEW_DEVICE_REQUEST = 'new_device_request',
    MAINTENANCE_REQUEST = 'maintenance_request',
}

export enum ApplicationStatus {
    PENDING = 'pending',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum ApplicationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity()
export class ApplicationDeviceIssue {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Application, (application) => application.deviceIssues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'application_id' })
    application!: Application;

    @ManyToOne(() => Device, { eager: true })
    @JoinColumn({ name: 'device_id' })
    device!: Device;

    @Column({ type: 'text' })
    problemDescription!: string;

    @Column({ type: 'text', nullable: true })
    actionTaken?: string;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

@Index('IDX_APPLICATION_TYPE', ['type'])
@Index('IDX_APPLICATION_STATUS', ['status'])
@Index('IDX_APPLICATION_PRIORITY', ['priority'])
@Index('IDX_APPLICATION_SCHOOL', ['school'])
@Index('IDX_APPLICATION_CREATED', ['createdAt'])
@Index('IDX_APPLICATION_ASSIGNED', ['assignedTo'])
@Entity()
export class Application {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'enum',
        enum: ApplicationType,
    })
    type!: ApplicationType;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    })
    status!: ApplicationStatus;

    @Column({
        type: 'enum',
        enum: ApplicationPriority,
        default: ApplicationPriority.MEDIUM,
    })
    priority!: ApplicationPriority;

    @ManyToOne(() => School, { eager: true })
    @JoinColumn({ name: 'school_id' })
    school!: School;

    // For new device requests
    @Column({ type: 'int', nullable: true })
    requestedDeviceCount?: number;

    @Column({ nullable: true })
    requestedDeviceType?: string;

    @Column({ type: 'text', nullable: true })
    justification?: string;

    @Column({ nullable: true })
    applicationLetterPath?: string; // Path to uploaded PDF

    // For maintenance requests
    @OneToMany(() => ApplicationDeviceIssue, (issue) => issue.application, { 
        cascade: true, 
        eager: true 
    })
    deviceIssues!: ApplicationDeviceIssue[];

    // Assignment and tracking
    @Column({ nullable: true })
    assignedTo?: string; // User ID or name of assigned technician/admin

    @Column({ type: 'timestamp', nullable: true })
    assignedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    estimatedCompletionDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date;

    @Column({ type: 'text', nullable: true })
    adminNotes?: string;

    @Column({ type: 'text', nullable: true })
    rejectionReason?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    estimatedCost?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    actualCost?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Computed properties
    get isNewDeviceRequest(): boolean {
        return this.type === ApplicationType.NEW_DEVICE_REQUEST;
    }

    get isMaintenanceRequest(): boolean {
        return this.type === ApplicationType.MAINTENANCE_REQUEST;
    }

    get isPending(): boolean {
        return this.status === ApplicationStatus.PENDING;
    }

    get isApproved(): boolean {
        return this.status === ApplicationStatus.APPROVED;
    }

    get isCompleted(): boolean {
        return this.status === ApplicationStatus.COMPLETED;
    }

    get isRejected(): boolean {
        return this.status === ApplicationStatus.REJECTED;
    }

    get daysSinceCreated(): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    get isOverdue(): boolean {
        if (!this.estimatedCompletionDate || this.isCompleted) return false;
        return new Date() > this.estimatedCompletionDate;
    }

    get affectedDeviceCount(): number {
        return this.deviceIssues?.length || 0;
    }

    get resolvedIssueCount(): number {
        return this.deviceIssues?.filter(issue => issue.resolvedAt).length || 0;
    }

    get hasApplicationLetter(): boolean {
        return !!this.applicationLetterPath;
    }

    get statusDisplayName(): string {
        switch (this.status) {
            case ApplicationStatus.PENDING:
                return 'Pending Review';
            case ApplicationStatus.UNDER_REVIEW:
                return 'Under Review';
            case ApplicationStatus.APPROVED:
                return 'Approved';
            case ApplicationStatus.REJECTED:
                return 'Rejected';
            case ApplicationStatus.IN_PROGRESS:
                return 'In Progress';
            case ApplicationStatus.COMPLETED:
                return 'Completed';
            case ApplicationStatus.CANCELLED:
                return 'Cancelled';
            default:
                return this.status;
        }
    }

    get priorityDisplayName(): string {
        switch (this.priority) {
            case ApplicationPriority.LOW:
                return 'Low Priority';
            case ApplicationPriority.MEDIUM:
                return 'Medium Priority';
            case ApplicationPriority.HIGH:
                return 'High Priority';
            case ApplicationPriority.URGENT:
                return 'Urgent';
            default:
                return this.priority;
        }
    }
}
