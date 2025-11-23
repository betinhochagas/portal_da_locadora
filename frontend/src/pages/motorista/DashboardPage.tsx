import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { useMotoristaAuth } from '../../contexts/MotoristaAuthContext';
import { useQuery } from '@tanstack/react-query';
import { motoristaDashboardService } from '../../services/motorista-dashboard.service';
import { FileText, DollarSign, Car, TrendingUp, Clock, Calendar, AlertCircle } from 'lucide-react';

export const MotoristaDashboardPage = () => {
  const { motorista } = useMotoristaAuth();

  // Buscar dados do dashboard
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['motorista-dashboard'],
    queryFn: () => motoristaDashboardService.getDashboard(),
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <MotoristaLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Boas-vindas */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Bem-vindo(a), {motorista?.name || motorista?.nome}!
          </h2>
          <p className="text-blue-100 text-sm">Aqui está um resumo da sua conta</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Erro ao carregar dados</h3>
                <p className="text-sm text-red-700">
                  Não foi possível carregar suas informações. Tente novamente mais tarde.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboard && (
          <>
            {/* Card do Veículo */}
            {dashboard.veiculo ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Seu Veículo</p>
                      <p className="text-2xl font-bold">{dashboard.veiculo.modelo}</p>
                      <p className="text-blue-100 text-sm mt-1">
                        {dashboard.veiculo.placa} • {dashboard.veiculo.ano}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Car className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm">Contrato Ativo</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <div className="bg-gray-100 rounded-xl p-6 text-center">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Nenhum veículo ativo</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Entre em contato com a locadora para iniciar um contrato
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <p className="text-xs text-gray-600 font-medium">Contratos</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboard.contratos.ativos}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboard.contratos.total === 1 
                    ? '1 contrato total'
                    : `${dashboard.contratos.total} contratos no total`}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-xs text-gray-600 font-medium">Pagamentos</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboard.pagamentos.pendentes}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboard.pagamentos.pendentes === 1
                    ? '1 pagamento pendente'
                    : dashboard.pagamentos.pendentes === 0
                    ? 'Tudo em dia!'
                    : `${dashboard.pagamentos.pendentes} pendentes`}
                </p>
              </div>
            </div>

            {/* Próximo Pagamento */}
            {dashboard.pagamentos.proximoPagamento && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Próximo Pagamento
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Valor</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboard.pagamentos.proximoPagamento.valor)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Vencimento</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatDate(dashboard.pagamentos.proximoPagamento.vencimento)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Suas Estatísticas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Tempo conosco
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {dashboard.estatisticas.diasComoMotorista} dias
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Total pago
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(dashboard.estatisticas.totalPago)}
                  </span>
                </div>
              </div>
            </div>

            {/* Avisos */}
            {dashboard.pagamentos.pendentes === 0 && dashboard.contratos.ativos > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Tudo certo!</h4>
                    <p className="text-sm text-green-800">
                      Você não tem pagamentos pendentes. Continue assim!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MotoristaLayout>
  );
};
