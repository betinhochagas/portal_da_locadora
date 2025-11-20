import { Module } from '@nestjs/common';
import { MotoristasController } from './motoristas.controller';
import { MotoristasService } from './motoristas.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MotoristasController],
  providers: [MotoristasService],
  exports: [MotoristasService],
})
export class MotoristasModule {}
