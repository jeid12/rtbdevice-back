import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Index('IDX_SCHOOL_NAME', ['name'])
@Index('IDX_SCHOOL_PROVINCE', ['province'])
@Index('IDX_SCHOOL_DISTRICT', ['district'])
@Index('IDX_SCHOOL_SECTOR', ['sector'])
@Entity()
export class School {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    code!: string;

    @Column()
    province!: string;

    @Column()
    district!: string;

    @Column()
    sector!: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}