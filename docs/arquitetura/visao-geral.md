# Visão Geral da Arquitetura

**Data:** Novembro 2025  
**Status:** ✅ Sistema em Produção  
**Versão:** 1.0.0

---

## 1. Diagrama de Contexto

```
┌─────────────────────────────────────────────────────────────────┐
│                      SISTEMA PORTAL DA LOCADORA                  │
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Frontend   │◄────►│   Backend    │◄────►│  PostgreSQL  │ │
│  │  React SPA   │      │   NestJS     │      │   Database   │ │
│  │  (Vite)      │      │   REST API   │      │              │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│         │                      │                                │
│         │                      │                                │
│         ▼                      ▼                                │
│  ┌──────────────┐      ┌──────────────┐                       │
│  │ TanStack     │      │   Prisma     │                       │
│  │ Query Cache  │      │   ORM        │                       │
│  └──────────────┘      └──────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
         │                      │
         │                      │
         ▼                      ▼
   ┌──────────┐          ┌──────────┐
   │ Usuários │          │ Uploads  │
   │ (RBAC)   │          │ (Local)  │
   └──────────┘          └──────────┘
```

### Atores Externos

1. **Atendente de Balcão** - Cadastro de motoristas, criação de contratos
2. **Gerente de Loja** - Gestão operacional, aprovações
3. **Gestor de Frota** - Controle de veículos, manutenções
4. **Financeiro** - Gestão de cobranças, inadimplência
5. **Diretoria/BI** - Relatórios executivos, análises
6. **Equipe Externa** - Vistorias, entregas, retomadas
7. **Admin do Sistema** - Configurações globais, usuários

---

## 2. Camadas da Aplicação

### 2.1. Frontend (React + TypeScript)

**Responsabilidades:**
- Interface do usuário (UI/UX)
- Validações client-side
- Cache de dados (TanStack Query)
- Controle de estado de autenticação
- Roteamento de páginas

**Tecnologias:**
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite** - Build tool (10x mais rápido que Webpack)
- **Tailwind CSS** - Styling utility-first
- **TanStack Query** - Data fetching + cache
- **React Router** - Navegação
- **Axios** - HTTP client
- **Lucide React** - Ícones

**Estrutura de Diretórios:**
```
frontend/src/
├── components/       # Componentes reutilizáveis
│   ├── layout/      # Header, Sidebar, Footer
│   ├── ui/          # Button, Input, Badge
│   ├── FileUpload   # Drag-and-drop
│   └── ...
├── pages/           # Páginas (27 total)
│   ├── motoristas/  # 3 páginas
│   ├── veiculos/    # 3 páginas
│   ├── contratos/   # 3 páginas
│   ├── cobrancas/   # 2 páginas
│   ├── manutencoes/ # 3 páginas
│   └── ...
├── services/        # API clients (12 services)
├── contexts/        # React Context (Auth, Theme)
├── hooks/           # Custom hooks
├── types/           # TypeScript interfaces
└── utils/           # Helpers (formatters, validators)
```

---

### 2.2. Backend (NestJS + TypeScript)

**Responsabilidades:**
- Lógica de negócio
- Validações server-side
- Autenticação JWT + RBAC
- Acesso ao banco de dados (Prisma)
- Upload de arquivos
- Geração de PDFs
- Auditoria automática

**Tecnologias:**
- **NestJS** - Framework progressivo Node.js
- **TypeScript** - Type safety end-to-end
- **Prisma** - ORM type-safe
- **JWT** - Autenticação stateless
- **Passport** - Estratégias de auth
- **Bcrypt** - Hashing de senhas
- **Multer** - Upload de arquivos
- **pdfmake** - Geração de PDFs

