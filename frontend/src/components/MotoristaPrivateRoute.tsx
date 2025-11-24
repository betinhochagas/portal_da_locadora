import { Navigate, Outlet } from 'react-router-dom';
import { useMotoristaAuth } from '../hooks/useMotoristaAuth';

export const MotoristaPrivateRoute = () => {
  const { isAuthenticated, loading, needsPasswordReset } = useMotoristaAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="text-xl font-medium text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/motorista/login" replace />;
  }

  // Se precisa resetar senha, redirecionar para primeiro acesso
  if (needsPasswordReset) {
    return <Navigate to="/motorista/primeiro-acesso" replace />;
  }

  return <Outlet />;
};
