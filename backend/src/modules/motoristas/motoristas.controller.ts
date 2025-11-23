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
import { MotoristasService } from './motoristas.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('motoristas')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class MotoristasController {
  constructor(private readonly motoristasService: MotoristasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GERENTE_LOJA, Role.ATENDENTE)
  create(@Body() createMotoristaDto: CreateMotoristaDto) {
    return this.motoristasService.create(createMotoristaDto);
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
    return this.motoristasService.findAll();
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
    return this.motoristasService.findOne(id);
  }

  @Post(':id/reset-password')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA')
  resetPassword(@Param('id') id: string) {
    return this.motoristasService.resetPassword(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE')
  update(
    @Param('id') id: string,
    @Body() updateMotoristaDto: UpdateMotoristaDto,
  ) {
    return this.motoristasService.update(id, updateMotoristaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  remove(@Param('id') id: string) {
    return this.motoristasService.remove(id);
  }
}
