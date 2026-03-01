import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query('productId') productId?: string) {
    return this.reviewsService.findAll(productId);
  }

  @Post()
  async create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.reviewsService.delete(id);
    return { ok: true };
  }
}
