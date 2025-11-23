import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { S3StorageAdapter } from './adapters/s3-storage.adapter';
import { StorageAdapter } from './storage.interface';

export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageAdapter,
    S3StorageAdapter,
    {
      provide: STORAGE_ADAPTER,
      useFactory: (
        configService: ConfigService,
        localAdapter: LocalStorageAdapter,
        s3Adapter: S3StorageAdapter,
      ): StorageAdapter => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local');

        if (storageType === 's3') {
          return s3Adapter;
        }

        return localAdapter;
      },
      inject: [ConfigService, LocalStorageAdapter, S3StorageAdapter],
    },
  ],
  exports: [STORAGE_ADAPTER],
})
export class StorageModule {}
