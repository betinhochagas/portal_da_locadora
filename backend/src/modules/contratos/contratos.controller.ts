import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Res,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ChangeVehicleDto } from './dto/change-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { PdfGeneratorService } from '../contrato-templates/pdf-generator.service';

@Controller('contratos')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class ContratosController {
  constructor(
    private readonly contratosService: ContratosService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post()
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE', 'FINANCEIRO')
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  findAll() {
    return this.contratosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contratosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE', 'FINANCEIRO')
  update(
    @Param('id') id: string,
    @Body() updateContratoDto: UpdateContratoDto,
  ) {
    return this.contratosService.update(id, updateContratoDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DIRETORIA')
  remove(@Param('id') id: string) {
    return this.contratosService.remove(id);
  }

  // Ativar contrato (RASCUNHO → ATIVO)
  @Post(':id/activate')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO')
  activate(@Param('id') id: string) {
    return this.contratosService.activateContract(id);
  }

  // Suspender contrato
  @Post(':id/suspend')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.contratosService.suspendContract(id, reason);
  }

  // Reativar contrato suspenso
  @Post(':id/reactivate')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO')
  reactivate(@Param('id') id: string) {
    return this.contratosService.reactivateContract(id);
  }

  // Cancelar contrato
  @Post(':id/cancel')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO')
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.contratosService.cancelContract(id, reason);
  }

  // Concluir contrato
  @Post(':id/complete')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO')
  complete(@Param('id') id: string) {
    return this.contratosService.completeContract(id);
  }

  // Trocar veículo
  @Post(':id/change-vehicle')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  changeVehicle(
    @Param('id') id: string,
    @Body() changeVehicleDto: ChangeVehicleDto,
  ) {
    return this.contratosService.changeVehicle(id, changeVehicleDto);
  }

  @Post(':id/gerar-pdf')
  async gerarPDF(
    @Param('id') id: string,
    @Query('templateId') templateId: string | undefined,
    @Res() res: Response,
  ) {
    console.log('\n\n');
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('🔥 [CONTROLLER] ENDPOINT GERAR-PDF CHAMADO!');
    console.log('🔥 Contrato ID:', id);
    console.log('🔥 Template ID:', templateId || 'não especificado');
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    console.log('\n\n');
    
    try {
      const pdfBuffer = await this.pdfGeneratorService.gerarContratoPDF(
        id,
        templateId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=contrato-${id}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro ao gerar PDF do contrato' });
      }
    }
  }
}
