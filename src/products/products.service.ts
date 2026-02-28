import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async findByCategory(category?: string): Promise<Product[]> {
    if (category) {
      return this.productRepo.find({
        where: { category },
        order: { createdAt: 'DESC' },
      });
    }
    return this.findAll();
  }

  async findByGender(gender?: string): Promise<Product[]> {
    if (gender && ['men', 'women', 'kids'].includes(gender)) {
      return this.productRepo.find({
        where: { gender: gender as 'men' | 'women' | 'kids' },
        order: { createdAt: 'DESC' },
      });
    }
    return this.findAll();
  }

  async findByFilters(gender?: string, sale?: boolean): Promise<Product[]> {
    let qb = this.productRepo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC');
    if (gender && ['men', 'women', 'kids'].includes(gender)) {
      qb = qb.andWhere('p.gender = :gender', { gender });
    }
    if (sale) {
      qb = qb.andWhere('p.originalPrice IS NOT NULL').andWhere('p.originalPrice > p.price');
    }
    return qb.getMany();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const id = dto.id || `p${Date.now()}`;
    const product = this.productRepo.create({
      ...dto,
      id,
      originalPrice: dto.originalPrice ?? null,
    });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productRepo.remove(product);
  }
}
