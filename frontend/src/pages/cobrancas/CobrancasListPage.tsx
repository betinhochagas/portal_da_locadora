import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import cobrancasService from '../../services/cobrancasService';
import { paymentStatusLabels, paymentStatusColors, PaymentStatus } from '../../types/cobranca';

export function CobrancasListPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: cobrancas, isLoading } = useQuery({
    queryKey: ['cobrancas', statusFilter],
    queryFn: () => cobrancasService.getAll(undefined, statusFilter || undefined),
  });

  const gerarMensaisMutation = useMutation({
    mutationFn: () => cobrancasService.gerarCobrancasMensais(),
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
    },
  });

  const atualizarAtrasadasMutation = useMutation({
    mutationFn: () => cobrancasService.atualizarStatusAtrasadas(),
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCpfCnpj = (cpf: string | null, cnpj: string | null) => {
    if (cnpj) {
      return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (cpf) {
      return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return '-';
  };

  // Calcular estatísticas
  const stats = {
    total: cobrancas?.length || 0,
    pendentes: cobrancas?.filter((c) => c.status === PaymentStatus.PENDENTE).length || 0,
    pagas: cobrancas?.filter((c) => c.status === PaymentStatus.PAGA).length || 0,
    atrasadas: cobrancas?.filter((c) => c.status === PaymentStatus.ATRASADA).length || 0,
    valorTotal: cobrancas?.reduce((sum, c) => sum + c.amount, 0) || 0,
    valorRecebido: cobrancas?.filter((c) => c.status === PaymentStatus.PAGA).reduce((sum, c) => sum + c.amount, 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  💰 Cobranças
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Controle financeiro de mensalidades
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => atualizarAtrasadasMutation.mutate()}
                disabled={atualizarAtrasadasMutation.isPending}
                className="btn-secondary"
              >
                🔄 Atualizar Atrasadas
              </button>
              <button
                onClick={() => gerarMensaisMutation.mutate()}
                disabled={gerarMensaisMutation.isPending}
                className="btn-primary"
              >
                ➕ Gerar Cobranças Mensais
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
            <div className="text-sm opacity-90 mb-1">Total</div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-xs opacity-75 mt-1">
              {formatCurrency(stats.valorTotal)}
            </div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white">
            <div className="text-sm opacity-90 mb-1">Pendentes</div>
            <div className="text-3xl font-bold">{stats.pendentes}</div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
            <div className="text-sm opacity-90 mb-1">Pagas</div>
            <div className="text-3xl font-bold">{stats.pagas}</div>
            <div className="text-xs opacity-75 mt-1">
              {formatCurrency(stats.valorRecebido)}
            </div>
          </div>
          <div className="card bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white">
            <div className="text-sm opacity-90 mb-1">Atrasadas</div>
            <div className="text-3xl font-bold">{stats.atrasadas}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input max-w-xs"
            >
              <option value="">Todos</option>
              <option value={PaymentStatus.PENDENTE}>Pendentes</option>
              <option value={PaymentStatus.PAGA}>Pagas</option>
              <option value={PaymentStatus.ATRASADA}>Atrasadas</option>
              <option value={PaymentStatus.CANCELADA}>Canceladas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : !cobrancas || cobrancas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhuma cobrança encontrada
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Mês Referência
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Motorista
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      CPF/CNPJ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Veículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Vencimento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cobrancas.map((cobranca) => (
                    <tr key={cobranca.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {cobranca.referenceMonth}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {cobranca.contrato?.motorista.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCpfCnpj(
                          cobranca.contrato?.motorista.cpf || null,
                          cobranca.contrato?.motorista.cnpj || null
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {cobranca.contrato?.veiculo.plate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(cobranca.dueDate)}
                        {cobranca.daysLate > 0 && (
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                            ({cobranca.daysLate}d atraso)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(cobranca.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[cobranca.status as PaymentStatus]}`}>
                          {paymentStatusLabels[cobranca.status as PaymentStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Link
                          to={`/cobrancas/${cobranca.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
