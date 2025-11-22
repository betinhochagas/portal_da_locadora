import { Module } from '@nestjs/common';
import { MotoristasController } from './motoristas.controller';
import { MotoristasService } from './motoristas.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [MotoristasController],
  providers: [MotoristasService],
  exports: [MotoristasService],
})
export class MotoristasModule {}
