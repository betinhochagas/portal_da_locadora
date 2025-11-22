import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Plano } from '../../types/plano';
import { VehicleCategory, VehicleCategoryLabels } from '../../types/plano';
import { useAuth } from '../../hooks/useAuth';

export default function PlanoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Verificar permissões
  const canEdit =
    user?.role === 'ADMIN' ||
    user?.role === 'DIRETORIA' ||
    user?.role === 'GERENTE_LOJA';

  const canDelete = user?.role === 'ADMIN' || user?.role === 'DIRETORIA';

  // Buscar plano
  const {
    data: plano,
    isLoading,
    error,
  } = useQuery<Plano>({
    queryKey: ['planos', id],
    queryFn: async () => {
      const response = await api.get(`/planos/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/planos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      navigate('/planos');
    },
  });

  // Handler de delete
  const handleDelete = () => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.'
      )
    ) {
      deleteMutation.mutate();
    }
  };

  // Formatar valor monetário
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  // Formatar data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plano) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Plano não encontrado.
            </p>
          </div>
          <Link
            to="/planos"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Voltar para Planos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plano.name}
                </h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded ${
                    plano.active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                  }`}
                >
                  {plano.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {plano.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {plano.description}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to="/planos"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Voltar
              </Link>
              {canEdit && (
                <Link
                  to={`/planos/${id}/editar`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card - Preços */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Valores
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Diária:
                </span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(plano.dailyPrice)}
                </span>
              </div>
              {plano.weeklyPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Semanal:
                  </span>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(plano.weeklyPrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Mensal:
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(plano.monthlyPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Card - Quilometragem */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quilometragem
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  KM Inclusos:
                </span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {plano.kmIncluded
                    ? `${plano.kmIncluded.toLocaleString('pt-BR')} km`
                    : 'Ilimitado'}
                </span>
              </div>
              {plano.kmExtraPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    KM Excedente:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(plano.kmExtraPrice)}/km
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card - Benefícios */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Benefícios Inclusos
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    plano.includesInsurance
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  {plano.includesInsurance
                    ? '✓ Inclui Seguro'
                    : '✗ Seguro não incluído'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    plano.includesMaintenance
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
                <span className="text-gray-700 dark:text-gray-300">
                  {plano.includesMaintenance
                    ? '✓ Inclui Manutenção'
                    : '✗ Manutenção não incluída'}
                </span>
              </div>
            </div>
          </div>

          {/* Card - Categorias Permitidas */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Categorias Permitidas
            </h2>
            <div className="flex flex-wrap gap-2">
              {plano.allowedCategories.map((cat: VehicleCategory) => (
                <span
                  key={cat}
                  className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg font-medium"
                >
                  {VehicleCategoryLabels[cat]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card - Contratos Ativos */}
        {plano.contratos && plano.contratos.length > 0 && (
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Contratos Vinculados ({plano.contratos.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nº Contrato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Motorista
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Veículo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {plano.contratos.map((contrato: typeof plano.contratos[number]) => (
                    <tr
                      key={contrato.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {contrato.contractNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {contrato.motorista.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {contrato.veiculo.plate} - {contrato.veiculo.brand}{' '}
                        {contrato.veiculo.model}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card - Informações do Sistema */}
        <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Informações do Sistema
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">ID:</span>
              <p className="text-gray-900 dark:text-white font-mono">{plano.id}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Criado em:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formatDate(plano.createdAt)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Última atualização:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formatDate(plano.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de erro ao excluir */}
        {deleteMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
            <p className="text-red-800 dark:text-red-200">
              {(deleteMutation.error as Error).message ||
                'Erro ao excluir plano. Verifique se não há contratos ativos vinculados.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
