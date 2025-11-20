import { Module } from '@nestjs/common';
import { FiliaisController } from './filiais.controller';
import { FiliaisService } from './filiais.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FiliaisController],
  providers: [FiliaisService],
  exports: [FiliaisService],
})
export class FiliaisModule {}
