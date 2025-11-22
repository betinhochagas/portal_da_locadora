import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import cobrancasService from '../../services/cobrancasService';
import { paymentStatusLabels, paymentStatusColors, PaymentStatus } from '../../types/cobranca';

export function CobrancaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'PIX',
    lateFee: 0,
    observations: '',
  });

  const { data: cobranca, isLoading } = useQuery({
    queryKey: ['cobranca', id],
    queryFn: () => cobrancasService.getById(id!),
    enabled: !!id,
  });

  const registrarPagamentoMutation = useMutation({
    mutationFn: () => cobrancasService.registrarPagamento(id!, paymentData),
    onSuccess: () => {
      alert('Pagamento registrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['cobranca', id] });
      queryClient.invalidateQueries({ queryKey: ['cobrancas'] });
      setShowPaymentModal(false);
    },
    onError: (error: Error) => {
      alert(`Erro ao registrar pagamento: ${error.message}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Carregando...</div>
      </div>
    );
  }

  if (!cobranca) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Cobrança não encontrada</div>
      </div>
    );
  }

  const canRegisterPayment = cobranca.status === PaymentStatus.PENDENTE || cobranca.status === PaymentStatus.ATRASADA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/cobrancas"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes da Cobrança
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mês: {cobranca.referenceMonth}
                </p>
              </div>
            </div>
            {canRegisterPayment && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary"
              >
                💰 Registrar Pagamento
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Informações da Cobrança */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💵 Informações Financeiras
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Mês Referência:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.referenceMonth}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Valor:</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(cobranca.amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Vencimento:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(cobranca.dueDate)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[cobranca.status as PaymentStatus]}`}>
                    {paymentStatusLabels[cobranca.status as PaymentStatus]}
                  </span>
                </div>
              </div>
              {cobranca.daysLate > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    ⚠️ {cobranca.daysLate} dia(s) de atraso
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Motorista */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              👤 Motorista
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nome:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.contrato?.motorista.name}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Telefone:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.contrato?.motorista.phone}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Documento:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.contrato?.motorista.cpf || cobranca.contrato?.motorista.cnpj}
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Veículo */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🚗 Veículo
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Placa:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.contrato?.veiculo.plate}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Modelo:</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {cobranca.contrato?.veiculo.brand} {cobranca.contrato?.veiculo.model}
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento (se pago) */}
          {cobranca.status === PaymentStatus.PAGA && (
            <div className="card bg-green-50 dark:bg-green-900/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ✅ Pagamento Realizado
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data Pagamento:</span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {cobranca.paymentDate ? formatDate(cobranca.paymentDate) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Método:</span>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {cobranca.paymentMethod || '-'}
                  </p>
                </div>
                {cobranca.lateFee && cobranca.lateFee > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Multa:</span>
                    <p className="text-lg font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(cobranca.lateFee)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Observações */}
        {cobranca.observations && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📝 Observações
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{cobranca.observations}</p>
          </div>
        )}
      </main>

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Registrar Pagamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Data do Pagamento</label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Método de Pagamento</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="input"
                >
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                </select>
              </div>
              <div>
                <label className="label">Multa por Atraso (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentData.lateFee}
                  onChange={(e) => setPaymentData({ ...paymentData, lateFee: parseFloat(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea
                  value={paymentData.observations}
                  onChange={(e) => setPaymentData({ ...paymentData, observations: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary"
                disabled={registrarPagamentoMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={() => registrarPagamentoMutation.mutate()}
                className="btn-primary"
                disabled={registrarPagamentoMutation.isPending}
              >
                {registrarPagamentoMutation.isPending ? 'Salvando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
