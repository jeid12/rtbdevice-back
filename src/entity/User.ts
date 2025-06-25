import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './School';

export enum UserRole {
  ADMIN = 'admin',
  RTB_STAFF = 'rtb-staff',
  SCHOOL = 'school',
  TECHNICIAN = 'technician',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Index('IDX_USER_EMAIL', ['email'], { unique: true })
@Index('IDX_USER_PHONE', ['phone'])
@Index('IDX_USER_ROLE', ['role'])
@Index('IDX_USER_GENDER', ['gender'])
@Index('IDX_USER_STATUS', ['status'])
@Index('IDX_USER_LAST_LOGIN', ['lastLoginAt'])
@Index('IDX_USER_SEARCH', ['firstName', 'lastName', 'email'])
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  phone!: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.MALE,
  })
  gender!: Gender;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SCHOOL,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt?: Date;

  @Column({ default: 0 })
  loginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
    emailAlerts?: boolean;
  };

  @Column({ type: 'text', nullable: true })
  profilePicture?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  nationalId?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

 

  // For the main school user (one-to-one relationship)
  @OneToOne(() => School, (school) => school.user, { nullable: true })
  assignedSchool?: School;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  otp?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt?: Date;

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLocked(): boolean {
    return this.lockedUntil ? new Date() < this.lockedUntil : false;
  }

  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get canManageDevices(): boolean {
    return [UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL].includes(this.role);
  }

  get isSchoolUser(): boolean {
    return this.role === UserRole.SCHOOL;
  }

  get canBeAssignedToSchool(): boolean {
    return this.role === UserRole.SCHOOL;
  }

  get displayRole(): string {
    const roleMap = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.RTB_STAFF]: 'RTB Staff',
      [UserRole.SCHOOL]: 'School User',
      [UserRole.TECHNICIAN]: 'Technician',
    };
    return roleMap[this.role];
  }
}
