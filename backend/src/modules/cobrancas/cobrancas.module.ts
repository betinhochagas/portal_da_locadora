import { Module } from '@nestjs/common';
import { CobrancasService } from './cobrancas.service';
import { CobrancasController } from './cobrancas.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CobrancasController],
  providers: [CobrancasService],
  exports: [CobrancasService],
})
export class CobrancasModule {}
