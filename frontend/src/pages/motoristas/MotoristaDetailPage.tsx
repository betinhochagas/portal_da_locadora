import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Motorista {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  active: boolean;
  blacklisted: boolean;
  blacklistReason: string | null;
  contratos: Array<{
    id: string;
    contractNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    veiculo: {
      id: string;
      plate: string;
      brand: string;
      model: string;
    };
  }>;
}

export function MotoristaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: motorista, isLoading, error } = useQuery<Motorista>({
    queryKey: ['motorista', id],
    queryFn: async () => {
      const response = await api.get(`/motoristas/${id}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/motoristas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      navigate('/motoristas');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando motorista...</p>
        </div>
      </div>
    );
  }

  if (error || !motorista) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Motorista não encontrado</h2>
            <p className="text-gray-600 mb-4">O motorista solicitado não existe ou foi removido</p>
            <Link to="/motoristas" className="btn-primary inline-block">
              ← Voltar para Motoristas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user?.role && ['ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE'].includes(user.role);
  const canDelete = user?.role && ['ADMIN', 'DIRETORIA'].includes(user.role);

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/motoristas" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
              ← Voltar para Motoristas
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{motorista.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                motorista.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {motorista.active ? 'Ativo' : 'Inativo'}
              </span>
              {motorista.blacklisted && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Bloqueado
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={`/motoristas/${motorista.id}/editar`}
                className="btn-primary bg-blue-600 hover:bg-blue-700"
              >
                ✏️ Editar
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                {deleteMutation.isPending ? '⏳ Excluindo...' : '🗑️ Excluir'}
              </button>
            )}
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF</div>
              <div className="font-semibold dark:text-gray-200">{formatCPF(motorista.cpf)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CNPJ</div>
              <div className="font-semibold dark:text-gray-200">{formatCNPJ(motorista.cnpj)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RG</div>
              <div className="font-semibold dark:text-gray-200">{motorista.rg || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Telefone</div>
              <div className="font-semibold dark:text-gray-200">{motorista.phone}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
              <div className="font-semibold dark:text-gray-200">{motorista.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* CNH */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🪪 CNH</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número</div>
              <div className="font-semibold dark:text-gray-200">{motorista.cnh}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</div>
              <div className="font-semibold dark:text-gray-200">{motorista.cnhCategory}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Validade</div>
              <div className="font-semibold dark:text-gray-200">
                {new Date(motorista.cnhExpiry).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        {(motorista.address || motorista.city) && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📍 Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endereço</div>
                <div className="font-semibold dark:text-gray-200">{motorista.address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cidade</div>
                <div className="font-semibold dark:text-gray-200">{motorista.city || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</div>
                <div className="font-semibold dark:text-gray-200">{motorista.state || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CEP</div>
                <div className="font-semibold dark:text-gray-200">{motorista.zipCode || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Dados Bancários */}
        {(motorista.bankName || motorista.bankAgency || motorista.bankAccount) && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏦 Dados Bancários</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Banco</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agência</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankAgency || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conta</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankAccount || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bloqueio */}
        {motorista.blacklisted && motorista.blacklistReason && (
          <div className="card bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">⚠️ Motivo do Bloqueio</h2>
            <p className="text-red-700 dark:text-red-300">{motorista.blacklistReason}</p>
          </div>
        )}

        {/* Contratos */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Contratos</h2>
          {motorista.contratos && motorista.contratos.length > 0 ? (
            <div className="space-y-3">
              {motorista.contratos.map((contrato) => (
                <div key={contrato.id} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-purple-900 dark:text-purple-200">
                      Contrato #{contrato.contractNumber}
                    </div>
                    <span className="px-2 py-1 bg-purple-600 dark:bg-purple-700 text-white text-xs rounded-full">
                      {contrato.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div><strong>Veículo:</strong> {contrato.veiculo.brand} {contrato.veiculo.model} ({contrato.veiculo.plate})</div>
                    <div><strong>Período:</strong> {new Date(contrato.startDate).toLocaleDateString('pt-BR')} até {new Date(contrato.endDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Nenhum contrato associado a este motorista</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
