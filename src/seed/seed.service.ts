import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../auth/password.util';
import { Admin } from '../auth/admin.entity';
import { Product } from '../products/product.entity';

const DEFAULT_ADMIN = {
  email: 'admin@engine.com',
  password: 'admin123',
};

const SEED_PRODUCTS: Partial<Product>[] = [
  {
    id: 'm1',
    name: 'Classic Cotton Tee',
    price: 1490,
    originalPrice: 2990,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Tops',
    gender: 'men',
    description:
      'Premium cotton crew-neck t-shirt with a relaxed fit. Perfect for everyday casual wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy'],
  },
  {
    id: 'm2',
    name: 'Hooded Field Jacket',
    price: 4990,
    originalPrice: 8990,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    category: 'Outerwear',
    gender: 'men',
    description: 'Water-resistant hooded field jacket with multiple utility pockets.',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Brown', 'Olive', 'Black'],
  },
  {
    id: 'm3',
    name: 'Denim Casual Shirt',
    price: 2490,
    originalPrice: 4490,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    category: 'Casual Shirts',
    gender: 'men',
    description: 'Soft-wash denim shirt with a modern slim fit.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Light Blue', 'Grey'],
  },
  {
    id: 'm4',
    name: 'Slim Fit Chinos',
    price: 2990,
    originalPrice: 4990,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
    category: 'Trousers',
    gender: 'men',
    description: 'Tailored slim-fit chino trousers with stretch fabric.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki', 'Navy', 'Charcoal'],
  },
  {
    id: 'w1',
    name: 'Wool Blend Overcoat',
    price: 7990,
    originalPrice: 14990,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400',
    category: 'Outerwear',
    gender: 'women',
    description: 'Luxurious double-breasted wool blend overcoat.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Brown', 'Camel', 'Black'],
  },
  {
    id: 'w2',
    name: 'Tailored Navy Blazer',
    price: 5990,
    originalPrice: 9990,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
    category: 'Blazers',
    gender: 'women',
    description: 'Structured single-button blazer in premium navy fabric.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Black', 'Burgundy'],
  },
  {
    id: 'w3',
    name: 'Floral Summer Dress',
    price: 3490,
    originalPrice: 5990,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Dresses',
    gender: 'women',
    description: 'Flowing floral print dress with flutter sleeves.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral Pink', 'Floral Blue'],
  },
  {
    id: 'w4',
    name: 'Cozy Turtleneck Sweater',
    price: 2990,
    originalPrice: 5490,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    category: 'Sweaters',
    gender: 'women',
    description: 'Soft knit turtleneck sweater with ribbed cuffs.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Grey', 'Blush'],
  },
  {
    id: 'k1',
    name: 'Kids Casual Set',
    price: 1990,
    originalPrice: 3490,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400',
    category: 'Kids Collection',
    gender: 'kids',
    description: 'Adorable matching top and bottom set for little ones.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['White/Blue', 'Pink/White'],
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedProducts();
  }

  private async seedAdmin() {
    const existing = await this.adminRepo.findOne({
      where: { email: DEFAULT_ADMIN.email.toLowerCase() },
    });
    if (existing) return;
    const hash = await hashPassword(DEFAULT_ADMIN.password);
    const admin = this.adminRepo.create({
      email: DEFAULT_ADMIN.email.toLowerCase(),
      passwordHash: hash,
    });
    await this.adminRepo.save(admin);
    console.log('Seeded default admin: admin@engine.com');
  }

  private async seedProducts() {
    for (const p of SEED_PRODUCTS) {
      const existing = await this.productRepo.findOne({ where: { id: p.id! } });
      if (existing) continue;
      const product = this.productRepo.create({
        ...p,
        originalPrice: p.originalPrice ?? null,
      });
      await this.productRepo.save(product);
    }
    console.log('Seeded products');
  }
}
