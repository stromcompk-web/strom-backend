import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async findAll(productId?: string): Promise<Review[]> {
    const order = { createdAt: 'DESC' as const };
    if (productId) {
      return this.reviewRepo.find({ where: { productId }, order });
    }
    return this.reviewRepo.find({ order });
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateReviewDto): Promise<Review> {
    if (dto.reviewerId) {
      const existing = await this.reviewRepo.findOne({
        where: { productId: dto.productId, reviewerId: dto.reviewerId },
      });
      if (existing) {
        throw new ConflictException('You have already reviewed this product.');
      }
    }
    const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const review = this.reviewRepo.create({
      id,
      productId: dto.productId,
      author: dto.author,
      rating: dto.rating,
      comment: dto.comment,
      reviewerId: dto.reviewerId ?? '',
    });
    return this.reviewRepo.save(review);
  }

  async delete(id: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review ${id} not found`);
    }
    await this.reviewRepo.remove(review);
  }
}
