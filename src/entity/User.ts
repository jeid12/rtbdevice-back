import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

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

@Index('IDX_USER_EMAIL', ['email'], { unique: true })
@Index('IDX_USER_PHONE', ['phone'])
@Index('IDX_USER_ROLE', ['role'])
@Index('IDX_USER_GENDER', ['gender'])
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

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  otp?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt?: Date;
}
