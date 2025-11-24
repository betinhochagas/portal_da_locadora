import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { motoristaContratosService } from '../../services/motorista-contratos.service';
import { 
  ArrowLeft, 
  FileText, 
  Car, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Phone,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

const STATUS_COLORS = {
  ATIVO: 'bg-green-100 text-green-800 border-green-200',
  ENCERRADO: 'bg-gray-100 text-gray-800 border-gray-200',
  SUSPENSO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CANCELADO: 'bg-red-100 text-red-800 border-red-200',
  EM_ANALISE: 'bg-blue-100 text-blue-800 border-blue-200',
} as const;

const STATUS_LABELS = {
  ATIVO: 'Ativo',
  ENCERRADO: 'Encerrado',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
  EM_ANALISE: 'Em Análise',
} as const;

const PAYMENT_STATUS_CONFIG = {
  PAGA: {
    label: 'Paga',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
  },
  PENDENTE: {
    label: 'Pendente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    icon: Clock,
  },
  ATRASADA: {
    label: 'Atrasada',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
  },
  CANCELADA: {
    label: 'Cancelada',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: XCircle,
  },
} as const;

export const MotoristaContratoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const { data: contrato, isLoading, error } = useQuery({
    queryKey: ['motorista-contrato', id],
    queryFn: () => motoristaContratosService.getContrato(id!),
    enabled: !!id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleDownloadPDF = async () => {
    if (!contrato) return;

    setIsDownloading(true);
    setDownloadError('');

    try {
      const token = localStorage.getItem('motorista_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/contratos/${contrato.id}/gerar-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contrato.contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      setDownloadError('Erro ao baixar o contrato. Tente novamente.');
      setTimeout(() => setDownloadError(''), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <MotoristaLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando contrato...</p>
          </div>
        </div>
      </MotoristaLayout>
    );
  }

  if (error || !contrato) {
    return (
      <MotoristaLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Erro ao carregar contrato</h3>
                <p className="text-sm text-red-700">
                  Não foi possível carregar os detalhes do contrato.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/motorista/contratos')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para contratos
            </button>
          </div>
        </div>
      </MotoristaLayout>
    );
  }

  const statusColor = STATUS_COLORS[contrato.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.EM_ANALISE;
  const statusLabel = STATUS_LABELS[contrato.status as keyof typeof STATUS_LABELS] || contrato.status;

  return (
    <MotoristaLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/motorista/contratos')}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Detalhes do Contrato
              </h1>
              <p className="text-blue-100 text-sm">
                Contrato #{contrato.contractNumber}
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{downloadError}</p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Status do Contrato</h2>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Data de Início</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(contrato.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Data de Término</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(contrato.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Veículo */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Veículo</h2>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-purple-700 mb-1">Modelo</p>
                <p className="text-lg font-bold text-purple-900">
                  {contrato.veiculo.brand} {contrato.veiculo.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 mb-1">Placa</p>
                <p className="text-lg font-bold text-purple-900">
                  {contrato.veiculo.plate}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 mb-1">Ano</p>
                <p className="text-lg font-bold text-purple-900">
                  {contrato.veiculo.year}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 mb-1">Categoria</p>
                <p className="text-lg font-bold text-purple-900">
                  {contrato.veiculo.category || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Plano</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-900 mb-3">
              {contrato.plano.name}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-green-700 mb-1">Valor Semanal</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(contrato.plano.weeklyValue)}
                </p>
              </div>
              {contrato.plano.monthlyPrice && (
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-green-700 mb-1">Valor Mensal</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(contrato.plano.monthlyPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filial */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filial</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nome</p>
              <p className="text-lg font-semibold text-gray-900">
                {contrato.filial.name}
              </p>
            </div>
            {contrato.filial.address && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Endereço</p>
                <p className="text-gray-900">{contrato.filial.address}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Telefone</p>
              <a
                href={`tel:${contrato.filial.phone}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                {contrato.filial.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Cobranças */}
        {contrato.cobrancas && contrato.cobrancas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Cobranças</h2>
            </div>
            <div className="space-y-3">
              {contrato.cobrancas.map((cobranca) => {
                const statusConfig = PAYMENT_STATUS_CONFIG[cobranca.status as keyof typeof PAYMENT_STATUS_CONFIG];
                const Icon = statusConfig?.icon || Clock;
                
                return (
                  <div
                    key={cobranca.id}
                    className={`border rounded-lg p-4 ${statusConfig?.bgColor || 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${statusConfig?.color || 'text-gray-600'}`} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(cobranca.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {formatDate(cobranca.dueDate)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${statusConfig?.color || 'text-gray-600'}`}>
                        {statusConfig?.label || cobranca.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MotoristaLayout>
  );
};
