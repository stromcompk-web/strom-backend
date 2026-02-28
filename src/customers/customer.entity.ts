import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  city: string;

  @Column('integer', { default: 0 })
  ordersCount: number;

  @Column('integer', { default: 0 })
  totalSpent: number;

  @Column({ default: '-' })
  lastOrder: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
