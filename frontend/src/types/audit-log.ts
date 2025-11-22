// Enum de ações de auditoria (const enum pattern para compatibilidade)
export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

// Interface principal do audit log
export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: AuditActionType;
  userId: string | null;
  userName: string | null;
  changes: Record<string, unknown> | null;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Interface para filtros na listagem
export interface AuditLogFilters {
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: AuditActionType;
  startDate?: string;
  endDate?: string;
}

// Helper para formatar o nome da ação
export const formatAction = (action: AuditActionType): string => {
  const actions: Record<AuditActionType, string> = {
    CREATE: 'Criação',
    UPDATE: 'Atualização',
    DELETE: 'Exclusão',
  };
  return actions[action] || action;
};

// Helper para formatar o nome da entidade
export const formatEntity = (entity: string): string => {
  const entities: Record<string, string> = {
    Contrato: 'Contrato',
    Veiculo: 'Veículo',
    Motorista: 'Motorista',
    Plano: 'Plano',
    Cobranca: 'Cobrança',
    Manutencao: 'Manutenção',
  };
  return entities[entity] || entity;
};

// Helper para obter a cor da badge de ação
export const getActionColor = (action: AuditActionType): string => {
  const colors: Record<AuditActionType, string> = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// Helper para formatar o diff de mudanças
export interface ChangeDiff {
  field: string;
  from: unknown;
  to: unknown;
}

export const formatChanges = (changes: Record<string, unknown> | null): ChangeDiff[] => {
  if (!changes) return [];
  
  const diffs: ChangeDiff[] = [];
  
  for (const [field, value] of Object.entries(changes)) {
    if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
      diffs.push({
        field,
        from: (value as { from: unknown }).from,
        to: (value as { to: unknown }).to,
      });
    }
  }
  
  return diffs;
};

// Helper para formatar valores no diff
export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  return JSON.stringify(value);
};