**Estrutura de Módulos:**
```
backend/src/
├── modules/
│   ├── auth/                # Login, JWT, refresh token
│   ├── motoristas/          # CRUD + validações
│   ├── veiculos/            # CRUD + status + KM
│   ├── planos/              # CRUD + cálculos
│   ├── contratos/           # CRUD + workflow
│   ├── cobrancas/           # Financeiro + inadimplência
│   ├── manutencoes/         # Preventiva + corretiva
│   ├── uploads/             # Documentos digitais
│   ├── contrato-templates/  # Templates + PDFs
│   ├── audit-log/           # Rastreamento
│   ├── stats/               # Relatórios
│   └── filiais/             # Multi-filial
├── common/
│   ├── decorators/          # @CurrentUser(), @Roles()
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # AuditInterceptor
│   └── enums/               # Enums centralizados
└── prisma/                  # Prisma Service
```

---

### 2.3. Banco de Dados (PostgreSQL + Prisma)

**Responsabilidades:**
- Persistência de dados
- Integridade referencial
- Queries complexas (relatórios)
- Transações ACID

**Entidades Principais (11 models):**
1. **User** - Usuários do sistema (RBAC)
2. **Filial** - Lojas/filiais
3. **Motorista** - Clientes motoristas de app
4. **Veiculo** - Frota de veículos
5. **Plano** - Planos de locação
6. **Contrato** - Contratos de locação
7. **Cobranca** - Cobranças mensais
8. **Manutencao** - Manutenções da frota
9. **DocumentoDigital** - Uploads (CNH, CRLV, etc)
10. **ContratoTemplate** - Templates customizáveis
11. **AuditLog** - Rastreamento de alterações

**Enums (9 total):**
- Role, VehicleCategory, FuelType, Transmission, VehicleStatus
- ContractStatus, PaymentStatus, MaintenanceType, MaintenanceStatus
- TipoDocumento, AuditAction

---

## 3. Fluxos Principais

### 3.1. Fluxo de Autenticação

```
1. Usuário acessa /login
2. Insere email + senha
3. Frontend → POST /auth/login
4. Backend valida credenciais (bcrypt)
5. Backend gera JWT (exp: 7 dias)
6. Frontend armazena token (localStorage)
7. Frontend redireciona para /dashboard
8. Todas requisições incluem header: Authorization: Bearer <token>
9. Backend valida JWT em cada request (JwtAuthGuard)
10. Backend verifica permissões (RolesGuard)
```

**Roles implementados:**
- ADMIN, DIRETORIA, FINANCEIRO, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE, EQUIPE_EXTERNA

---

### 3.2. Fluxo de Criação de Contrato

```
1. Atendente cadastra motorista (ou seleciona existente)
2. Atendente seleciona plano (mensal/semanal)
3. Atendente seleciona veículo disponível
4. Sistema valida:
   - Motorista não está na blacklist
   - Veículo disponível (não LOCADO/MANUTENCAO)
   - Categoria do veículo compatível com plano
   - Plano está ativo
5. Sistema cria contrato (status: RASCUNHO)
6. Atendente revisa dados
7. Atendente ativa contrato → status: ATIVO
8. Sistema atualiza veículo → status: LOCADO
9. Sistema gera cobranças automáticas
10. Sistema registra audit log
```

---

### 3.3. Fluxo de Cobrança Recorrente

```
1. Contrato ATIVO criado
2. Sistema gera cobrança mensal (dueDate baseado em billingDay)
3. Status inicial: PENDENTE
4. No vencimento:
   - Se pago → status: PAGA
   - Se não pago → status: ATRASADA
5. Após 7 dias de atraso:
   - Contrato → status: SUSPENSO
   - Notificação enviada (futura integração)
6. Gerente pode reativar contrato após pagamento
7. Sistema calcula multas (lateFee) automaticamente
```

---

### 3.4. Fluxo de Manutenção Preventiva

```
1. Veículo atinge 10.000 km
2. Sistema detecta próxima manutenção (nextMaintenanceKm)
3. Dashboard exibe alerta "Veículo X precisa de manutenção"
4. Gestor de Frota agenda manutenção
5. Veículo → status: MANUTENCAO
6. Oficina realiza serviço
7. Gestor registra conclusão
8. Veículo → status: DISPONIVEL
9. Sistema atualiza nextMaintenanceKm (+10.000)
```

