import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auditLogService } from '../../services/auditLogService';
import type { AuditLogFilters, AuditActionType } from '../../types/audit-log';
import {
  formatAction,
  formatEntity,
  getActionColor,
  formatChanges,
  formatValue,
  AuditAction,
} from '../../types/audit-log';
import { Clock, Filter, User, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogService.getAll(filters),
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando logs de auditoria...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">
              Erro ao carregar logs: {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Logs de Auditoria
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Histórico completo de todas as alterações no sistema
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn bg-gray-500 hover:bg-gray-600 text-white"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="label">Entidade</label>
              <select
                className="input"
                value={filters.entity || ''}
                onChange={(e) => handleFilterChange('entity', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Contrato">Contratos</option>
                <option value="Veiculo">Veículos</option>
                <option value="Motorista">Motoristas</option>
                <option value="Plano">Planos</option>
                <option value="Cobranca">Cobranças</option>
                <option value="Manutencao">Manutenções</option>
              </select>
            </div>

            <div>
              <label className="label">Ação</label>
              <select
                className="input"
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value as AuditActionType)}
              >
                <option value="">Todas</option>
                <option value={AuditAction.CREATE}>Criação</option>
                <option value={AuditAction.UPDATE}>Atualização</option>
                <option value={AuditAction.DELETE}>Exclusão</option>
              </select>
            </div>

            <div>
              <label className="label">Data Início</label>
              <input
                type="date"
                className="input"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Data Fim</label>
              <input
                type="date"
                className="input"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total de Logs</p>
                <p className="text-3xl font-bold mt-2">{logs.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Criações</p>
                <p className="text-3xl font-bold mt-2">
                  {logs.filter((log) => log.action === AuditAction.CREATE).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Atualizações</p>
                <p className="text-3xl font-bold mt-2">
                  {logs.filter((log) => log.action === AuditAction.UPDATE).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Exclusões</p>
                <p className="text-3xl font-bold mt-2">
                  {logs.filter((log) => log.action === AuditAction.DELETE).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Timeline de Logs */}
        {logs.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Nenhum log encontrado</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {Object.keys(filters).length > 0
                ? 'Tente ajustar os filtros'
                : 'Logs de auditoria aparecerão aqui conforme ações forem realizadas'}
            </p>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline de Alterações
            </h2>

            <div className="space-y-4">
              {logs.map((log) => {
                const changes = formatChanges(log.changes);
                
                return (
                  <div
                    key={log.id}
                    className="border-l-4 border-indigo-500 pl-4 pb-4 relative"
                  >
                    {/* Ponto na timeline */}
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-800"></div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {/* Header do log */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                            {formatAction(log.action)}
                          </span>
                          <span className="text-gray-700 dark:text-gray-200 font-medium">
                            {formatEntity(log.entity)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {log.entityId.substring(0, 8)}...
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{log.userName || 'Sistema'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mudanças (somente para UPDATE) */}
                      {log.action === AuditAction.UPDATE && changes.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Alterações:
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {changes.map((change, idx) => (
                              <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 rounded p-3 text-sm"
                              >
                                <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                                  {change.field}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                  <span className="text-red-600 dark:text-red-400 line-through">
                                    {formatValue(change.from)}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {formatValue(change.to)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dados completos (para CREATE/DELETE) */}
                      {(log.action === AuditAction.CREATE || log.action === AuditAction.DELETE) && log.changes && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Dados:
                          </p>
                          <pre className="bg-white dark:bg-gray-800 rounded p-3 text-xs overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
