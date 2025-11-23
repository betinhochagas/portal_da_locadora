import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ContratoTemplatesModule } from '../contrato-templates/contrato-templates.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuditLogModule, ContratoTemplatesModule, MailModule],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
