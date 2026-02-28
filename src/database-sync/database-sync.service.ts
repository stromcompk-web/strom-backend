import { Injectable, OnModuleInit, Optional, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Admin } from '../auth/admin.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Customer } from '../customers/customer.entity';

const ENTITIES = [Admin, Product, Order, OrderItem, Customer] as const;
/** Order for sync: no FK → then orders (customerId) → then order_items (orderId) */
const SYNC_ORDER: Array<{ entity: (typeof ENTITIES)[number]; table: string }> = [
  { entity: Admin, table: 'admins' },
  { entity: Customer, table: 'customers' },
  { entity: Product, table: 'products' },
  { entity: Order, table: 'orders' },
  { entity: OrderItem, table: 'order_items' },
];

@Injectable()
export class DatabaseSyncService implements OnModuleInit {
  private remoteDs: DataSource | null = null;

  constructor(
    private readonly localDs: DataSource,
    @Optional()
    @Inject(getDataSourceToken('remote'))
    remoteDs?: DataSource,
  ) {
    this.remoteDs = remoteDs ?? null;
  }

  onModuleInit() {
    if (this.remoteDs) {
      this.syncFromRemote().catch((err) =>
        console.warn('[DbSync] Initial sync from remote failed:', err?.message),
      );
      // Only sync Live → Local (local follows live). No automatic push from local to live.
    }
  }

  /** Pull from remote (Live DB: MongoDB/Postgres) into local (SQLite). Live = source of truth. */
  async syncFromRemote(): Promise<void> {
    if (!this.remoteDs?.isInitialized) return;
    const local = this.localDs;
    if (!local.isInitialized) return;
    console.log('[DbSync] Syncing from remote → local...');
    for (const { entity, table } of SYNC_ORDER) {
      try {
        const repoRemote = this.remoteDs.getRepository(entity);
        const rows = await repoRemote.find();
        if (rows.length === 0) continue;
        const repoLocal = local.getRepository(entity);
        for (const row of rows) {
          const plain = { ...row };
          if (typeof (plain as any).items !== 'undefined') delete (plain as any).items;
          await repoLocal.save(repoLocal.create(plain as any));
        }
        console.log(`[DbSync] ${table}: ${rows.length} rows pulled`);
      } catch (e) {
        console.warn(`[DbSync] Failed to pull ${table}:`, (e as Error)?.message);
      }
    }
    console.log('[DbSync] Sync from remote finished.');
  }

  /** Keep local in sync with live: pull from remote every 5 min (no push from local to live). */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncFromRemoteCron(): Promise<void> {
    if (!this.remoteDs?.isInitialized) return;
    await this.syncFromRemote();
  }

  /** Manual only: push local → live (e.g. Admin "Sync to cloud now"). Not used automatically. */
  async syncToRemote(): Promise<void> {
    if (!this.remoteDs?.isInitialized) return;
    const local = this.localDs;
    if (!local.isInitialized) return;
    try {
      console.log('[DbSync] Syncing from local → remote...');
      for (const { entity, table } of SYNC_ORDER) {
        const repoLocal = local.getRepository(entity);
        const rows = await repoLocal.find();
        if (rows.length === 0) continue;
        const repoRemote = this.remoteDs.getRepository(entity);
        for (const row of rows) {
          const plain = { ...row };
          if (typeof (plain as any).items !== 'undefined') delete (plain as any).items;
          await repoRemote.save(repoRemote.create(plain as any));
        }
        console.log(`[DbSync] ${table}: ${rows.length} rows pushed`);
      }
      console.log('[DbSync] Sync to remote finished.');
    } catch (e) {
      console.error('[DbSync] Sync to remote FAILED:', (e as Error)?.message);
      if (process.env.DATABASE_URL?.startsWith('mongodb') && (e as Error)?.stack) {
        console.error('[DbSync] Stack:', (e as Error).stack);
      }
    }
  }
}
