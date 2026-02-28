import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getDashboardStats() {
    const orders = await this.orderRepo.find({
      relations: ['items'],
      where: {},
    });
    const completed = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
    const avgOrderValue =
      completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

    return {
      totalRevenue,
      totalOrders: completed.length,
      avgOrderValue,
      totalCustomers: new Set(orders.map((o) => o.email)).size,
    };
  }

  async getSalesByMonth(months = 7) {
    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .select("strftime('%Y-%m', o.createdAt)", 'monthKey')
      .addSelect('SUM(o.total)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.status != :cancelled', { cancelled: 'cancelled' })
      .groupBy('monthKey')
      .orderBy('monthKey', 'DESC')
      .limit(months)
      .getRawMany();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return orders
      .map((r) => {
        const [y, m] = (r.monthKey || '').split('-');
        const monthIdx = parseInt(m, 10) - 1;
        return {
          month: monthNames[monthIdx] || r.monthKey,
          revenue: parseInt(r.revenue || '0', 10),
          orders: parseInt(r.orders || '0', 10),
        };
      })
      .reverse();
  }

  async getRevenueByCategory() {
    const orders = await this.orderRepo.find({
      relations: ['items'],
      where: {},
    });
    const productToCategory: Record<string, string> = {};
    const products = await this.productRepo.find();
    products.forEach((p) => {
      productToCategory[p.id] = p.gender;
    });

    const byCategory: Record<string, number> = { men: 0, women: 0, kids: 0 };
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const item of order.items || []) {
        const cat = productToCategory[item.productId] || 'other';
        if (cat in byCategory) {
          byCategory[cat] += item.price * item.quantity;
        }
      }
    }

    const colors: Record<string, string> = {
      Women: 'hsl(348 80% 35%)',
      Men: 'hsl(220 70% 45%)',
      Kids: 'hsl(160 60% 40%)',
    };
    return Object.entries(byCategory).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name.charAt(0).toUpperCase() + name.slice(1)] || 'hsl(0 0% 50%)',
    }));
  }

  async getTopProducts(limit = 5) {
    const orders = await this.orderRepo.find({
      relations: ['items'],
      where: {},
    });
    const productStats: Record<
      string,
      { name: string; sales: number; revenue: number }
    > = {};
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const item of order.items || []) {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            name: item.productName,
            sales: 0,
            revenue: 0,
          };
        }
        productStats[item.productId].sales += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      }
    }
    return Object.entries(productStats)
      .map(([, v]) => v)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getOrderStatusCounts() {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();
    const counts: Record<string, number> = {};
    const statuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    statuses.forEach((s) => (counts[s] = 0));
    result.forEach((r) => (counts[r.status] = parseInt(r.count || '0', 10)));
    return counts;
  }

  async getTrafficData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      visitors: 1000 + Math.floor(Math.random() * 1500),
      pageviews: 3000 + Math.floor(Math.random() * 3500),
    }));
  }
}
