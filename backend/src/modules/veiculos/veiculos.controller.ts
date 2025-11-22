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
} from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { RegistrarKmDto } from './dto/registrar-km.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('veiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GESTOR_FROTA)
  create(@Body() createVeiculoDto: CreateVeiculoDto) {
    return this.veiculosService.create(createVeiculoDto);
  }

  @Get()
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
    Role.EQUIPE_EXTERNA,
  )
  findAll() {
    return this.veiculosService.findAll();
  }

  @Get('alertas-manutencao')
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GESTOR_FROTA, Role.GERENTE_LOJA)
  findAlertasManutencao() {
    return this.veiculosService.findAlertasManutencao();
  }

  @Get(':id')
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
    Role.EQUIPE_EXTERNA,
  )
  findOne(@Param('id') id: string) {
    return this.veiculosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GESTOR_FROTA)
  update(@Param('id') id: string, @Body() updateVeiculoDto: UpdateVeiculoDto) {
    return this.veiculosService.update(id, updateVeiculoDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  remove(@Param('id') id: string) {
    return this.veiculosService.remove(id);
  }

  @Post(':id/registrar-km')
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.GESTOR_FROTA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
  )
  registrarKm(
    @Param('id') id: string,
    @Body() registrarKmDto: RegistrarKmDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.veiculosService.registrarKm(id, registrarKmDto, user.sub);
  }

  @Get(':id/historico-km')
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
  )
  getHistoricoKm(@Param('id') id: string) {
    return this.veiculosService.getHistoricoKm(id);
  }

  @Get(':id/km-semana-atual')
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
    Role.GERENTE_LOJA,
    Role.ATENDENTE,
  )
  getKmSemanaAtual(@Param('id') id: string) {
    return this.veiculosService.getKmSemanaAtual(id);
  }
}
