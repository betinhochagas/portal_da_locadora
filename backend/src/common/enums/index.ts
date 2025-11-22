// Enums centralizados para evitar problemas de cache do Prisma Client
// Estes enums devem estar sincronizados com backend/prisma/schema.prisma

export enum MaintenanceType {
  PREVENTIVA = 'PREVENTIVA',
  CORRETIVA = 'CORRETIVA',
  REVISAO = 'REVISAO',
}

export enum MaintenanceStatus {
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
