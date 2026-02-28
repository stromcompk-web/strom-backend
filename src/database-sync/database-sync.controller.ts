import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseSyncService } from './database-sync.service';

@Controller('sync')
export class DatabaseSyncController {
  constructor(private readonly syncService: DatabaseSyncService) {}

  /** Admin-only: push local DB to remote (MongoDB/Postgres) now */
  @Post('push')
  @UseGuards(JwtAuthGuard)
  async pushToRemote(): Promise<{ ok: boolean; message: string }> {
    await this.syncService.syncToRemote();
    return { ok: true, message: 'Synced to remote database.' };
  }
}
