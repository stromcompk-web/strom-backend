import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProductGender = 'men' | 'women' | 'kids';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('integer')
  price: number;

  @Column('integer', { nullable: true })
  originalPrice: number | null;

  @Column()
  image: string;

  @Column()
  category: string;

  @Column()
  gender: ProductGender;

  @Column('text')
  description: string;

  @Column('simple-json')
  sizes: string[];

  @Column('simple-json')
  colors: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
