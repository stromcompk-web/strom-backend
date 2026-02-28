import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  city: string;

  @Column('integer')
  total: number;

  @Column({ default: 'pending' })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
