import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SeedModule } from './seed/seed.module';
import { DatabaseSyncModule } from './database-sync/database-sync.module';
import { Admin } from './auth/admin.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { Customer } from './customers/customer.entity';
import { Review } from './reviews/review.entity';
import { ReviewsModule } from './reviews/reviews.module';

const entities = [Admin, Product, Order, OrderItem, Customer, Review];

const dbUrl = process.env.DATABASE_URL;
const isMongo = dbUrl?.startsWith('mongodb');
const remoteDbConfig =
  dbUrl && (isMongo || dbUrl.startsWith('postgres'))
    ? [
        TypeOrmModule.forRootAsync({
          name: 'remote',
          useFactory: () => {
            if (isMongo) {
              let database = 'dazzle';
              try {
                const pathname = new URL(dbUrl).pathname?.replace(/^\//, '').trim();
                if (pathname) database = pathname;
              } catch (_) {}
              return {
                type: 'mongodb' as const,
                url: dbUrl,
                database,
                entities,
                synchronize: true,
              };
            }
            return {
              type: 'postgres' as const,
              url: dbUrl,
              entities,
              synchronize: true,
              ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false,
            };
          },
        }),
      ]
    : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: process.env.DATABASE_PATH || './data/dazzle.db',
      entities,
      synchronize: true,
    }),
    ...remoteDbConfig,
    ScheduleModule.forRoot(),
    DatabaseSyncModule,
    SeedModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CustomersModule,
    AnalyticsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
