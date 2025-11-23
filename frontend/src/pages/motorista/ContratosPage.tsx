import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { FileText, Calendar, DollarSign, MapPin, Phone, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motoristaContratosService, type Contrato } from '../../services/motorista-contratos.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const ContratoCard = ({ contrato }: { contrato: Contrato }) => {
  const statusColor = STATUS_COLORS[contrato.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.EM_ANALISE;
  const statusLabel = STATUS_LABELS[contrato.status as keyof typeof STATUS_LABELS] || contrato.status;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white font-semibold text-lg">
                {contrato.veiculo.brand} {contrato.veiculo.model}
              </h3>
              <p className="text-blue-100 text-sm">{contrato.veiculo.plate}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Contrato Number */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Contrato:</span>
          <span className="font-semibold text-gray-900">{contrato.contractNumber}</span>
        </div>

        {/* Plano */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{contrato.plano.name}</p>
            <p className="text-lg font-bold text-green-600">
              R$ {Number(contrato.plano.weeklyValue).toFixed(2)}/semana
            </p>
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Início</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(contrato.startDate), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          {contrato.endDate && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Fim</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(contrato.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filial */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{contrato.filial.name}</p>
              {contrato.filial.address && (
                <p className="text-xs text-gray-600">{contrato.filial.address}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <a 
              href={`tel:${contrato.filial.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {contrato.filial.phone}
            </a>
          </div>
        </div>

        {/* Cobranças */}
        {contrato.cobrancas && contrato.cobrancas.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Cobranças</p>
            <div className="flex gap-2 flex-wrap">
              {contrato.cobrancas.slice(0, 3).map((cobranca) => (
                <span 
                  key={cobranca.id}
                  className={`text-xs px-2 py-1 rounded ${
                    cobranca.status === 'PAGA' ? 'bg-green-50 text-green-700' :
                    cobranca.status === 'ATRASADA' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  R$ {Number(cobranca.amount).toFixed(2)}
                </span>
              ))}
              {contrato.cobrancas.length > 3 && (
                <span className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-600">
                  +{contrato.cobrancas.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MotoristaContratosPage = () => {
  const { data: contratos, isLoading, error } = useQuery({
    queryKey: ['motorista-contratos'],
    queryFn: motoristaContratosService.getContratos,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  return (
    <MotoristaLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Meus Contratos</h2>
          <p className="text-blue-100 text-sm">
            {contratos ? `${contratos.length} ${contratos.length === 1 ? 'contrato' : 'contratos'}` : 'Carregando...'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Carregando contratos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao carregar contratos</h3>
            <p className="text-red-700 text-sm">Tente novamente mais tarde.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && contratos?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contrato encontrado</h3>
            <p className="text-gray-600">Você ainda não possui contratos registrados.</p>
          </div>
        )}

        {/* Contracts List */}
        {!isLoading && !error && contratos && contratos.length > 0 && (
          <div className="space-y-4">
            {contratos.map((contrato) => (
              <ContratoCard key={contrato.id} contrato={contrato} />
            ))}
          </div>
        )}
      </div>
    </MotoristaLayout>
  );
};
