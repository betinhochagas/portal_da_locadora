import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { DollarSign, Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motoristaPagamentosService, type Cobranca } from '../../services/motorista-contratos.service';
import { format, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

const STATUS_CONFIG = {
  PAGA: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Pago',
  },
  PENDENTE: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pendente',
  },
  ATRASADA: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Atrasado',
  },
  CANCELADA: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Cancelado',
  },
} as const;

const PagamentoCard = ({ cobranca }: { cobranca: Cobranca }) => {
  const config = STATUS_CONFIG[cobranca.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDENTE;
  const Icon = config.icon;
  const dueDate = new Date(cobranca.dueDate);
  const isOverdue = isPast(dueDate) && cobranca.status !== 'PAGA' && cobranca.status !== 'CANCELADA';
  const daysLate = isOverdue ? differenceInDays(new Date(), dueDate) : 0;

  return (
    <div className={`bg-white rounded-lg shadow border ${config.borderColor} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              R$ {Number(cobranca.amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Veiculo */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">Veículo</p>
          <p className="font-semibold text-gray-900">
            {cobranca.contrato.veiculo.brand} {cobranca.contrato.veiculo.model}
          </p>
          <p className="text-xs text-gray-500">Contrato: {cobranca.contrato.contractNumber}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Vencimento</p>
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              {isOverdue && (
                <p className="text-xs text-red-600 font-medium">
                  {daysLate} {daysLate === 1 ? 'dia' : 'dias'} de atraso
                </p>
              )}
            </div>
          </div>

          {cobranca.paymentMethod && (
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Forma de Pagamento</p>
                <p className="text-sm font-medium text-gray-900">{cobranca.paymentMethod}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MotoristaPagamentosPage = () => {
  const [filter, setFilter] = useState<'all' | 'PAGA' | 'PENDENTE' | 'ATRASADA'>('all');

  const { data: pagamentos, isLoading, error } = useQuery({
    queryKey: ['motorista-pagamentos'],
    queryFn: motoristaPagamentosService.getPagamentos,
    refetchInterval: 30000,
  });

  const filteredPagamentos = pagamentos?.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const stats = {
    total: pagamentos?.length || 0,
    pagos: pagamentos?.filter(p => p.status === 'PAGA').length || 0,
    pendentes: pagamentos?.filter(p => p.status === 'PENDENTE').length || 0,
    atrasados: pagamentos?.filter(p => p.status === 'ATRASADA').length || 0,
  };

  return (
    <MotoristaLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Pagamentos</h2>
          <p className="text-blue-100 text-sm">
            {pagamentos ? `${pagamentos.length} ${pagamentos.length === 1 ? 'pagamento' : 'pagamentos'}` : 'Carregando...'}
          </p>
        </div>

        {/* Stats Cards */}
        {!isLoading && !error && pagamentos && pagamentos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-green-600 mb-1">Pagos</p>
              <p className="text-2xl font-bold text-green-600">{stats.pagos}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-yellow-600 mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-xs text-red-600 mb-1">Atrasados</p>
              <p className="text-2xl font-bold text-red-600">{stats.atrasados}</p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {!isLoading && !error && pagamentos && pagamentos.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-white text-blue-600 shadow'
                  : 'bg-white/50 text-white hover:bg-white/70'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('PAGA')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'PAGA'
                  ? 'bg-white text-green-600 shadow'
                  : 'bg-white/50 text-white hover:bg-white/70'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setFilter('PENDENTE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'PENDENTE'
                  ? 'bg-white text-yellow-600 shadow'
                  : 'bg-white/50 text-white hover:bg-white/70'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('ATRASADA')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'ATRASADA'
                  ? 'bg-white text-red-600 shadow'
                  : 'bg-white/50 text-white hover:bg-white/70'
              }`}
            >
              Atrasados
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Carregando pagamentos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar pagamentos</h3>
            <p className="text-red-700 text-sm">Tente novamente mais tarde.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && pagamentos?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-gray-600">Você ainda não possui pagamentos registrados.</p>
          </div>
        )}

        {/* No Results for Filter */}
        {!isLoading && !error && filteredPagamentos?.length === 0 && pagamentos && pagamentos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-gray-600">Nenhum pagamento com o status selecionado.</p>
          </div>
        )}

        {/* Payments List */}
        {!isLoading && !error && filteredPagamentos && filteredPagamentos.length > 0 && (
          <div className="space-y-3">
            {filteredPagamentos.map((cobranca) => (
              <PagamentoCard key={cobranca.id} cobranca={cobranca} />
            ))}
          </div>
        )}
      </div>
    </MotoristaLayout>
  );
};
