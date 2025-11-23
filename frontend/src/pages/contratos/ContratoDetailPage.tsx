import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Contrato } from '../../types/contrato';
import {
  ContractStatus,
  ContractStatusLabels,
  ContractStatusColors,
} from '../../types/contrato';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { downloadContratoPDF } from '../../utils/downloadPDF';

export default function ContratoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    'activate' | 'suspend' | 'reactivate' | 'cancel' | 'complete' | null
  >(null);
  const [reason, setReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');

  const {
    data: contrato,
    isLoading,
    error,
  } = useQuery<Contrato>({
    queryKey: ['contrato', id],
    queryFn: async () => {
      const response = await api.get(`/contratos/${id}`);
      return response.data;
    },
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const actionMutation = useMutation({
    mutationFn: async ({ action, reason }: { action: string; reason?: string }) => {
      const response = await api.post(`/contratos/${id}/${action}`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contrato', id] });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      setShowActionModal(false);
      const actionLabels: Record<string, string> = {
        activate: 'ativado',
        suspend: 'suspenso',
        reactivate: 'reativado',
        cancel: 'cancelado',
        complete: 'concluído'
      };
      setMessage({ type: 'success', text: `Contrato ${actionLabels[actionType || '']} com sucesso!` });
      setActionType(null);
      setReason('');
      // Limpar mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao processar ação. Tente novamente.';
      setMessage({ type: 'error', text: errorMessage });
      setShowActionModal(false);
      setActionType(null);
      setReason('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              Erro ao carregar contrato. Tente novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canManage = ['ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'FINANCEIRO'].includes(
    user?.role || '',
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDownloadPDF = async () => {
    if (!contrato?.id) return;
    
    setIsDownloading(true);
    try {
      await downloadContratoPDF(contrato.id);
      setMessage({ type: 'success', text: 'PDF baixado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar PDF';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenEmailModal = () => {
    setEmailRecipient(contrato?.motorista?.email || '');
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!contrato?.id) return;
    
    setIsSendingEmail(true);
    try {
      await api.post(`/contratos/${contrato.id}/enviar-email`, {
        email: emailRecipient,
      });
      setMessage({ type: 'success', text: `Email enviado com sucesso para ${emailRecipient}!` });
      setShowEmailModal(false);
      setTimeout(() => setMessage(null), 5000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao enviar email';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatCpfCnpj = (cpf: string | null, cnpj: string | null) => {
    if (cpf) return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (cnpj) return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return 'N/A';
  };

  const handleAction = (action: typeof actionType) => {
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (!actionType) return;
    actionMutation.mutate({ action: actionType, reason });
  };

  const statusColors = ContractStatusColors[contrato.status as ContractStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Contrato {contrato.contractNumber}
            </h1>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.darkBg} ${statusColors.darkText}`}
            >
              {ContractStatusLabels[contrato.status as ContractStatus]}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? '⏳ Gerando PDF...' : '📄 Baixar PDF'}
            </button>
            <button
              onClick={handleOpenEmailModal}
              disabled={isSendingEmail}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? '⏳ Enviando...' : '📧 Enviar por Email'}
            </button>
            <Link to="/contratos" className="btn-secondary">
              Voltar
            </Link>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Dados do Motorista */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Motorista
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nome</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {contrato.motorista?.name}
                </p>
              </div>
              <div>
                <label className="label">CPF/CNPJ</label>
                <p className="text-gray-900 dark:text-white">
                  {formatCpfCnpj(
                    contrato.motorista?.cpf || null,
                    contrato.motorista?.cnpj || null,
                  )}
                </p>
              </div>
              <div>
                <label className="label">Telefone</label>
                <p className="text-gray-900 dark:text-white">
                  {contrato.motorista?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Veículo
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Placa</label>
                <p className="text-gray-900 dark:text-white font-bold text-lg">
                  {contrato.veiculo?.plate}
                </p>
              </div>
              <div>
                <label className="label">Marca/Modelo</label>
                <p className="text-gray-900 dark:text-white">
                  {contrato.veiculo?.brand} {contrato.veiculo?.model}
                </p>
              </div>
              <div>
                <label className="label">Ano/Categoria</label>
                <p className="text-gray-900 dark:text-white">
                  {contrato.veiculo?.year} - {contrato.veiculo?.category}
                </p>
              </div>
            </div>
          </div>

          {/* Dados do Plano */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Plano
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nome do Plano</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {contrato.plano?.name}
                </p>
              </div>
              <div>
                <label className="label">Valor Mensal</label>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(contrato.monthlyAmount)}
                </p>
              </div>
              <div>
                <label className="label">Dia de Vencimento</label>
                <p className="text-gray-900 dark:text-white">Dia {contrato.billingDay}</p>
              </div>
            </div>
          </div>

          {/* Dados do Período */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Período e Valores
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">Início</label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(contrato.startDate)}
                </p>
              </div>
              <div>
                <label className="label">Término</label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(contrato.endDate)}
                </p>
              </div>
              {contrato.deposit && (
                <div>
                  <label className="label">Caução</label>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrency(contrato.deposit)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quilometragem */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Quilometragem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">KM Inicial</label>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">
                {contrato.kmStart.toLocaleString('pt-BR')}
              </p>
            </div>
            {contrato.kmCurrent && (
              <>
                <div>
                  <label className="label">KM Atual</label>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">
                    {contrato.kmCurrent.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="label">KM Rodados</label>
                  <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                    {(contrato.kmCurrent - contrato.kmStart).toLocaleString('pt-BR')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Observações */}
        {contrato.notes && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Observações
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {contrato.notes}
            </p>
          </div>
        )}

        {/* Ações */}
        {canManage && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Ações
            </h2>
            <div className="flex flex-wrap gap-2">
              {contrato.status === 'RASCUNHO' && (
                <button
                  onClick={() => handleAction('activate')}
                  className="btn-primary"
                >
                  Ativar Contrato
                </button>
              )}
              {contrato.status === 'ATIVO' && (
                <>
                  <button
                    onClick={() => handleAction('suspend')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                  >
                    Suspender
                  </button>
                  <button
                    onClick={() => handleAction('complete')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Concluir
                  </button>
                </>
              )}
              {contrato.status === 'SUSPENSO' && (
                <button
                  onClick={() => handleAction('reactivate')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Reativar
                </button>
              )}
              {['ATIVO', 'SUSPENSO', 'RASCUNHO'].includes(contrato.status) && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar Contrato
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal de Confirmação */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar Ação
              </h3>
              {(actionType === 'suspend' || actionType === 'cancel') && (
                <div className="mb-4">
                  <label className="label">Motivo</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input"
                    rows={3}
                    required
                  />
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem certeza que deseja{' '}
                {actionType === 'activate' && 'ativar'}
                {actionType === 'suspend' && 'suspender'}
                {actionType === 'reactivate' && 'reativar'}
                {actionType === 'cancel' && 'cancelar'}
                {actionType === 'complete' && 'concluir'} este contrato?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionType(null);
                    setReason('');
                  }}
                  className="btn-secondary"
                  disabled={actionMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction}
                  className="btn-primary"
                  disabled={
                    actionMutation.isPending ||
                    ((actionType === 'suspend' || actionType === 'cancel') && !reason)
                  }
                >
                  {actionMutation.isPending ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Envio de Email */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📧 Enviar Contrato por Email
              </h3>
              <div className="mb-4">
                <label className="label">Email do Destinatário</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="input"
                  placeholder="email@exemplo.com"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  O PDF do contrato será anexado ao email
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailRecipient('');
                  }}
                  className="btn-secondary"
                  disabled={isSendingEmail}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendEmail}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingEmail || !emailRecipient}
                >
                  {isSendingEmail ? '⏳ Enviando...' : '📧 Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
