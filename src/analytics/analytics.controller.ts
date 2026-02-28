import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async dashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('sales-by-month')
  async salesByMonth(@Query('months') months?: string) {
    return this.analyticsService.getSalesByMonth(
      months ? parseInt(months, 10) : 7,
    );
  }

  @Get('revenue-by-category')
  async revenueByCategory() {
    return this.analyticsService.getRevenueByCategory();
  }

  @Get('top-products')
  async topProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopProducts(
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Get('order-status-counts')
  async orderStatusCounts() {
    return this.analyticsService.getOrderStatusCounts();
  }

  @Get('traffic')
  async traffic() {
    return this.analyticsService.getTrafficData();
  }
}
