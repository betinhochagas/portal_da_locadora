import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { manutencoesService } from '../../services/manutencoesService';
import {
  MaintenanceStatus,
  MaintenanceType,
  maintenanceStatusLabel,
  maintenanceStatusColor,
  maintenanceTypeLabel,
  maintenanceTypeColor,
} from '../../types/manutencao';

export function ManutencoesListPage() {
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('');
  const queryClient = useQueryClient();

  const { data: manutencoes, isLoading } = useQuery({
    queryKey: ['manutencoes', statusFilter],
    queryFn: () =>
      manutencoesService.list(
        undefined,
        statusFilter || undefined,
      ),
  });

  const { data: pendentes } = useQuery({
    queryKey: ['manutencoes-pendentes'],
    queryFn: () => manutencoesService.getPendentes(),
  });

  const deleteMutation = useMutation({
    mutationFn: manutencoesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      queryClient.invalidateQueries({ queryKey: ['manutencoes-pendentes'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Estatísticas
  const stats = {
    total: manutencoes?.length || 0,
    agendadas:
      manutencoes?.filter((m) => m.status === MaintenanceStatus.AGENDADA)
        .length || 0,
    emAndamento:
      manutencoes?.filter((m) => m.status === MaintenanceStatus.EM_ANDAMENTO)
        .length || 0,
    concluidas:
      manutencoes?.filter((m) => m.status === MaintenanceStatus.CONCLUIDA)
        .length || 0,
  };

  const getStatusBadgeClass = (status: string) => {
    const color = maintenanceStatusColor[status as MaintenanceStatus];
    const baseClass = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (color) {
      case 'yellow':
        return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case 'blue':
        return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'green':
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case 'red':
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300`;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    const color = maintenanceTypeColor[type as MaintenanceType];
    const baseClass = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (color) {
      case 'blue':
        return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'orange':
        return `${baseClass} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'purple':
        return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← Voltar para Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manutenções
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie as manutenções da frota
              </p>
            </div>
            <Link
              to="/manutencoes/nova"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nova Manutenção
            </Link>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Agendadas
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {stats.agendadas}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Em Andamento
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.emAndamento}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Concluídas
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.concluidas}
          </div>
        </div>
      </div>

      {/* Veículos com Manutenção Pendente */}
      {pendentes && pendentes.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            ⚠️ Veículos com Manutenção Pendente ({pendentes.length})
          </h3>
          <div className="space-y-2">
            {pendentes.map((item) => (
              <div
                key={item.veiculo.id}
                className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.veiculo.plate} - {item.veiculo.brand}{' '}
                    {item.veiculo.model}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {item.manutencoesPendentes.length} manutenção(ões) pendente
                    (s)
                  </div>
                </div>
                <Link
                  to={`/veiculos/${item.veiculo.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Ver detalhes →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as MaintenanceStatus | '')
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os status</option>
              {Object.entries(maintenanceStatusLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Veículo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  KM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Custo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Fornecedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {manutencoes && manutencoes.length > 0 ? (
                manutencoes.map((manutencao) => (
                  <tr
                    key={manutencao.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {manutencao.veiculo?.plate || 'N/A'}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {manutencao.veiculo?.brand}{' '}
                        {manutencao.veiculo?.model}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={getTypeBadgeClass(manutencao.type)}>
                        {maintenanceTypeLabel[manutencao.type as MaintenanceType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {manutencao.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(manutencao.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {manutencao.mileage.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      R$ {manutencao.cost.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {manutencao.provider}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={getStatusBadgeClass(manutencao.status)}
                      >
                        {maintenanceStatusLabel[manutencao.status as MaintenanceStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/manutencoes/${manutencao.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/manutencoes/${manutencao.id}/editar`}
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(manutencao.id)}
                          className="text-red-600 dark:text-red-400 hover:underline"
                          disabled={deleteMutation.isPending}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhuma manutenção encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