---

### 3.5. Fluxo de Upload de Documentos

```
1. Atendente acessa edição de motorista
2. Clica em "Upload CNH" (drag-and-drop)
3. Frontend valida arquivo:
   - Tipo: image/*, application/pdf
   - Tamanho: max 10MB
4. Frontend → POST /uploads (multipart/form-data)
5. Backend valida arquivo (Multer)
6. Backend salva em backend/uploads/
7. Backend registra em DocumentoDigital
8. Frontend exibe thumbnail + botões download/excluir
```

---

### 3.6. Fluxo de Geração de PDF de Contrato

```
1. Gerente acessa contrato
2. Clica "Baixar Contrato PDF"
3. Frontend → POST /contratos/:id/gerar-pdf?templateId=X
4. Backend busca template ativo
5. Backend substitui 16 placeholders:
   - {{MOTORISTA_NOME}}, {{VEICULO_PLACA}}, {{VALOR_MENSAL}}, etc
6. Backend gera PDF (pdfmake)
7. Backend retorna buffer com headers:
   - Content-Type: application/pdf
   - Content-Disposition: attachment; filename="contrato-2025-001.pdf"
8. Frontend dispara download automático
```

---

## 4. Métricas do Sistema (Estado Atual)

### 4.1. Backend

| Métrica | Valor |
|---------|-------|
| **Módulos** | 11 |
| **Controllers** | 11 |
| **Endpoints REST** | 72 |
| **Services** | 11 |
| **DTOs** | 24 |
| **Guards** | 2 (JWT + Roles) |
| **Decorators** | 4 (@CurrentUser, @Roles, @Public, @SkipAudit) |
| **Interceptors** | 1 (Audit) |
| **Migrations** | 5 |
| **Dependências** | 18 |
| **Build Time** | ~8s |
| **ESLint Errors** | 0 |
| **ESLint Warnings** | 13 (decorators) |

### 4.2. Frontend

| Métrica | Valor |
|---------|-------|
| **Páginas** | 27 |
| **Componentes** | 15+ |
| **Services** | 12 |
| **Contexts** | 2 (Auth, Theme) |
| **Custom Hooks** | 2 |
| **Type Definitions** | 10 |
| **Rotas** | 30 |
| **Build Size** | 1.28 MB (360 KB gzip) |
| **Build Time** | ~6s |
| **ESLint Errors** | 0 |

### 4.3. Banco de Dados

| Métrica | Valor |
|---------|-------|
| **Tabelas** | 11 |
| **Enums** | 9 |
| **Foreign Keys** | 18 |
| **Índices** | 12 |
| **Migrations** | 5 aplicadas |

---

## 5. Integrações Externas

### 5.1. Implementadas

- ✅ **PostgreSQL** - Banco de dados relacional
- ✅ **Docker** - Containerização (PostgreSQL + PgAdmin)
- ✅ **pdfmake** - Geração de PDFs de contratos

### 5.2. Planejadas (Futuro)

- ⏳ **Mercado Pago / Stripe** - Gateway de pagamento
- ⏳ **NodeMailer + SendGrid** - Envio de emails
- ⏳ **Twilio** - Envio de SMS (notificações críticas)
- ⏳ **AWS S3 / Cloudflare R2** - Storage de arquivos
- ⏳ **Sentry** - Error tracking
- ⏳ **DataDog / New Relic** - Monitoramento APM
- ⏳ **GitHub Actions** - CI/CD automático

---

## 6. Segurança

### 6.1. Camadas de Segurança

1. **Autenticação:**
   - JWT com expiração de 7 dias
   - Senhas hasheadas (bcrypt, salt 10 rounds)
   - Tokens armazenados em localStorage (client)

2. **Autorização (RBAC):**
   - Guards aplicados em todos os endpoints
   - Permissões granulares por role
   - Decorators para controle fino (@Roles(['ADMIN']))

