import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import statsService, { type ContratoVencendo } from '../services/statsService';

export function RelatoriosPage() {
  const [filtro, setFiltro] = useState<'vencendo' | 'frota'>('vencendo');
  const [diasVencimento, setDiasVencimento] = useState(30);

  const { data: contratosVencendo, isLoading: loadingContratos } = useQuery({
    queryKey: ['contratos-vencendo', diasVencimento],
    queryFn: () => statsService.getContratosVencendo(diasVencimento),
    enabled: filtro === 'vencendo',
  });

  const { data: distribuicao, isLoading: loadingDistribuicao } = useQuery({
    queryKey: ['distribuicao-frota'],
    queryFn: () => statsService.getDistribuicaoFrota(),
    enabled: filtro === 'frota',
  });

  const exportarCSV = (tipo: 'contratos' | 'frota') => {
    if (tipo === 'contratos' && contratosVencendo) {
      const headers = ['Código', 'Motorista', 'Telefone', 'Veículo', 'Placa', 'Plano', 'Valor Mensal', 'Data Início', 'Data Fim'];
      const rows = contratosVencendo.map(c => [
        c.code,
        c.motorista.name,
        c.motorista.phone,
        `${c.veiculo.brand} ${c.veiculo.model}`,
        c.veiculo.plate,
        c.plano.name,
        c.monthlyAmount.toString(),
        new Date(c.startDate).toLocaleDateString('pt-BR'),
        new Date(c.endDate).toLocaleDateString('pt-BR'),
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contratos-vencendo-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (tipo === 'frota' && distribuicao) {
      const headers = ['Categoria', 'Quantidade'];
      const rows = distribuicao.porCategoria.map(item => [item.categoria, item.quantidade.toString()]);
      
      const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `distribuicao-frota-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
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
                  📊 Relatórios
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Análises e exportação de dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Relatório
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltro('vencendo')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === 'vencendo'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Contratos Vencendo
                </button>
                <button
                  onClick={() => setFiltro('frota')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === 'frota'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Distribuição da Frota
                </button>
              </div>
            </div>

            {filtro === 'vencendo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vencimento em (dias)
                </label>
                <select
                  value={diasVencimento}
                  onChange={(e) => setDiasVencimento(Number(e.target.value))}
                  className="input"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </div>
            )}

            <div className="ml-auto">
              <button
                onClick={() => exportarCSV(filtro === 'vencendo' ? 'contratos' : 'frota')}
                className="btn-primary flex items-center gap-2"
                disabled={(filtro === 'vencendo' && loadingContratos) || (filtro === 'frota' && loadingDistribuicao)}
              >
                📥 Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        {filtro === 'vencendo' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⏰ Contratos Vencendo em {diasVencimento} dias
            </h2>
            {loadingContratos ? (
              <div className="text-center py-12 text-gray-500">
                Carregando dados...
              </div>
            ) : !contratosVencendo || contratosVencendo.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum contrato vencendo neste período
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Motorista
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Veículo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Placa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor Mensal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {contratosVencendo.map((contrato: ContratoVencendo) => {
                      const diasRestantes = Math.ceil(
                        (new Date(contrato.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const urgente = diasRestantes <= 7;

                      return (
                        <tr key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.code}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.motorista.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.motorista.phone}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.veiculo.brand} {contrato.veiculo.model}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.veiculo.plate}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {contrato.plano.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            R$ {contrato.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 dark:text-white">
                                {new Date(contrato.endDate).toLocaleDateString('pt-BR')}
                              </span>
                              {urgente && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                                  {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Link
                              to={`/contratos/${contrato.id}`}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Ver detalhes →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {filtro === 'frota' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🚙 Distribuição por Categoria
              </h2>
              {loadingDistribuicao ? (
                <div className="text-center py-12 text-gray-500">
                  Carregando dados...
                </div>
              ) : (
                <div className="space-y-3">
                  {distribuicao?.porCategoria.map((item) => (
                    <div key={item.categoria} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.categoria}
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {item.quantidade}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Distribuição por Status
              </h2>
              {loadingDistribuicao ? (
                <div className="text-center py-12 text-gray-500">
                  Carregando dados...
                </div>
              ) : (
                <div className="space-y-3">
                  {distribuicao?.porStatus.map((item) => {
                    const statusLabels: Record<string, string> = {
                      DISPONIVEL: 'Disponível',
                      LOCADO: 'Locado',
                      MANUTENCAO: 'Em Manutenção',
                      INATIVO: 'Inativo',
                    };
                    const statusColors: Record<string, string> = {
                      DISPONIVEL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                      LOCADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                      MANUTENCAO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                      INATIVO: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                    };

                    return (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`px-3 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
                          {statusLabels[item.status] || item.status}
                        </span>
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {item.quantidade}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
