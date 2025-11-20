import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('veiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
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
}
