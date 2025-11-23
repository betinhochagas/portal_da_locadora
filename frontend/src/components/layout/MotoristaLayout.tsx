import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMotoristaAuth } from '../../contexts/MotoristaAuthContext';
import { Home, FileText, DollarSign, User, LogOut, Car } from 'lucide-react';

interface MotoristaLayoutProps {
  children: ReactNode;
}

export const MotoristaLayout = ({ children }: MotoristaLayoutProps) => {
  const { motorista, logout } = useMotoristaAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
      navigate('/motorista/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-900">Portal do Motorista</h1>
              <p className="text-xs text-gray-600">{motorista?.name || motorista?.nome}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content - com padding bottom para não ficar atrás da navigation */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation - Fixo */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            <NavLink
              to="/motorista/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Home className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                    Início
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/motorista/contratos"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <FileText className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                    Contratos
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/motorista/pagamentos"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <DollarSign className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                    Pagamentos
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/motorista/perfil"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <User className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                    Perfil
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};
