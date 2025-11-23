import { Module } from '@nestjs/common';
import { MotoristasController } from './motoristas.controller';
import { MotoristasService } from './motoristas.service';
import { MotoristaDashboardController } from './motorista-dashboard.controller';
import { MotoristaDashboardService } from './motorista-dashboard.service';
import { MotoristaContratosController } from './motorista-contratos.controller';
import { MotoristaContratosService } from './motorista-contratos.service';
import { MotoristaPagamentosController } from './motorista-pagamentos.controller';
import { MotoristaPagamentosService } from './motorista-pagamentos.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    MotoristasController,
    MotoristaDashboardController,
    MotoristaContratosController,
    MotoristaPagamentosController,
  ],
  providers: [
    MotoristasService,
    MotoristaDashboardService,
    MotoristaContratosService,
    MotoristaPagamentosService,
  ],
  exports: [MotoristasService],
})
export class MotoristasModule {}
