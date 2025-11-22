import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { manutencoesService } from '../../services/manutencoesService';
import {
  maintenanceStatusLabel,
  maintenanceStatusColor,
  maintenanceTypeLabel,
  maintenanceTypeColor,
  MaintenanceStatus,
  MaintenanceType,
} from '../../types/manutencao';

export function ManutencaoDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: manutencao, isLoading } = useQuery({
    queryKey: ['manutencao', id],
    queryFn: () => manutencoesService.getById(id!),
    enabled: !!id,
  });

  const getStatusBadgeClass = (status: string) => {
    const color = maintenanceStatusColor[status as MaintenanceStatus];
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium inline-block';

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
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium inline-block';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!manutencao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Manutenção não encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/manutencoes"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            ← Voltar para lista
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalhes da Manutenção
          </h1>
        </div>
        <Link
          to={`/manutencoes/${id}/editar`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações da Manutenção */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações da Manutenção
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tipo
              </div>
              <span className={getTypeBadgeClass(manutencao.type)}>
                {maintenanceTypeLabel[manutencao.type as MaintenanceType]}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </div>
              <span className={getStatusBadgeClass(manutencao.status)}>
                {maintenanceStatusLabel[manutencao.status as MaintenanceStatus]}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Descrição
              </div>
              <div className="text-gray-900 dark:text-white">
                {manutencao.description}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Data
              </div>
              <div className="text-gray-900 dark:text-white">
                {new Date(manutencao.date).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Quilometragem
              </div>
              <div className="text-gray-900 dark:text-white">
                {manutencao.mileage.toLocaleString()} km
              </div>
            </div>
          </div>
        </div>

        {/* Informações Financeiras */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações Financeiras
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Custo
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                R${' '}
                {manutencao.cost.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fornecedor
              </div>
              <div className="text-gray-900 dark:text-white">
                {manutencao.provider}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Veículo */}
        {manutencao.veiculo && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Veículo
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Placa
                </div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {manutencao.veiculo.plate}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Marca/Modelo
                </div>
                <div className="text-gray-900 dark:text-white">
                  {manutencao.veiculo.brand} {manutencao.veiculo.model}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Ano
                </div>
                <div className="text-gray-900 dark:text-white">
                  {manutencao.veiculo.year}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Quilometragem Atual
                </div>
                <div className="text-gray-900 dark:text-white">
                  {manutencao.veiculo.mileage.toLocaleString()} km
                </div>
              </div>
              <Link
                to={`/veiculos/${manutencao.veiculo.id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Ver detalhes do veículo →
              </Link>
            </div>
          </div>
        )}

        {/* Observações */}
        {manutencao.observations && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Observações
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {manutencao.observations}
            </p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <div>
            Criado em:{' '}
            {new Date(manutencao.createdAt).toLocaleString('pt-BR')}
          </div>
          <div>
            Atualizado em:{' '}
            {new Date(manutencao.updatedAt).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
