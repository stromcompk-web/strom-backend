import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order.entity';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private customersService: CustomersService,
  ) {}

  private generateOrderId(): string {
    return `ORD-${Date.now()}`;
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .orderBy('o.createdAt', 'DESC');
    if (status) {
      qb.andWhere('o.status = :status', { status });
    }
    return qb.getMany();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const total = dto.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const customerId = `C${Date.now()}`;
    const id = this.generateOrderId();

    const order = this.orderRepo.create({
      id,
      customerId,
      customerName: dto.customerName,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      total,
      status: 'pending',
    });
    const savedOrder = await this.orderRepo.save(order);

    const items = dto.items.map((i) =>
      this.orderItemRepo.create({
        orderId: savedOrder.id,
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        size: i.size,
        color: i.color,
      }),
    );
    await this.orderItemRepo.save(items);

    const lastOrderStr = new Date().toISOString().split('T')[0];
    await this.customersService.upsertFromOrder({
      customerId,
      name: dto.customerName,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      orderTotal: total,
      lastOrderDate: lastOrderStr,
    });

    return this.findById(savedOrder.id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id);
    order.status = status;
    return this.orderRepo.save(order);
  }
}
