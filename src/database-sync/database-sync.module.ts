import { Module } from '@nestjs/common';
import { DatabaseSyncService } from './database-sync.service';
import { DatabaseSyncController } from './database-sync.controller';

@Module({
  controllers: [DatabaseSyncController],
  providers: [DatabaseSyncService],
  exports: [DatabaseSyncService],
})
export class DatabaseSyncModule {}
