import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ManutencoesService } from './manutencoes.service';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MaintenanceStatus } from '../../common/enums';

@Controller('manutencoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManutencoesController {
  constructor(private readonly manutencoesService: ManutencoesService) {}

  @Post()
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  create(@Body() createManutencaoDto: CreateManutencaoDto) {
    return this.manutencoesService.create(createManutencaoDto);
  }

  @Get()
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE', 'FINANCEIRO')
  findAll(
    @Query('veiculoId') veiculoId?: string,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.manutencoesService.findAll(veiculoId, status);
  }

  @Get('pendentes')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  getVeiculosComManutencaoPendente() {
    return this.manutencoesService.getVeiculosComManutencaoPendente();
  }

  @Get('veiculo/:veiculoId/historico')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE')
  getHistoricoByVeiculo(@Param('veiculoId') veiculoId: string) {
    return this.manutencoesService.getHistoricoByVeiculo(veiculoId);
  }

  @Get('veiculo/:veiculoId/proxima-preventiva')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  calcularProximaManutencaoPreventiva(@Param('veiculoId') veiculoId: string) {
    return this.manutencoesService.calcularProximaManutencaoPreventiva(
      veiculoId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE', 'FINANCEIRO')
  findOne(@Param('id') id: string) {
    return this.manutencoesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  update(
    @Param('id') id: string,
    @Body() updateManutencaoDto: UpdateManutencaoDto,
  ) {
    return this.manutencoesService.update(id, updateManutencaoDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DIRETORIA')
  remove(@Param('id') id: string) {
    return this.manutencoesService.remove(id);
  }
}
