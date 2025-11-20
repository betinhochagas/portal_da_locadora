import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Motorista {
  id: string;
  name: string;
  cpf?: string | null;
  cnpj?: string | null;
  email?: string | null;
  phone: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  active: boolean;
  blacklisted: boolean;
  contratos: Array<{
    id: string;
    contractNumber: string;
    status: string;
  }>;
}

export function MotoristasListPage() {
  const { user } = useAuth();

  const { data: motoristas, isLoading, error } = useQuery<Motorista[]>({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const response = await api.get('/motoristas');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando motoristas...</p>
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
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar motoristas</h2>
            <p className="text-gray-600">Tente novamente mais tarde</p>
          </div>
        </div>
      </div>
    );
  }

  const canCreate = user?.role && ['ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Motoristas</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie os motoristas cadastrados no sistema</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-primary bg-gray-600 hover:bg-gray-700">
              ← Voltar ao Dashboard
            </Link>
            {canCreate && (
              <Link to="/motoristas/novo" className="btn-primary">
                + Novo Motorista
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Total de Motoristas</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{motoristas?.length || 0}</div>
          </div>
          <div className="card bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <div className="text-green-600 dark:text-green-400 text-sm font-semibold mb-1">Ativos</div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {motoristas?.filter(m => m.active).length || 0}
            </div>
          </div>
          <div className="card bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
            <div className="text-orange-600 dark:text-orange-400 text-sm font-semibold mb-1">Com Contrato</div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {motoristas?.filter(m => m.contratos.length > 0).length || 0}
            </div>
          </div>
          <div className="card bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">Blacklist</div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">
              {motoristas?.filter(m => m.blacklisted).length || 0}
            </div>
          </div>
        </div>

        {/* Motoristas Table */}
        <div className="card overflow-hidden">
          {motoristas && motoristas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CPF/CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CNH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {motoristas.map((motorista) => (
                    <tr key={motorista.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{motorista.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {motorista.cpf 
                          ? motorista.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                          : motorista.cnpj 
                            ? motorista.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                            : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{motorista.cnh}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Cat. {motorista.cnhCategory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{motorista.phone}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{motorista.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {motorista.blacklisted ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Blacklist
                            </span>
                          ) : motorista.active ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Inativo
                            </span>
                          )}
                          {motorista.contratos.length > 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {motorista.contratos.length} contrato(s)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/motoristas/${motorista.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver
                        </Link>
                        {canCreate && (
                          <Link
                            to={`/motoristas/${motorista.id}/editar`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Editar
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum motorista cadastrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Comece adicionando o primeiro motorista ao sistema</p>
              {canCreate && (
                <Link to="/motoristas/novo" className="btn-primary inline-block">
                  + Adicionar Motorista
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
