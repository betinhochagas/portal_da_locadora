import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useQuery } from '@tanstack/react-query';
import statsService from '../services/statsService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertasManutencaoWidget } from '../features/dashboard/AlertasManutencaoWidget';
import { KmRodadosWidget } from '../features/dashboard/KmRodadosWidget';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Buscar dados reais da API
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsService.getDashboardStats(),
  });

  const { data: receitaMensal, isLoading: loadingReceita } = useQuery({
    queryKey: ['receita-mensal'],
    queryFn: () => statsService.getReceitaMensal(6),
  });

  const { data: distribuicao, isLoading: loadingDistribuicao } = useQuery({
    queryKey: ['distribuicao-frota'],
    queryFn: () => statsService.getDistribuicaoFrota(),
  });

  const { data: contratosVencendo } = useQuery({
    queryKey: ['contratos-vencendo'],
    queryFn: () => statsService.getContratosVencendo(30),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    DIRETORIA: 'Diretoria',
    FINANCEIRO: 'Financeiro',
    GESTOR_FROTA: 'Gestor de Frota',
    GERENTE_LOJA: 'Gerente de Loja',
    ATENDENTE: 'Atendente',
    EQUIPE_EXTERNA: 'Equipe Externa',
  };

  // Cores para os gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Dados para o gráfico de pizza (status de contratos)
  const contratosPieData = stats ? [
    { name: 'Ativos', value: stats.contratos.ativos },
    { name: 'Suspensos', value: stats.contratos.suspensos },
    { name: 'Outros', value: stats.contratos.total - stats.contratos.ativos - stats.contratos.suspensos },
  ].filter(item => item.value > 0) : [];

  // Dados para o gráfico de barras (distribuição da frota por categoria)
  const frotaBarData = distribuicao?.porCategoria.map(item => ({
    categoria: item.categoria,
    quantidade: item.quantidade,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🚗 Portal da Locadora
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sistema de Gestão para Motoristas de App
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={handleLogout} className="btn-secondary">
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                👋 Bem-vindo, {user?.name}!
              </h2>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Perfil:</strong>{' '}
                  <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md font-medium">
                    {roleLabels[user?.role || ''] || user?.role}
                  </span>
                </p>
                {user?.filial && (
                  <p>
                    <strong>Filial:</strong> {user.filial.name} ({user.filial.city}/{user.filial.state})
                  </p>
                )}
              </div>
            </div>
            <div className="text-6xl">👤</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Motoristas</p>
                <p className="text-3xl font-bold">
                  {loadingStats ? '...' : stats?.motoristas.total || 0}
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  {loadingStats ? '' : `${stats?.motoristas.ativos || 0} ativos`}
                </p>
              </div>
              <div className="text-5xl opacity-50">🚗</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Veículos</p>
                <p className="text-3xl font-bold">
                  {loadingStats ? '...' : stats?.veiculos.total || 0}
                </p>
                <p className="text-xs text-green-100 mt-1">
                  {loadingStats ? '' : `${stats?.veiculos.disponiveis || 0} disponíveis`}
                </p>
              </div>
              <div className="text-5xl opacity-50">🚙</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Contratos Ativos</p>
                <p className="text-3xl font-bold">
                  {loadingStats ? '...' : stats?.contratos.ativos || 0}
                </p>
                <p className="text-xs text-purple-100 mt-1">
                  {loadingStats ? '' : `${stats?.contratos.vencendo30dias || 0} vencendo`}
                </p>
              </div>
              <div className="text-5xl opacity-50">📄</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Receita Mensal</p>
                <p className="text-3xl font-bold">
                  {loadingStats ? '...' : `R$ ${(stats?.receita.mensalEstimada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </p>
                <p className="text-xs text-amber-100 mt-1">
                  {loadingStats ? '' : `${stats?.veiculos.taxaOcupacao || 0}% ocupação`}
                </p>
              </div>
              <div className="text-5xl opacity-50">💰</div>
            </div>
          </div>
        </div>

        {/* KM Rodados Widget - Full Width */}
        <div className="mb-6">
          <KmRodadosWidget />
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Receita Mensal */}
          <div className="card">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              📈 Receita Mensal (últimos 6 meses)
            </h3>
            {loadingReceita ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Carregando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={receitaMensal}>
                  <XAxis dataKey="mes" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Distribuição de Contratos */}
          <div className="card">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              📊 Contratos por Status
            </h3>
            {loadingStats ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Carregando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contratosPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contratosPieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de Frota por Categoria */}
          <div className="card">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              🚙 Frota por Categoria
            </h3>
            {loadingDistribuicao ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Carregando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={frotaBarData}>
                  <XAxis dataKey="categoria" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Contratos Vencendo */}
          <div className="card">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              ⏰ Contratos Vencendo (30 dias)
            </h3>
            {!contratosVencendo || contratosVencendo.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Nenhum contrato vencendo nos próximos 30 dias
              </div>
            ) : (
              <div className="overflow-auto max-h-64">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Código</th>
                      <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Motorista</th>
                      <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Veículo</th>
                      <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {contratosVencendo.map((contrato) => (
                      <tr key={contrato.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{contrato.code}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{contrato.motorista.name}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{contrato.veiculo.plate}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">
                          {new Date(contrato.endDate).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Manutenção */}
        <div className="mb-6">
          <AlertasManutencaoWidget />
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/motoristas"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Motoristas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cadastro e gerenciamento de motoristas
            </p>
          </Link>

          <Link
            to="/veiculos"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🚙</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Veículos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gestão da frota de veículos
            </p>
          </Link>

          <Link
            to="/planos"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Planos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Configuração de planos de locação
            </p>
          </Link>

          <Link
            to="/contratos"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Contratos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gerenciamento de contratos de locação
            </p>
          </Link>

          <Link
            to="/relatorios"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Relatórios
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Relatórios e análises financeiras
            </p>
          </Link>

          <Link
            to="/cobrancas"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Cobranças
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Controle financeiro e mensalidades
            </p>
          </Link>

          <Link
            to="/manutencoes"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Manutenções
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gestão de manutenções da frota
            </p>
          </Link>

          <Link
            to="/audit-logs"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Auditoria
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Logs de auditoria e histórico de alterações
            </p>
          </Link>

          <Link
            to="/templates"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Templates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Templates customizáveis para contratos em PDF
            </p>
          </Link>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Configurações
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Configurações do sistema e usuários
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
