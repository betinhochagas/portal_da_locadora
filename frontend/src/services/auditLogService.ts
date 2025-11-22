import { api } from './api';
import type { AuditLog, AuditLogFilters } from '../types/audit-log';

export const auditLogService = {
  /**
   * Lista todos os audit logs com filtros opcionais
   */
  getAll: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    
    if (filters?.entity) params.append('entity', filters.entity);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/audit-logs?${queryString}` : '/audit-logs';
    
    const response = await api.get<AuditLog[]>(url);
    return response.data;
  },

  /**
   * Busca histórico de uma entidade específica
   */
  getByEntity: async (entity: string, entityId: string): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>(`/audit-logs/entity/${entity}/${entityId}`);
    return response.data;
  },

  /**
   * Busca todos os logs de um usuário
   */
  getByUser: async (userId: string): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>(`/audit-logs/user/${userId}`);
    return response.data;
  },
};
