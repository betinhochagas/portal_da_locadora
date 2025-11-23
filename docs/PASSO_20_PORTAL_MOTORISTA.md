# PASSO 20 - Portal do Motorista (App Web)

**Data de criação:** 23/11/2025  
**Status:** 📋 EM PLANEJAMENTO  
**Prioridade:** 🔥 CRÍTICA  
**Complexidade:** Alta  
**Tempo estimado:** 5-7 dias

---

## 📋 Índice

- [Contexto e Justificativa](#contexto-e-justificativa)
- [Objetivos](#objetivos)
- [Arquitetura](#arquitetura)
- [Especificação Backend](#especificação-backend)
- [Especificação Frontend](#especificação-frontend)
- [Fluxo Completo](#fluxo-completo)
- [Segurança](#segurança)
- [Validações](#validações)
- [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Contexto e Justificativa

### Situação Atual

**O que já funciona:**
- ✅ Admin cria contratos pelo painel administrativo
- ✅ Sistema gera PDF do contrato automaticamente
- ✅ Sistema envia PDF por email para o motorista

**Problema identificado:**
- ❌ Motorista não tem onde acessar seus dados online
- ❌ Motorista não consegue baixar contrato novamente se perder o email
- ❌ Motorista não vê histórico de pagamentos
- ❌ Motorista não sabe quando vence a próxima parcela
- ❌ Motorista não tem visibilidade do status do contrato
- ❌ Toda comunicação depende de telefone ou email

### Solução Proposta

Criar **Portal do Motorista** - uma interface web dedicada onde o motorista pode:

1. **Acessar** seus dados de forma segura (login com CPF + senha)
2. **Visualizar** contratos ativos e histórico
3. **Baixar** PDF do contrato a qualquer momento
4. **Acompanhar** histórico de pagamentos (pagas/pendentes/atrasadas)
5. **Ver** dashboard com informações do veículo atual
6. **Receber** notificações sobre pagamentos e documentos

---

## 🎯 Objetivos

### Objetivos Principais

1. **Autonomia do motorista:** Acesso 24/7 aos seus dados sem depender de atendimento
2. **Transparência:** Visibilidade total de pagamentos e contratos
3. **Conveniência:** Download de documentos a qualquer momento
4. **Redução de chamados:** Motoristas resolvem dúvidas sozinhos
5. **Profissionalismo:** Experiência digital moderna

### Objetivos Secundários

- Reduzir carga de trabalho do atendimento
- Melhorar satisfação do motorista
- Facilitar cobrança (motorista vê status em tempo real)
- Preparar terreno para futuras features (pagamento online, chat)

### 🎨 Princípios de Design

**Mobile-First:**
- Interface otimizada para smartphone (maioria dos motoristas usa mobile)
- Aparência de app nativo (não deve parecer "site desktop adaptado")
- Layout clean, cards grandes, botões touch-friendly
- Navegação por bottom navigation bar (típico de apps)
- Gestos mobile (swipe, pull-to-refresh quando aplicável)
- Performance otimizada para 3G/4G

**Progressive Web App (PWA-like):**
- Mesmo sendo web, deve ter feel de app instalado
- Splash screen ao carregar
- Ícones e cores consistentes com branding
- Sem chrome do navegador visível (meta tags viewport)
- Responsivo mas pensado mobile-first

**Desktop:**
- Desktop é secundário (mas funcional)
- Layout centralizado com largura máxima (não full-width)
- Mantém aparência de app mobile mesmo em tela grande

---

## 🏗️ Arquitetura

### Diagrama de Alto Nível

```
┌─────────────────┐         ┌─────────────────┐
│  Admin Frontend │         │Motorista Frontend│
│   (React App)   │         │   (React App)    │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │  JWT (role: admin)        │  JWT (role: motorista)
         │                           │
         └────────┬──────────────────┘
                  │
         ┌────────▼────────┐
         │   Backend API   │
         │   (NestJS)      │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │   (Prisma ORM)  │
         └─────────────────┘
```

### Separação de Contextos

**Admin Area** (`/admin/*`)
- Acesso: usuários com roles (ADMIN, GERENTE, ATENDENTE, etc.)
- JWT claim: `{ userId, role, filialId }`
- Funcionalidades: CRUD de motoristas, veículos, contratos

**Motorista Area** (`/motorista/*`)
- Acesso: motoristas cadastrados
- JWT claim: `{ motoristaId, type: 'motorista' }`
- Funcionalidades: visualização de dados próprios (read-only)

---

## 🔧 Especificação Backend

### 1. Autenticação do Motorista

#### Model (Prisma Schema)

Adicionar campos ao model `Motorista`:

```prisma
model Motorista {
  // ... campos existentes ...
  
  // Novos campos para autenticação
  password      String?  // Hash bcrypt da senha
  passwordReset Boolean @default(true) // Forçar troca de senha no primeiro login
  lastLogin     DateTime?
  loginAttempts Int     @default(0)
  lockedUntil   DateTime?
}
```

#### Migration

```bash
npx prisma migrate dev --name add_motorista_auth_fields
```

#### Endpoints de Autenticação

**POST /auth/motorista/login**
- Body: `{ cpf: string, password: string }`
- Retorna: `{ accessToken: string, motorista: { id, name, email } }`
- Validações:
  - CPF deve existir e estar ativo
  - Senha deve estar correta
  - Motorista não pode estar bloqueado (blacklisted)
  - Após 5 tentativas falhas, bloqueia por 15 minutos

**POST /auth/motorista/primeiro-acesso**
- Body: `{ cpf: string, senhaAtual: string, novaSenha: string }`
- Troca senha gerada automaticamente pela escolhida pelo motorista
- Marca `passwordReset = false`

**POST /auth/motorista/esqueci-senha**
- Body: `{ cpf: string, email: string }`
- Envia email com token de reset
- Token expira em 1 hora

**POST /auth/motorista/reset-senha**
- Body: `{ token: string, novaSenha: string }`
- Valida token e troca senha

#### Strategy JWT para Motorista

```typescript
// backend/src/modules/auth/strategies/motorista-jwt.strategy.ts
@Injectable()
export class MotoristaJwtStrategy extends PassportStrategy(Strategy, 'motorista-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'motorista') {
      throw new UnauthorizedException('Token inválido');
    }

    const motorista = await this.prisma.motorista.findUnique({
      where: { id: payload.motoristaId },
    });

    if (!motorista || !motorista.active) {
      throw new UnauthorizedException('Motorista inativo');
    }

    return motorista;
  }
}
```

#### Guard para Rotas do Motorista

```typescript
// backend/src/common/guards/motorista-auth.guard.ts
@Injectable()
export class MotoristaAuthGuard extends AuthGuard('motorista-jwt') {}
```

### 2. Endpoints do Portal do Motorista

**GET /motorista/perfil**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: dados do motorista logado
- Campos: name, email, phone, cpf, cnh, cnhExpiry, address, active

**GET /motorista/contratos**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: lista de contratos do motorista
- Query params:
  - `status?: ContractStatus` (filtro opcional)
  - `page?: number, limit?: number` (paginação)
- Inclui: veiculo, plano, filial
- Ordenação: mais recentes primeiro

**GET /motorista/contratos/:id**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: detalhes completos do contrato
- Validação: verifica se contrato pertence ao motorista logado
- Inclui: veiculo, plano, filial, motorista

**GET /motorista/contratos/:id/pdf**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: PDF do contrato (stream)
- Validação: verifica se contrato pertence ao motorista logado
- Usa: `PdfGeneratorService.gerarPDF(contratoId)`

**GET /motorista/cobrancas**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: histórico de cobranças do motorista
- Query params:
  - `status?: PaymentStatus` (filtro opcional)
  - `contratoId?: string` (filtro por contrato)
  - `page?: number, limit?: number`
- Inclui: contrato.contractNumber
- Ordenação: mais recentes primeiro

**GET /motorista/dashboard**
- Guard: `@UseGuards(MotoristaAuthGuard)`
- Retorna: estatísticas e resumo
- Dados:
  - Contrato ativo (se houver)
  - Veículo atual (placa, modelo, marca)
  - Próxima cobrança (valor, data vencimento, dias restantes)
  - Total pago (últimos 12 meses)
  - Total pendente
  - Cobranças atrasadas (count)
  - KM rodados (se houver histórico)

### 3. Service Layer

**MotoristaPortalService**

```typescript
@Injectable()
export class MotoristaPortalService {
  constructor(
    private prisma: PrismaService,
    private pdfGenerator: PdfGeneratorService,
  ) {}

  // Busca perfil do motorista
  async getPerfil(motoristaId: string) { ... }

  // Lista contratos com filtros
  async getContratos(motoristaId: string, filters: FilterDto) { ... }

  // Detalhes de um contrato específico
  async getContratoById(motoristaId: string, contratoId: string) { ... }

  // Gera PDF do contrato
  async getContratoPdf(motoristaId: string, contratoId: string) { ... }

  // Lista cobranças com filtros
  async getCobrancas(motoristaId: string, filters: FilterDto) { ... }

  // Dashboard com estatísticas
  async getDashboard(motoristaId: string) { ... }
}
```

### 4. Geração Automática de Senha

**Quando criar motorista (no `motoristas.service.ts`):**

```typescript
async create(dto: CreateMotoristaDto) {
  // Gera senha aleatória (8 caracteres)
  const senhaGerada = this.gerarSenhaAleatoria();
  const passwordHash = await bcrypt.hash(senhaGerada, 10);

  const motorista = await this.prisma.motorista.create({
    data: {
      ...dto,
      password: passwordHash,
      passwordReset: true, // Força troca no primeiro login
    },
  });

  // Envia email com credenciais
  await this.mailService.enviarCredenciaisAcesso(
    motorista.email,
    motorista.name,
    motorista.cpf,
    senhaGerada,
  );

  return motorista;
}

private gerarSenhaAleatoria(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let senha = '';
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}
```

### 5. Template de Email com Credenciais

**MailService - método `enviarCredenciaisAcesso`**

```typescript
async enviarCredenciaisAcesso(
  email: string,
  nome: string,
  cpf: string,
  senha: string,
) {
  const assunto = 'Acesso ao Portal do Motorista - Portal da Locadora';
  
  const html = `
    <h2>Bem-vindo ao Portal da Locadora, ${nome}!</h2>
    
    <p>Seu cadastro foi realizado com sucesso.</p>
    
    <p>Você agora tem acesso ao <strong>Portal do Motorista</strong>, onde poderá:</p>
    <ul>
      <li>Visualizar seus contratos</li>
      <li>Baixar documentos (PDF)</li>
      <li>Acompanhar pagamentos</li>
      <li>Ver informações do veículo</li>
    </ul>
    
    <h3>Suas credenciais de acesso:</h3>
    <p><strong>CPF:</strong> ${cpf}</p>
    <p><strong>Senha:</strong> ${senha}</p>
    
    <p><strong>⚠️ IMPORTANTE:</strong> Por segurança, você deverá trocar esta senha no primeiro acesso.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/motorista/login" style="...">
      Acessar Portal do Motorista
    </a></p>
    
    <p>Qualquer dúvida, entre em contato conosco.</p>
    
    <p>Atenciosamente,<br>Equipe Portal da Locadora</p>
  `;

  await this.transporter.sendMail({
    to: email,
    subject: assunto,
    html,
  });
}
```

### 6. Modificar Envio de Email ao Criar Contrato

**No `contratos.service.ts` (método `create`):**

```typescript
async create(dto: CreateContratoDto, userId: string) {
  // ... lógica existente de criação do contrato ...

  // Após criar o contrato, gera PDF e envia email
  const pdfBuffer = await this.pdfGenerator.gerarPDF(contrato.id);
  
  await this.mailService.enviarContratoPDF(
    motorista.email,
    motorista.name,
    contrato.contractNumber,
    pdfBuffer,
    true, // incluirLinkPortal = true
  );

  return contrato;
}
```

**Modificar `enviarContratoPDF` no MailService:**

```typescript
async enviarContratoPDF(
  email: string,
  nome: string,
  numeroContrato: string,
  pdfBuffer: Buffer,
  incluirLinkPortal = false, // novo parâmetro
) {
  let html = `
    <h2>Olá, ${nome}!</h2>
    <p>Segue em anexo o contrato de locação.</p>
    <p><strong>Número do contrato:</strong> ${numeroContrato}</p>
  `;

  if (incluirLinkPortal) {
    html += `
      <hr>
      <h3>📱 Portal do Motorista</h3>
      <p>Você pode acessar seu contrato e acompanhar pagamentos a qualquer momento no Portal do Motorista:</p>
      <p><a href="${process.env.FRONTEND_URL}/motorista/login">Acessar Portal do Motorista</a></p>
      <p><small>Use seu CPF e senha para fazer login.</small></p>
    `;
  }

  html += `
    <p>Qualquer dúvida, entre em contato.</p>
    <p>Atenciosamente,<br>Portal da Locadora</p>
  `;

  await this.transporter.sendMail({
    to: email,
    subject: `Contrato de Locação - ${numeroContrato}`,
    html,
    attachments: [
      {
        filename: `contrato-${numeroContrato}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
```

---

## 🎨 Especificação Frontend

### 1. Estrutura de Rotas

```typescript
// frontend/src/App.tsx

// Rotas do Motorista (novas)
<Route path="/motorista">
  <Route path="login" element={<MotoristaLoginPage />} />
  <Route element={<MotoristaPrivateRoute />}>
    <Route path="dashboard" element={<MotoristaDashboardPage />} />
    <Route path="contratos" element={<MotoristaContratosPage />} />
    <Route path="contratos/:id" element={<MotoristaContratoDetailPage />} />
    <Route path="pagamentos" element={<MotoristaPagamentosPage />} />
    <Route path="perfil" element={<MotoristaPerfilPage />} />
    <Route path="primeiro-acesso" element={<MotoristaPrimeiroAcessoPage />} />
  </Route>
</Route>

// Rotas Admin (existentes)
<Route path="/" element={<PrivateRoute />}>
  <Route path="dashboard" element={<DashboardPage />} />
  // ... demais rotas admin ...
</Route>
```

### 2. Context de Autenticação do Motorista

```typescript
// frontend/src/contexts/MotoristaAuthContext.tsx

interface MotoristaAuthContextData {
  motorista: Motorista | null;
  loading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  primeiroAcesso: (senhaAtual: string, novaSenha: string) => Promise<void>;
}

export function MotoristaAuthProvider({ children }: PropsWithChildren) {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica token ao carregar
    const token = localStorage.getItem('motoristaToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Busca dados do motorista
      motoristaService.getPerfil().then(setMotorista).catch(logout);
    }
    setLoading(false);
  }, []);

  async function login(cpf: string, senha: string) {
    const response = await motoristaAuthService.login(cpf, senha);
    
    localStorage.setItem('motoristaToken', response.accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
    
    setMotorista(response.motorista);
  }

  function logout() {
    localStorage.removeItem('motoristaToken');
    delete api.defaults.headers.common['Authorization'];
    setMotorista(null);
  }

  async function primeiroAcesso(senhaAtual: string, novaSenha: string) {
    await motoristaAuthService.primeiroAcesso(senhaAtual, novaSenha);
    // Força novo login com nova senha
    logout();
  }

  return (
    <MotoristaAuthContext.Provider value={{ motorista, loading, login, logout, primeiroAcesso }}>
      {children}
    </MotoristaAuthContext.Provider>
  );
}
```

### 3. Layout do Portal do Motorista

**Design Mobile-First:**
- Header fixo no topo (sticky)
- Bottom navigation bar fixo (típico de apps)
- Conteúdo scrollável entre header e bottom nav
- Cards com sombras suaves e cantos arredondados
- Espaçamento generoso para touch (min 44x44px)
- Cores vibrantes e gradientes (feel de app moderno)

```typescript
// frontend/src/components/layout/MotoristaLayout.tsx

export function MotoristaLayout() {
  const { motorista, logout } = useMotoristaAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Portal do Motorista</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Olá, {motorista?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={logout} className="btn-secondary">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation (Mobile-First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg z-50 max-w-2xl mx-auto">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/motorista/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs font-medium">Início</span>
          </NavLink>
          <NavLink
            to="/motorista/contratos"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs font-medium">Contratos</span>
          </NavLink>
          <NavLink
            to="/motorista/pagamentos"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <DollarSign className="h-6 w-6" />
            <span className="text-xs font-medium">Pagamentos</span>
          </NavLink>
          <NavLink
            to="/motorista/perfil"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Perfil</span>
          </NavLink>
        </div>
      </nav>

      {/* Content (com padding bottom para bottom nav) */}
      <main className="px-4 py-6 pb-20">
        <Outlet />
      </main>
    </div>
  );
}
```

### 4. Página de Login do Motorista

```typescript
// frontend/src/pages/motorista/MotoristaLoginPage.tsx

export function MotoristaLoginPage() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useMotoristaAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(cpf, senha);
      navigate('/motorista/dashboard');
    } catch (err: any) {
      if (err.response?.data?.passwordReset) {
        // Primeiro acesso - redireciona para troca de senha
        navigate('/motorista/primeiro-acesso', { state: { cpf, senha } });
      } else {
        setError(err.response?.data?.message || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Car className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Portal do Motorista</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Acesse sua conta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 5. Dashboard do Motorista

```typescript
// frontend/src/pages/motorista/MotoristaDashboardPage.tsx

export function MotoristaDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['motorista-dashboard'],
    queryFn: () => motoristaService.getDashboard(),
  });

  if (isLoading) return <LoadingSpinner />;

  const { contratoAtivo, proximaCobranca, totalPago, totalPendente, atrasadas } = dashboard;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meu Painel</h1>

      {/* Alerta de cobranças atrasadas */}
      {atrasadas > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Você tem {atrasadas} cobrança(s) atrasada(s)
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Entre em contato com a locadora para regularizar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card do Veículo Atual */}
      {contratoAtivo && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Veículo Atual</p>
              <h2 className="text-2xl font-bold mb-2">
                {contratoAtivo.veiculo.brand} {contratoAtivo.veiculo.model}
              </h2>
              <p className="text-blue-100">Placa: {contratoAtivo.veiculo.plate}</p>
              <p className="text-blue-100">Contrato: {contratoAtivo.contractNumber}</p>
            </div>
            <Car className="h-16 w-16 text-blue-200 opacity-50" />
          </div>

          <div className="mt-6 pt-4 border-t border-blue-400">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">KM Rodados</span>
              <span className="text-xl font-bold">
                {(contratoAtivo.kmCurrent - contratoAtivo.kmStart).toLocaleString()} km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Próximo Pagamento"
          value={`R$ ${proximaCobranca?.amount.toFixed(2) || '0,00'}`}
          subtitle={proximaCobranca ? `Vence em ${diasAteVencimento(proximaCobranca.dueDate)} dias` : 'Nenhum'}
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
        />

        <StatsCard
          title="Total Pago (12 meses)"
          value={`R$ ${totalPago.toFixed(2)}`}
          subtitle="Histórico completo"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />

        <StatsCard
          title="Pendente"
          value={`R$ ${totalPendente.toFixed(2)}`}
          subtitle={atrasadas > 0 ? `${atrasadas} em atraso` : 'Em dia'}
          icon={<DollarSign className="h-6 w-6" />}
          color={atrasadas > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/motorista/contratos"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Ver Contratos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Histórico completo
              </p>
            </div>
          </Link>

          <Link
            to="/motorista/pagamentos"
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Ver Pagamentos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cobranças e histórico
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 6. Lista de Contratos do Motorista

```typescript
// frontend/src/pages/motorista/MotoristaContratosPage.tsx

export function MotoristaContratosPage() {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');

  const { data: contratos, isLoading } = useQuery({
    queryKey: ['motorista-contratos', statusFilter],
    queryFn: () => motoristaService.getContratos(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Contratos</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input w-auto"
        >
          <option value="ALL">Todos</option>
          <option value="ATIVO">Ativos</option>
          <option value="CONCLUIDO">Concluídos</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : contratos.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Nenhum contrato encontrado"
          description="Você ainda não possui contratos."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contratos.map((contrato) => (
            <ContratoCard key={contrato.id} contrato={contrato} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContratoCard({ contrato }: { contrato: Contrato }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{contrato.contractNumber}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {contrato.veiculo.brand} {contrato.veiculo.model} - {contrato.veiculo.plate}
          </p>
        </div>
        <StatusBadge status={contrato.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Início</p>
          <p className="font-medium">{formatDate(contrato.startDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Término</p>
          <p className="font-medium">{formatDate(contrato.endDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plano</p>
          <p className="font-medium">{contrato.plano.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Mensal</p>
          <p className="font-medium">R$ {contrato.monthlyAmount.toFixed(2)}</p>
        </div>
      </div>

      <Link
        to={`/motorista/contratos/${contrato.id}`}
        className="btn-primary w-full"
      >
        Ver Detalhes
      </Link>
    </div>
  );
}
```

### 7. Detalhes do Contrato com Download de PDF

```typescript
// frontend/src/pages/motorista/MotoristaContratoDetailPage.tsx

export function MotoristaContratoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { data: contrato, isLoading } = useQuery({
    queryKey: ['motorista-contrato', id],
    queryFn: () => motoristaService.getContratoById(id!),
  });

  async function handleDownloadPdf() {
    try {
      setDownloadingPdf(true);
      await motoristaService.downloadContratoPdf(id!);
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{contrato.contractNumber}</h1>
          <StatusBadge status={contrato.status} className="mt-2" />
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="btn-primary"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Baixar Contrato PDF
            </>
          )}
        </button>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Veículo */}
        <InfoCard
          title="🚗 Veículo"
          items={[
            { label: 'Placa', value: contrato.veiculo.plate },
            { label: 'Marca/Modelo', value: `${contrato.veiculo.brand} ${contrato.veiculo.model}` },
            { label: 'Ano', value: contrato.veiculo.year },
            { label: 'Cor', value: contrato.veiculo.color },
          ]}
        />

        {/* Plano */}
        <InfoCard
          title="📋 Plano"
          items={[
            { label: 'Nome', value: contrato.plano.name },
            { label: 'Valor Mensal', value: `R$ ${contrato.monthlyAmount.toFixed(2)}` },
            { label: 'KM Inclusos', value: contrato.plano.kmIncluded ? `${contrato.plano.kmIncluded.toLocaleString()} km/mês` : 'Ilimitado' },
            { label: 'Dia Vencimento', value: contrato.billingDay },
          ]}
        />

        {/* Período */}
        <InfoCard
          title="📅 Período"
          items={[
            { label: 'Data Início', value: formatDate(contrato.startDate) },
            { label: 'Data Término', value: formatDate(contrato.endDate) },
            { label: 'Duração', value: `${calcularDuracao(contrato.startDate, contrato.endDate)} dias` },
          ]}
        />

        {/* Quilometragem */}
        <InfoCard
          title="📊 Quilometragem"
          items={[
            { label: 'KM Inicial', value: contrato.kmStart.toLocaleString() },
            { label: 'KM Atual', value: (contrato.kmCurrent || contrato.kmStart).toLocaleString() },
            { label: 'KM Rodados', value: ((contrato.kmCurrent || contrato.kmStart) - contrato.kmStart).toLocaleString() },
          ]}
        />
      </div>

      {/* Observações */}
      {contrato.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Observações</h2>
          <p className="text-gray-700 dark:text-gray-300">{contrato.notes}</p>
        </div>
      )}
    </div>
  );
}
```

### 8. Histórico de Pagamentos

```typescript
// frontend/src/pages/motorista/MotoristaPagamentosPage.tsx

export function MotoristaPagamentosPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const { data: cobrancas, isLoading } = useQuery({
    queryKey: ['motorista-cobrancas', statusFilter],
    queryFn: () => motoristaService.getCobrancas(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Pagamentos</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input w-auto"
        >
          <option value="ALL">Todos</option>
          <option value="PAGA">Pagas</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="ATRASADA">Atrasadas</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Referência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Pagamento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {cobrancas.map((cobranca) => (
                <tr key={cobranca.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{cobranca.referenceMonth}</p>
                      <p className="text-sm text-gray-500">{cobranca.contrato.contractNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(cobranca.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    R$ {cobranca.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={cobranca.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cobranca.paymentDate
                      ? `${formatDate(cobranca.paymentDate)} - ${cobranca.paymentMethod}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Fluxo Completo

### 1. Cadastro do Motorista (Admin)

```
1. Admin acessa /motoristas/novo
2. Preenche formulário (nome, CPF, email, CNH, etc.)
3. Clica em "Salvar"
4. Backend:
   - Valida dados
   - Gera senha aleatória (8 caracteres)
   - Cria hash bcrypt da senha
   - Salva motorista com password e passwordReset=true
   - Envia email com:
     ✉️ Assunto: "Acesso ao Portal do Motorista"
     📄 Corpo: Boas-vindas + CPF + senha + link do portal
5. Frontend: Confirma criação e redireciona para /motoristas/:id/editar
```

### 2. Criação de Contrato (Admin)

```
1. Admin cria contrato vinculando motorista + veículo + plano
2. Backend:
   - Valida e cria contrato
   - Gera PDF do contrato
   - Envia email com:
     ✉️ Assunto: "Contrato de Locação - [NUMERO]"
     📎 Anexo: PDF do contrato
     📄 Corpo: Saudação + instruções + link para portal
3. Motorista recebe email
```

### 3. Primeiro Acesso do Motorista

```
1. Motorista abre email e clica no link do portal
2. Acessa /motorista/login
3. Digita CPF e senha recebida por email
4. Backend valida credenciais
5. Se passwordReset=true:
   - Redireciona para /motorista/primeiro-acesso
   - Motorista digita senha atual e nova senha
   - Backend valida, atualiza senha, marca passwordReset=false
   - Força novo login com nova senha
6. Motorista faz login novamente
7. Redireciona para /motorista/dashboard
```

### 4. Uso Normal do Portal

```
1. Motorista acessa /motorista/login
2. Faz login com CPF + senha
3. Navega entre:
   - Dashboard (visão geral)
   - Contratos (lista e detalhes)
   - Pagamentos (histórico)
   - Perfil (dados pessoais)
4. Baixa PDF do contrato sempre que necessário
5. Faz logout ao terminar
```

---

## 🔐 Segurança

### Autenticação JWT Separada

**Admin JWT:**
```json
{
  "userId": "uuid",
  "role": "ADMIN",
  "filialId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Motorista JWT:**
```json
{
  "motoristaId": "uuid",
  "type": "motorista",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Guards de Proteção

**MotoristaAuthGuard:**
- Valida token JWT
- Verifica claim `type === 'motorista'`
- Busca motorista no banco
- Verifica se motorista está ativo
- Injeta motorista no request

**Validação de Ownership:**
```typescript
// Em cada endpoint, valida se o recurso pertence ao motorista
async getContratoById(motoristaId: string, contratoId: string) {
  const contrato = await this.prisma.contrato.findUnique({
    where: { id: contratoId },
  });

  // CRÍTICO: Verifica se contrato pertence ao motorista
  if (contrato.motoristaId !== motoristaId) {
    throw new ForbiddenException('Acesso negado');
  }

  return contrato;
}
```

### Proteção contra Brute Force

```typescript
// Após 5 tentativas falhas, bloqueia por 15 minutos
async login(cpf: string, senha: string) {
  const motorista = await this.prisma.motorista.findUnique({ where: { cpf } });

  // Verifica se está bloqueado
  if (motorista.lockedUntil && motorista.lockedUntil > new Date()) {
    throw new UnauthorizedException('Conta temporariamente bloqueada');
  }

  // Valida senha
  const senhaValida = await bcrypt.compare(senha, motorista.password);

  if (!senhaValida) {
    // Incrementa tentativas
    await this.prisma.motorista.update({
      where: { id: motorista.id },
      data: {
        loginAttempts: motorista.loginAttempts + 1,
        lockedUntil: motorista.loginAttempts >= 4
          ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
          : null,
      },
    });

    throw new UnauthorizedException('Senha incorreta');
  }

  // Reset tentativas ao logar com sucesso
  await this.prisma.motorista.update({
    where: { id: motorista.id },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    },
  });

  // Gera token
  return this.jwtService.sign({
    motoristaId: motorista.id,
    type: 'motorista',
  });
}
```

---

## 📱 Meta Tags PWA e Otimizações Mobile

### Meta Tags no index.html

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- PWA Meta Tags -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Portal Motorista">
  <meta name="theme-color" content="#2563eb">
  
  <!-- Descrição -->
  <meta name="description" content="Portal do Motorista - Acesse seus contratos e pagamentos">
  
  <!-- Touch Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  
  <title>Portal do Motorista</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### Tailwind Config Mobile-First

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      maxWidth: {
        'mobile': '480px',
        'app': '640px', // Container do app mobile
      },
      screens: {
        // Mobile first (já é padrão do Tailwind)
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
      spacing: {
        // Touch-friendly spacing
        'touch': '44px', // Mínimo recomendado Apple/Google
      },
    },
  },
};
```

### CSS Global para App Feel

```css
/* frontend/src/index.css */

/* Remove scroll bounce no iOS (feel de app) */
body {
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

/* Remove highlight azul ao tocar (típico de apps) */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Suaviza transições */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
  }
}

/* Container do app centralizado em desktop */
.app-container {
  max-width: 640px;
  margin: 0 auto;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* Botões touch-friendly */
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 12px;
}

/* Cards com aparência de app */
.card-mobile {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 150ms ease;
}

.card-mobile:active {
  transform: scale(0.98);
}
```

---

## ✅ Validações

### Backend

**Login:**
- [ ] CPF deve existir no banco
- [ ] CPF deve ter 11 dígitos
- [ ] Motorista deve estar ativo (active=true)
- [ ] Motorista não deve estar na blacklist
- [ ] Senha deve ter mínimo 6 caracteres
- [ ] Senha deve estar correta (bcrypt.compare)
- [ ] Conta não deve estar bloqueada (lockedUntil)

**Primeiro Acesso:**
- [ ] Senha atual deve estar correta
- [ ] Nova senha deve ter mínimo 8 caracteres
- [ ] Nova senha deve conter letras e números
- [ ] Nova senha não pode ser igual à anterior

**Get Contrato:**
- [ ] Contrato deve existir
- [ ] Contrato deve pertencer ao motorista logado (ownership)

**Download PDF:**
- [ ] Contrato deve existir
- [ ] Contrato deve pertencer ao motorista logado
- [ ] Template deve estar ativo

### Frontend

**Login:**
- [ ] CPF deve ter 11 dígitos
- [ ] Senha deve ter mínimo 6 caracteres
- [ ] Ambos campos obrigatórios

**Primeiro Acesso:**
- [ ] Senha atual obrigatória
- [ ] Nova senha obrigatória
- [ ] Nova senha mínimo 8 caracteres
- [ ] Confirmação de senha deve ser igual

---

## 📝 Checklist de Implementação

### Backend (5 dias)

#### Dia 1: Autenticação
- [ ] Adicionar campos ao model Motorista (password, passwordReset, lastLogin, loginAttempts, lockedUntil)
- [ ] Criar migration
- [ ] Criar MotoristaJwtStrategy
- [ ] Criar MotoristaAuthGuard
- [ ] Criar AuthMotoristaService
- [ ] Endpoints: POST /auth/motorista/login, POST /auth/motorista/primeiro-acesso
- [ ] Modificar motoristas.service para gerar senha ao criar
- [ ] Criar template de email com credenciais

#### Dia 2: Módulo Portal do Motorista
- [ ] Criar módulo motorista-portal
- [ ] Criar MotoristaPortalService
- [ ] Criar MotoristaPortalController
- [ ] Endpoint: GET /motorista/perfil
- [ ] Endpoint: GET /motorista/contratos
- [ ] Endpoint: GET /motorista/contratos/:id
- [ ] Validações de ownership em todos endpoints

#### Dia 3: Download de PDF e Dashboard
- [ ] Endpoint: GET /motorista/contratos/:id/pdf
- [ ] Endpoint: GET /motorista/cobrancas
- [ ] Endpoint: GET /motorista/dashboard
- [ ] Lógica de cálculo de estatísticas (total pago, pendente, atrasadas)

#### Dia 4: Esqueci Senha e Testes
- [ ] Endpoint: POST /auth/motorista/esqueci-senha
- [ ] Endpoint: POST /auth/motorista/reset-senha
- [ ] Criar model PasswordResetToken (opcional)
- [ ] Template de email reset de senha
- [ ] Testes unitários dos services
- [ ] Testes de integração dos endpoints

#### Dia 5: Modificações em Email e Finalização
- [ ] Modificar envio de email ao criar contrato (incluir link do portal)
- [ ] Testar fluxo completo de criação motorista → email → login
- [ ] Ajustes finais e correções

### Frontend (5 dias)

#### Dia 1: Estrutura e Autenticação
- [ ] Criar MotoristaAuthContext
- [ ] Criar MotoristaAuthService
- [ ] Criar MotoristaPrivateRoute
- [ ] Página MotoristaLoginPage
- [ ] Página MotoristaPrimeiroAcessoPage
- [ ] Máscaras de CPF

#### Dia 2: Layout e Dashboard
- [ ] Criar MotoristaLayout (header + bottom navigation mobile-first)
- [ ] Página MotoristaDashboardPage
- [ ] Cards de estatísticas
- [ ] Componente StatsCard reutilizável
- [ ] Integração com API (useQuery)

#### Dia 3: Contratos
- [ ] Página MotoristaContratosPage (lista)
- [ ] Componente ContratoCard
- [ ] Página MotoristaContratoDetailPage
- [ ] Componente InfoCard reutilizável
- [ ] Botão de download PDF com loading state

#### Dia 4: Pagamentos e Perfil
- [ ] Página MotoristaPagamentosPage
- [ ] Tabela de cobranças
- [ ] Componente PaymentStatusBadge
- [ ] Página MotoristaPerfilPage (visualização apenas)
- [ ] Filtros de status (contratos e cobranças)

#### Dia 5: Polimento e Testes
- [ ] **Meta tags PWA** (viewport, theme-color, apple-mobile-web-app)
- [ ] **CSS global mobile** (overscroll-behavior, tap-highlight)
- [ ] **Bottom navigation** fixo funcionando
- [ ] **Touch-friendly** (botões min 44x44px)
- [ ] Responsividade mobile (aparência de app)
- [ ] Desktop centralizado (max-width 640px)
- [ ] Dark mode em todas páginas
- [ ] Loading states
- [ ] Empty states
- [ ] Mensagens de erro amigáveis
- [ ] Testes E2E do fluxo completo
- [ ] Ajustes finais de UX

---

## 🎯 Critérios de Aceitação

### Funcionalidade
- [ ] Motorista consegue fazer login com CPF e senha
- [ ] Motorista troca senha no primeiro acesso
- [ ] Motorista vê dashboard com informações do contrato ativo
- [ ] Motorista lista todos seus contratos
- [ ] Motorista vê detalhes de um contrato específico
- [ ] Motorista baixa PDF do contrato
- [ ] Motorista vê histórico de pagamentos
- [ ] Motorista filtra cobranças por status
- [ ] Sistema envia email com credenciais ao criar motorista
- [ ] Sistema envia email com link do portal ao criar contrato

### Segurança
- [ ] Motorista só acessa seus próprios dados
- [ ] Motorista não acessa área admin
- [ ] Admin não acessa área do motorista com token de admin
- [ ] Proteção contra brute force (bloqueio após 5 tentativas)
- [ ] Senha inicial forte (8 caracteres aleatórios)
- [ ] Primeiro acesso força troca de senha

### UX
- [ ] **Interface mobile-first** (aparência de app nativo)
- [ ] **Bottom navigation bar** fixo (típico de apps)
- [ ] **Cards grandes** com touch-friendly (min 44x44px)
- [ ] **Gestos mobile** suportados quando aplicável
- [ ] **Responsivo** mas otimizado para mobile
- [ ] Desktop centralizado (max-width, não full-screen)
- [ ] Dark mode funcional
- [ ] Loading states em todas requisições
- [ ] Mensagens de erro claras
- [ ] Empty states informativos
- [ ] Navegação intuitiva

### Performance
- [ ] Dashboard carrega em < 2 segundos
- [ ] Lista de contratos carrega em < 1 segundo
- [ ] Download de PDF em < 3 segundos
- [ ] Cache de queries com TanStack Query

### Qualidade de Código
- [ ] TypeScript strict mode (0 erros)
- [ ] ESLint 0 erros
- [ ] Cobertura de testes > 70%
- [ ] Documentação completa

---

## 📚 Referências

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT Strategy](https://www.passportjs.org/packages/passport-jwt/)
- [React Router Protected Routes](https://reactrouter.com/en/main/guides/authentication)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Autor:** GitHub Copilot  
**Data:** 23/11/2025  
**Versão:** 1.0
