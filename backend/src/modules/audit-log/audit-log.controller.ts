import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditAction } from '../../common/enums';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRETORIA)
  findAll(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: Record<string, unknown> = {};

    if (entity) filters.entity = entity;
    if (entityId) filters.entityId = entityId;
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.auditLogService.findAll(filters);
  }

  @Get('entity/:entity/:entityId')
  @Roles(
    Role.ADMIN,
    Role.DIRETORIA,
    Role.GERENTE_LOJA,
    Role.FINANCEIRO,
    Role.GESTOR_FROTA,
  )
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.DIRETORIA)
  findByUser(@Param('userId') userId: string) {
    return this.auditLogService.findByUser(userId);
  }
}