3. **Validações:**
   - **Client-side:** TypeScript + validações de formulário
   - **Server-side:** class-validator em todos os DTOs
   - **Database:** Constraints, foreign keys, unique indexes

4. **Auditoria:**
   - Interceptor automático registra CREATE/UPDATE/DELETE
   - Dados before/after armazenados em JSON
   - userId + timestamp em cada log

5. **Upload de Arquivos:**
   - Validação de MIME type
   - Tamanho máximo: 10MB
   - Nomes de arquivo sanitizados
   - Arquivos não executáveis

### 6.2. Conformidade LGPD

- ✅ Soft delete (campo deletedAt)
- ✅ Audit log completo
- ✅ Dados sensíveis não logados
- ✅ CPF/CNPJ únicos + validados
- ⏳ Consentimento de uso de dados (futuro)
- ⏳ Exportação de dados pessoais (futuro)

---

## 7. Performance

### 7.1. Frontend

- **Lazy Loading:** Componentes carregados sob demanda
- **Code Splitting:** Bundle otimizado (360 KB gzip)
- **Cache:** TanStack Query com staleTime de 5min
- **Debouncing:** Busca em tempo real com delay de 500ms
- **Memoization:** useCallback/useMemo em componentes pesados

### 7.2. Backend

- **Prisma:** Queries otimizadas com select específico
- **Includes:** Carrega apenas relacionamentos necessários
- **Pagination:** Implementado em listagens grandes (futuro)
- **Transactions:** Operações críticas em transações ACID
- **Soft Delete:** Filtro global para não carregar deletados

### 7.3. Database

- **Índices:** Criados em colunas de busca frequente (CPF, CNPJ, placa)
- **Foreign Keys:** Otimizam JOINs
- **Connection Pool:** Gerenciado pelo Prisma (default: 10)

---

## 8. Escalabilidade

### 8.1. Horizontal

- **Backend:** Stateless (JWT), pode escalar com load balancer
- **Frontend:** Static files, pode usar CDN (Vercel, CloudFlare)
- **Database:** PostgreSQL suporta read replicas

### 8.2. Vertical

- **Backend:** Node.js single-threaded, mas PostgreSQL faz trabalho pesado
- **Workers:** Tarefas assíncronas (emails, relatórios) podem usar Bull/Redis

### 8.3. Multi-tenancy (PASSO 25 - Futuro)

- Row-Level Security com `locadoraId` em todas as tabelas
- Filtro automático aplicado em todos os queries
- Lista negra compartilhada entre locadoras

---

## 9. Roadmap de Melhorias

### Curto Prazo (1-2 meses)
- [ ] Wizard de criação de contratos (PASSO 23)
- [ ] Envio de contrato por email (PASSO 19)
- [ ] App PWA para motoristas (acesso mobile)
- [ ] Cobranças semanais (além de mensais)
- [ ] Gateway de pagamento (PIX + Cartão)

### Médio Prazo (3-6 meses)
- [ ] Notificações automáticas (email + SMS)
- [ ] Relatórios avançados (gráficos, exportação)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD completo (GitHub Actions)
- [ ] Deploy em produção (Railway/Render + Vercel)

### Longo Prazo (6-12 meses)
- [ ] Sistema SaaS multi-tenant (PASSO 25)
- [ ] Lista negra nacional compartilhada
- [ ] Integração com rastreadores (telemetria)
- [ ] App mobile nativo (React Native)
- [ ] Marketplace de seguradoras
- [ ] IA para precificação dinâmica de planos

---

## 10. Referências

- [Documentação Completa](../README.md)
- [Decisão de Stack](./decisao-stack.md)
- [RBAC e Permissões](./rbac-permissoes.md)
- [Modelagem de Domínio](../dominio/modelagem.md)
- [Endpoints da API](../api/endpoints.md)
- [Onde Parei](../onde-parei.md)

---

**Última atualização:** 22 de novembro de 2025  
**Próxima revisão:** Após implementação do PASSO 23 (Wizard de Contratos)
