import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MotoristasModule } from './modules/motoristas/motoristas.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { FiliaisModule } from './modules/filiais/filiais.module';
import { PlanosModule } from './modules/planos/planos.module';
import { ContratosModule } from './modules/contratos/contratos.module';
import { StatsModule } from './modules/stats/stats.module';
import { CobrancasModule } from './modules/cobrancas/cobrancas.module';
import { ManutencoesModule } from './modules/manutencoes/manutencoes.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ContratoTemplatesModule } from './modules/contrato-templates/contrato-templates.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MotoristasModule,
    VeiculosModule,
    FiliaisModule,
    PlanosModule,
    ContratosModule,
    StatsModule,
    CobrancasModule,
    ManutencoesModule,
    AuditLogModule,
    UploadsModule,
    ContratoTemplatesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
