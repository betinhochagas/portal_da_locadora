import { Module } from '@nestjs/common';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [VeiculosController],
  providers: [VeiculosService],
  exports: [VeiculosService],
})
export class VeiculosModule {}
