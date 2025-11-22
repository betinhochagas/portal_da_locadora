import { Module } from '@nestjs/common';
import { ManutencoesService } from './manutencoes.service';
import { ManutencoesController } from './manutencoes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManutencoesController],
  providers: [ManutencoesService],
  exports: [ManutencoesService],
})
export class ManutencoesModule {}
