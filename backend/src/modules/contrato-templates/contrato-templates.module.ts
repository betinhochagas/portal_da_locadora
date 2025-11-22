import { Module } from '@nestjs/common';
import { ContratoTemplatesController } from './contrato-templates.controller';
import { ContratoTemplatesService } from './contrato-templates.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContratoTemplatesController],
  providers: [ContratoTemplatesService, PdfGeneratorService],
  exports: [PdfGeneratorService],
})
export class ContratoTemplatesModule {}
