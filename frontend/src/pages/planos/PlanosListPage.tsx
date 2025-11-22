import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Plano } from '../../types/plano';
import { VehicleCategory, VehicleCategoryLabels } from '../../types/plano';
import { useAuth } from '../../hooks/useAuth';

export default function PlanosListPage() {
  const { user } = useAuth();

  // Verificar se usuário pode criar planos
  const canCreate =
    user?.role === 'ADMIN' ||
    user?.role === 'DIRETORIA' ||
    user?.role === 'GERENTE_LOJA';

  // Buscar planos da API
  const {
    data: planos,
    isLoading,
    error,
  } = useQuery<Plano[]>({
    queryKey: ['planos'],
    queryFn: async () => {
      const response = await api.get('/planos');
      return response.data;
    },
  });

  // Formatar valor monetário
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  // Calcular estatísticas
  const stats = {
    total: planos?.length || 0,
    ativos: planos?.filter((p) => p.active).length || 0,
    inativos: planos?.filter((p) => !p.active).length || 0,
    comContratos: planos?.filter((p) => (p._count?.contratos ?? 0) > 0).length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Erro ao carregar planos. Tente novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Planos de Locação
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gerencie os planos oferecidos pela locadora
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Voltar
              </Link>
              {canCreate && (
                <Link
                  to="/planos/novo"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Novo Plano
                </Link>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Planos
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
            </div>
            <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Planos Ativos
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.ativos}
              </div>
            </div>
            <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Planos Inativos
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.inativos}
              </div>
            </div>
            <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Com Contratos
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.comContratos}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Planos */}
        {planos && planos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className="card bg-white dark:bg-gray-800 border dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {plano.name}
                    </h3>
                    {plano.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plano.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      plano.active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {plano.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Preços */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Diária:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(plano.dailyPrice)}
                    </span>
                  </div>
                  {plano.weeklyPrice && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Semanal:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(plano.weeklyPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Mensal:
                    </span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {formatCurrency(plano.monthlyPrice)}
                    </span>
                  </div>
                </div>

                {/* KM */}
                <div className="border-t dark:border-gray-700 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      KM Inclusos:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {plano.kmIncluded
                        ? `${plano.kmIncluded.toLocaleString('pt-BR')} km`
                        : 'Ilimitado'}
                    </span>
                  </div>
                  {plano.kmExtraPrice && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        KM Excedente:
                      </span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {formatCurrency(plano.kmExtraPrice)}/km
                      </span>
                    </div>
                  )}
                </div>

                {/* Benefícios */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        plano.includesInsurance
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {plano.includesInsurance
                        ? 'Inclui Seguro'
                        : 'Seguro não incluído'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        plano.includesMaintenance
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {plano.includesMaintenance
                        ? 'Inclui Manutenção'
                        : 'Manutenção não incluída'}
                    </span>
                  </div>
                </div>

                {/* Categorias Permitidas */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Categorias Permitidas:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {plano.allowedCategories.map((cat: VehicleCategory) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded"
                      >
                        {VehicleCategoryLabels[cat]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contratos */}
                {plano._count && plano._count.contratos > 0 && (
                  <div className="border-t dark:border-gray-700 pt-3 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plano._count.contratos} contrato(s) ativo(s)
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                  <Link
                    to={`/planos/${plano.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm"
                  >
                    Ver Detalhes
                  </Link>
                  {canCreate && (
                    <Link
                      to={`/planos/${plano.id}/editar`}
                      className="flex-1 text-center px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700 text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nenhum plano cadastrado ainda.
            </p>
            {canCreate && (
              <Link
                to="/planos/novo"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cadastrar Primeiro Plano
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
