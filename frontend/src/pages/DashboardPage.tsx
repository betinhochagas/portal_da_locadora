import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Motoristas</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="text-5xl opacity-50">🚗</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Veículos</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="text-5xl opacity-50">🚙</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Contratos Ativos</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="text-5xl opacity-50">📄</div>
            </div>
          </div>
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

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Contratos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gerenciamento de contratos de locação
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Planos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Configuração de planos de locação
            </p>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Relatórios
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Relatórios e análises financeiras
            </p>
          </div>

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
