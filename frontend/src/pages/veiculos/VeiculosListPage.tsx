import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Veiculo {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: string;
  fuelType: string;
  transmission: string;
  status: string;
  km: number | null;
  fipeValue: number | null;
  active: boolean;
  filial: {
    id: string;
    name: string;
    code: string;
  } | null;
  contratos: Array<{
    id: string;
    contractNumber: string;
    status: string;
    motorista: {
      id: string;
      name: string;
    };
  }>;
}

const statusLabels: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  LOCADO: 'Locado',
  MANUTENCAO: 'Manutenção',
  INATIVO: 'Inativo',
};

const categoryLabels: Record<string, string> = {
  HATCH: 'Hatch',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  PICKUP: 'Pickup',
  VAN: 'Van',
};

const fuelLabels: Record<string, string> = {
  GASOLINA: 'Gasolina',
  ETANOL: 'Etanol',
  FLEX: 'Flex',
  DIESEL: 'Diesel',
  GNV: 'GNV',
  ELETRICO: 'Elétrico',
  HIBRIDO: 'Híbrido',
};

const transmissionLabels: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATICO: 'Automático',
  AUTOMATIZADO: 'Automatizado',
  CVT: 'CVT',
};

export function VeiculosListPage() {
  const { user } = useAuth();

  const { data: veiculos, isLoading, error } = useQuery<Veiculo[]>({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const response = await api.get('/veiculos');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando veículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar veículos</h2>
            <p className="text-gray-600">Tente novamente mais tarde</p>
          </div>
        </div>
      </div>
    );
  }

  const canCreate = user?.role && ['ADMIN', 'DIRETORIA', 'GESTOR_FROTA'].includes(user.role);

  const disponíveis = veiculos?.filter(v => v.status === 'DISPONIVEL').length || 0;
  const locados = veiculos?.filter(v => v.status === 'LOCADO').length || 0;
  const manutencao = veiculos?.filter(v => v.status === 'MANUTENCAO').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Veículos</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Gestão da frota de veículos</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-primary bg-gray-600 hover:bg-gray-700">
              ← Voltar ao Dashboard
            </Link>
            {canCreate && (
              <Link to="/veiculos/novo" className="btn-primary">
                + Novo Veículo
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Total de Veículos</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{veiculos?.length || 0}</div>
          </div>
          <div className="card bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <div className="text-green-600 dark:text-green-400 text-sm font-semibold mb-1">Disponíveis</div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{disponíveis}</div>
          </div>
          <div className="card bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-semibold mb-1">Locados</div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{locados}</div>
          </div>
          <div className="card bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
            <div className="text-orange-600 dark:text-orange-400 text-sm font-semibold mb-1">Em Manutenção</div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{manutencao}</div>
          </div>
        </div>

        {/* Veículos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {veiculos && veiculos.length > 0 ? (
            veiculos.map((veiculo) => (
              <div key={veiculo.id} className="card hover:shadow-lg transition-shadow">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      veiculo.status === 'DISPONIVEL'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : veiculo.status === 'LOCADO'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : veiculo.status === 'MANUTENCAO'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {statusLabels[veiculo.status] || veiculo.status}
                  </span>
                  <span className="text-2xl">🚗</span>
                </div>

                {/* Veículo Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {veiculo.brand} {veiculo.model}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {veiculo.year} • {veiculo.color}
                </p>

                {/* Placa */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 mb-3 text-center">
                  <span className="font-mono font-bold text-lg dark:text-gray-200">{veiculo.plate}</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Categoria</div>
                    <div className="font-semibold dark:text-gray-200">{categoryLabels[veiculo.category]}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Combustível</div>
                    <div className="font-semibold dark:text-gray-200">{fuelLabels[veiculo.fuelType]}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Transmissão</div>
                    <div className="font-semibold dark:text-gray-200">{transmissionLabels[veiculo.transmission]}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Quilometragem</div>
                    <div className="font-semibold dark:text-gray-200">
                      {veiculo.km ? `${veiculo.km.toLocaleString()} km` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Contrato Ativo */}
                {veiculo.contratos.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 rounded-lg p-3 mb-3">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">CONTRATO ATIVO</div>
                    <div className="text-sm font-medium dark:text-gray-200">{veiculo.contratos[0].motorista.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{veiculo.contratos[0].contractNumber}</div>
                  </div>
                )}

                {/* Filial */}
                {veiculo.filial && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    📍 {veiculo.filial.name}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/veiculos/${veiculo.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    Ver Detalhes
                  </Link>
                  {canCreate && (
                    <Link
                      to={`/veiculos/${veiculo.id}/editar`}
                      className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 card">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum veículo cadastrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Comece adicionando o primeiro veículo à frota</p>
              {canCreate && (
                <Link to="/veiculos/novo" className="btn-primary inline-block">
                  + Adicionar Veículo
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
