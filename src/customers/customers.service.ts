import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async findAll(search?: string): Promise<Customer[]> {
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .orderBy('c.totalSpent', 'DESC');
    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      qb.andWhere(
        '(c.name LIKE :s OR c.email LIKE :s OR c.city LIKE :s)',
        { s },
      );
    }
    return qb.getMany();
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customerRepo.findOne({ where: { id } });
  }

  async upsertFromOrder(data: {
    customerId: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    orderTotal: number;
    lastOrderDate: string;
  }): Promise<void> {
    let customer = await this.customerRepo.findOne({
      where: { email: data.email.toLowerCase() },
    });
    if (customer) {
      customer.ordersCount += 1;
      customer.totalSpent += data.orderTotal;
      customer.lastOrder = data.lastOrderDate;
      customer.name = data.name;
      customer.phone = data.phone || customer.phone;
      customer.city = data.city || customer.city;
    } else {
      customer = this.customerRepo.create({
        id: data.customerId,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        city: data.city,
        ordersCount: 1,
        totalSpent: data.orderTotal,
        lastOrder: data.lastOrderDate,
      });
    }
    await this.customerRepo.save(customer);
  }
}
