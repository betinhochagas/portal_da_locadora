import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ContratoTemplatesService } from './contrato-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('contrato-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratoTemplatesController {
  constructor(private readonly service: ContratoTemplatesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRETORIA)
  findAll() {
    return this.service.findAll();
  }

  @Get('ativos')
  findAtivos() {
    return this.service.findAtivos();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRETORIA)
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: { userId: string }) {
    return this.service.create(dto, user.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/toggle-ativo')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  toggleAtivo(@Param('id') id: string) {
    return this.service.toggleAtivo(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
