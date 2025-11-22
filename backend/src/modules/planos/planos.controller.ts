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
import { PlanosService } from './planos.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('planos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  /**
   * POST /api/v1/planos - Criar novo plano
   * Acesso: ADMIN, DIRETORIA, GERENTE_LOJA
   */
  @Post()
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GERENTE_LOJA)
  create(@Body() createPlanoDto: CreatePlanoDto) {
    return this.planosService.create(createPlanoDto);
  }

  /**
   * GET /api/v1/planos - Listar todos os planos
   * Acesso: Todas as roles
   */
  @Get()
  findAll() {
    return this.planosService.findAll();
  }

  /**
   * GET /api/v1/planos/:id - Buscar plano por ID
   * Acesso: Todas as roles
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planosService.findOne(id);
  }

  /**
   * PATCH /api/v1/planos/:id - Atualizar plano
   * Acesso: ADMIN, DIRETORIA, GERENTE_LOJA
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA, Role.GERENTE_LOJA)
  update(@Param('id') id: string, @Body() updatePlanoDto: UpdatePlanoDto) {
    return this.planosService.update(id, updatePlanoDto);
  }

  /**
   * DELETE /api/v1/planos/:id - Remover plano (soft delete)
   * Acesso: Apenas ADMIN e DIRETORIA
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  remove(@Param('id') id: string) {
    return this.planosService.remove(id);
  }
}
