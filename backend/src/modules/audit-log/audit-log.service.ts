import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { Prisma } from '@prisma/client';
import { AuditAction } from '../../common/enums';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um registro de auditoria
   */
  async create(createAuditLogDto: CreateAuditLogDto) {
    const { userId, changes, ...data } = createAuditLogDto;

    return this.prisma['auditLog'].create({
      data: {
        ...data,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        ...(changes ? { changes: changes as Prisma.InputJsonValue } : {}),
      },
    });
  }

  /**
   * Registra uma ação de auditoria com informações do usuário
   */
  async log(
    entity: string,
    entityId: string,
    action: AuditAction,
    userId?: string,
    userName?: string,
    changes?: Record<string, unknown>,
  ) {
    return this.create({
      entity,
      entityId,
      action,
      userId,
      userName,
      changes,
    });
  }

  /**
   * Busca logs por entidade e ID
   */
  async findByEntity(entity: string, entityId: string) {
    return this.prisma['auditLog'].findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Busca logs por usuário
   */
  async findByUser(userId: string) {
    return this.prisma['auditLog'].findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Busca todos os logs com filtros opcionais
   */
  async findAll(filters?: {
    entity?: string;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {} as { gte?: Date; lte?: Date };
      if (filters.startDate) {
        (where.timestamp as { gte?: Date; lte?: Date }).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.timestamp as { gte?: Date; lte?: Date }).lte = filters.endDate;
      }
    }

    return this.prisma['auditLog'].findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limitar a 100 registros por padrão
    });
  }

  /**
   * Calcula diff entre dois objetos
   */
  calculateDiff(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
  ): Record<string, unknown> {
    const changes: Record<string, unknown> = {};

    // Campos novos ou alterados
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key],
        };
      }
    }

    return changes;
  }
}
