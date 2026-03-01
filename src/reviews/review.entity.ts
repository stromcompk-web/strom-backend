import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryColumn()
  id: string;

  @Column()
  productId: string;

  @Column()
  author: string;

  @Column('integer')
  rating: number;

  @Column('text')
  comment: string;

  /** Anonymous reviewer identifier (one review per reviewer per product) */
  @Column({ default: '' })
  reviewerId: string;

  @CreateDateColumn()
  createdAt: Date;
}
