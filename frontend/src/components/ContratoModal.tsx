import { X, Download, Calendar, User, Car, DollarSign, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { downloadContratoPDF } from '../utils/downloadPDF';
import { useState } from 'react';

interface ContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
}

interface ContratoDetalhado {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  dueDay: number;
  monthlyValue: number;
  deposit: number;
  kmInicial: number;
  motorista: {
    id: string;
    name: string;
    cpf: string | null;
    phone: string;
    cnh: string;
  };
  veiculo: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    currentKm: number;
  };
  plano: {
    id: string;
    name: string;
    category: string;
    monthlyPrice: number;
    kmIncluded: number;
  };
}

export function ContratoModal({ isOpen, onClose, contratoId }: ContratoModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: contrato, isLoading } = useQuery<ContratoDetalhado>({
    queryKey: ['contrato', contratoId],
    queryFn: async () => {
      const response = await api.get(`/contratos/${contratoId}`);
      return response.data;
    },
    enabled: isOpen && !!contratoId,
  });

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      RASCUNHO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      ATIVO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SUSPENSO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      CONCLUIDO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      CANCELADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadPDF = async () => {
    if (!contrato?.id) return;
    
    setIsDownloading(true);
    setErrorMessage(null);
    try {
      await downloadContratoPDF(contrato.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar PDF';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contrato #{contrato?.contractNumber || '...'}
              </h2>
              {contrato && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(contrato.status)}`}>
                  {contrato.status}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : contrato ? (
            <>
              {/* Motorista */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-200">Motorista</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Nome</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">{contrato.motorista.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">CPF</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">{formatCPF(contrato.motorista.cpf)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Telefone</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">{contrato.motorista.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">CNH</div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">{contrato.motorista.cnh}</div>
                  </div>
                </div>
              </div>

              {/* Veículo */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-bold text-green-900 dark:text-green-200">Veículo</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-300">Placa</div>
                    <div className="font-semibold text-green-900 dark:text-green-100">{contrato.veiculo.plate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-300">Modelo</div>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      {contrato.veiculo.brand} {contrato.veiculo.model} {contrato.veiculo.year}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-300">Cor</div>
                    <div className="font-semibold text-green-900 dark:text-green-100">{contrato.veiculo.color}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700 dark:text-green-300">KM Inicial</div>
                    <div className="font-semibold text-green-900 dark:text-green-100">
                      {(contrato.kmInicial || 0).toLocaleString('pt-BR')} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Plano */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-purple-900 dark:text-purple-200">Plano</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Nome</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">{contrato.plano.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Categoria</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">{contrato.plano.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">KM Incluído/mês</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">
                      {(contrato.plano.kmIncluded || 0).toLocaleString('pt-BR')} km
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Valor do Plano</div>
                    <div className="font-semibold text-purple-900 dark:text-purple-100">
                      {formatCurrency(contrato.plano.monthlyPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-bold text-orange-900 dark:text-orange-200">Valores</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Mensalidade</div>
                    <div className="font-semibold text-orange-900 dark:text-orange-100 text-lg">
                      {formatCurrency(contrato.monthlyValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Caução</div>
                    <div className="font-semibold text-orange-900 dark:text-orange-100 text-lg">
                      {formatCurrency(contrato.deposit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Dia de Vencimento</div>
                    <div className="font-semibold text-orange-900 dark:text-orange-100 text-lg">
                      Dia {contrato.dueDay}
                    </div>
                  </div>
                </div>
              </div>

              {/* Período */}
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-200">Período do Contrato</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Data de Início</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(contrato.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Data de Término</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(contrato.endDate)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Erro ao carregar contrato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
