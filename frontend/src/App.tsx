import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MotoristasListPage } from './pages/motoristas/MotoristasListPage';
import { MotoristaDetailPage } from './pages/motoristas/MotoristaDetailPage';
import { MotoristaFormPage } from './pages/motoristas/MotoristaFormPage';
import { VeiculosListPage } from './pages/veiculos/VeiculosListPage';
import { VeiculoDetailPage } from './pages/veiculos/VeiculoDetailPage';
import { VeiculoFormPage } from './pages/veiculos/VeiculoFormPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/motoristas"
                element={
                  <PrivateRoute>
                    <MotoristasListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/motoristas/novo"
                element={
                  <PrivateRoute>
                    <MotoristaFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/motoristas/:id"
                element={
                  <PrivateRoute>
                    <MotoristaDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/motoristas/:id/editar"
                element={
                  <PrivateRoute>
                    <MotoristaFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/veiculos"
                element={
                  <PrivateRoute>
                    <VeiculosListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/veiculos/novo"
                element={
                  <PrivateRoute>
                    <VeiculoFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/veiculos/:id"
                element={
                  <PrivateRoute>
                    <VeiculoDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/veiculos/:id/editar"
                element={
                  <PrivateRoute>
                    <VeiculoFormPage />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
