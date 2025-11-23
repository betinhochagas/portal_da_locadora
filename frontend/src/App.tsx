import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MotoristaAuthProvider } from './contexts/MotoristaAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';
import { MotoristaPrivateRoute } from './components/MotoristaPrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MotoristasListPage } from './pages/motoristas/MotoristasListPage';
import { MotoristaDetailPage } from './pages/motoristas/MotoristaDetailPage';
import { MotoristaFormPage } from './pages/motoristas/MotoristaFormPage';
import { VeiculosListPage } from './pages/veiculos/VeiculosListPage';
import { VeiculoDetailPage } from './pages/veiculos/VeiculoDetailPage';
import { VeiculoFormPage } from './pages/veiculos/VeiculoFormPage';
import PlanosListPage from './pages/planos/PlanosListPage';
import PlanoDetailPage from './pages/planos/PlanoDetailPage';
import PlanoFormPage from './pages/planos/PlanoFormPage';
import ContratosListPage from './pages/contratos/ContratosListPage';
import ContratoDetailPage from './pages/contratos/ContratoDetailPage';
import ContratoFormPage from './pages/contratos/ContratoFormPage';
import ContratoWizardPage from './pages/contratos/ContratoWizardPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { CobrancasListPage } from './pages/cobrancas/CobrancasListPage';
import { CobrancaDetailPage } from './pages/cobrancas/CobrancaDetailPage';
import { ManutencoesListPage } from './pages/manutencoes/ManutencoesListPage';
import { ManutencaoDetailPage } from './pages/manutencoes/ManutencaoDetailPage';
import { ManutencaoFormPage } from './pages/manutencoes/ManutencaoFormPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';
import { TemplatesListPage } from './pages/templates/TemplatesListPage';
import { TemplateFormPage } from './pages/templates/TemplateFormPage';
import { TemplateDetailPage } from './pages/templates/TemplateDetailPage';
// Páginas do Portal do Motorista
import { MotoristaLoginPage } from './pages/motorista/LoginPage';
import { PrimeiroAcessoPage } from './pages/motorista/PrimeiroAcessoPage';
import { EsqueciSenhaPage } from './pages/motorista/EsqueciSenhaPage';
import { MotoristaDashboardPage } from './pages/motorista/DashboardPage';
import { MotoristaContratosPage } from './pages/motorista/ContratosPage';
import { MotoristaPagamentosPage } from './pages/motorista/PagamentosPage';
import { MotoristaPerfilPage } from './pages/motorista/PerfilPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <MotoristaAuthProvider>
              <Routes>
                {/* Rotas Admin */}
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
                <Route
                  path="/planos"
                  element={
                    <PrivateRoute>
                      <PlanosListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/planos/novo"
                  element={
                    <PrivateRoute>
                      <PlanoFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/planos/:id"
                  element={
                    <PrivateRoute>
                      <PlanoDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/planos/:id/editar"
                  element={
                    <PrivateRoute>
                      <PlanoFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/contratos"
                  element={
                    <PrivateRoute>
                      <ContratosListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/contratos/novo"
                  element={
                    <PrivateRoute>
                      <ContratoWizardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/contratos/:id"
                  element={
                    <PrivateRoute>
                      <ContratoDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <PrivateRoute>
                      <RelatoriosPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cobrancas"
                  element={
                    <PrivateRoute>
                      <CobrancasListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cobrancas/:id"
                  element={
                    <PrivateRoute>
                      <CobrancaDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/manutencoes"
                  element={
                    <PrivateRoute>
                      <ManutencoesListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/manutencoes/nova"
                  element={
                    <PrivateRoute>
                      <ManutencaoFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/manutencoes/:id"
                  element={
                    <PrivateRoute>
                      <ManutencaoDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/manutencoes/:id/editar"
                  element={
                    <PrivateRoute>
                      <ManutencaoFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <PrivateRoute>
                      <AuditLogsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <PrivateRoute>
                      <TemplatesListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/templates/novo"
                  element={
                    <PrivateRoute>
                      <TemplateFormPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/templates/:id"
                  element={
                    <PrivateRoute>
                      <TemplateDetailPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/templates/:id/editar"
                  element={
                    <PrivateRoute>
                      <TemplateFormPage />
                    </PrivateRoute>
                  }
                />

                {/* Rotas do Portal do Motorista (Públicas) */}
                <Route path="/motorista/login" element={<MotoristaLoginPage />} />
                <Route path="/motorista/primeiro-acesso" element={<PrimeiroAcessoPage />} />
                <Route path="/motorista/esqueci-senha" element={<EsqueciSenhaPage />} />

                {/* Rotas do Portal do Motorista (Protegidas) */}
                <Route element={<MotoristaPrivateRoute />}>
                  <Route path="/motorista/dashboard" element={<MotoristaDashboardPage />} />
                  <Route path="/motorista/contratos" element={<MotoristaContratosPage />} />
                  <Route path="/motorista/pagamentos" element={<MotoristaPagamentosPage />} />
                  <Route path="/motorista/perfil" element={<MotoristaPerfilPage />} />
                </Route>

                {/* Rota raiz - redireciona para admin */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Fallback - mantém contexto (admin ou motorista) */}
                <Route path="/motorista/*" element={<Navigate to="/motorista/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </MotoristaAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
