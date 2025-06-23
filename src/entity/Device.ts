import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { School } from './School';

@Index('IDX_DEVICE_SERIAL', ['serialNumber'], { unique: true })
@Index('IDX_DEVICE_CATEGORY', ['category'])
@Index('IDX_DEVICE_MODEL', ['model'])
@Index('IDX_DEVICE_PURCHASE_DATE', ['purchaseDate'])
@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name_tag!: string;

    @Column()
    serialNumber!: string;

    @Column()
    model!: string;

    @Column()
    purchaseCost!: number;

    @Column({
        type: 'enum',
        enum: ['laptop', 'desktop', 'projector', 'other'],
        default: 'other',
    })
    category!: 'laptop' | 'desktop' | 'projector' | 'other';

    @Column({ type: 'timestamp', nullable: true })
    lastSeenAt?: Date;

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
    };

    @Column({ type: 'int', nullable: true })
    age?: number;

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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export enum DeviceCategory {
    LAPTOP = 'laptop',
    DESKTOP = 'desktop',
    PROJECTOR = 'projector',
    OTHER = 'other',
}
