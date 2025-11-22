# Decisão de Stack Tecnológica

**Data:** Novembro 2025  
**Status:** ✅ Implementado e Validado  
**Autores:** Roberto Chagas

---

## 1. Contexto do Projeto

O **Portal da Locadora** é um sistema de gestão completo para locadoras de veículos focadas em **motoristas de aplicativo** (Uber, 99, etc.). O sistema precisa suportar:

- **Jornada completa do motorista:** cadastro → contratação de planos → gestão de veículos → renovações → cobranças
- **Gestão de frota:** controle de disponibilidade, manutenções preventivas/corretivas, documentação digital
- **Operação financeira:** cobranças recorrentes (semanais/mensais), controle de inadimplência, relatórios
- **Multi-usuário e multi-filial:** RBAC com 7 perfis diferentes, isolamento por filial
- **Conformidade:** LGPD, trilha de auditoria completa, segurança robusta

### Requisitos Não Funcionais Prioritários

1. **Segurança:** Autenticação JWT, RBAC granular, logs de auditoria, proteção de dados sensíveis
2. **Escalabilidade:** Suporte a múltiplas filiais, centenas de contratos ativos, milhares de cobranças
3. **Manutenibilidade:** Código tipado, padrões bem definidos, separação clara de responsabilidades
4. **Performance:** Consultas otimizadas, cache inteligente, builds rápidos
5. **Developer Experience:** Hot reload, TypeScript end-to-end, tooling moderno

---

## 2. Opções Avaliadas

### Opção 1: NestJS + React + Prisma + PostgreSQL (✅ ESCOLHIDA)

**Backend:** NestJS (Node.js + TypeScript)  
**Frontend:** React 18 + TypeScript + Vite  
**ORM:** Prisma  
**Database:** PostgreSQL  
**State Management:** TanStack Query (React Query)  
**Styling:** Tailwind CSS

**Prós:**
- ✅ **TypeScript end-to-end:** type safety total, menos bugs em produção
- ✅ **NestJS:** arquitetura modular inspirada em Angular, injeção de dependências, decorators para RBAC
- ✅ **Prisma:** migrations automáticas, client type-safe, studio para debug visual
- ✅ **PostgreSQL:** ACID completo, suporte a JSON, performance excelente para relatórios complexos
- ✅ **React Query:** cache automático, invalidação inteligente, menos boilerplate
- ✅ **Vite:** builds instantâneos, HMR ultra-rápido, otimizado para produção
- ✅ **Comunidade ativa:** documentação extensa, ecossistema maduro, fácil contratar devs
- ✅ **Escalabilidade:** fácil migrar para microserviços no futuro (NestJS tem suporte nativo)

**Contras:**
- ⚠️ Node.js single-threaded (mitigado com workers e PostgreSQL robusto)
- ⚠️ NestJS tem curva de aprendizado inicial (mas compensa com produtividade)

---

### Opção 2: Laravel + Vue.js + Eloquent + MySQL

**Backend:** Laravel (PHP)  
**Frontend:** Vue.js 3 + TypeScript  
**ORM:** Eloquent  
**Database:** MySQL

**Prós:**
- ✅ Laravel tem muitas features "out of the box" (auth, jobs, notifications)
- ✅ Blade templates úteis para emails
- ✅ PHP amplamente disponível em hospedagens

**Contras:**
- ❌ PHP menos moderno que TypeScript (tipos opcionais, não nativos)
- ❌ Eloquent menos poderoso que Prisma (sem migrations automáticas type-safe)
- ❌ MySQL menos adequado para JSON complexo (relatórios, audit logs)
- ❌ Vue.js menor adoção no mercado brasileiro comparado a React
- ❌ Não há type safety entre backend e frontend

**Decisão:** Rejeitada por falta de TypeScript end-to-end e menor produtividade.

---

### Opção 3: Django + Next.js + SQLAlchemy + PostgreSQL

**Backend:** Django (Python)  
**Frontend:** Next.js (React com SSR)  
**ORM:** Django ORM / SQLAlchemy  
**Database:** PostgreSQL

**Prós:**
- ✅ Django Admin poderoso (CRUD automático)
- ✅ Python excelente para scripts de BI/ML
- ✅ Next.js tem SSR (SEO melhor)

**Contras:**
- ❌ Python tipagem estática limitada (mesmo com mypy)
- ❌ Django monolítico, difícil de escalar horizontalmente
- ❌ Comunicação backend-frontend via REST sem type safety
- ❌ Next.js tem overhead desnecessário (não precisamos SSR para sistema interno)
- ❌ Django ORM menos flexível que Prisma

**Decisão:** Rejeitada por complexidade desnecessária e falta de type safety.

---

## 3. Decisão Final: Stack Escolhida

### 🎯 **Backend: NestJS + Prisma + PostgreSQL**

**Justificativa:**
- **NestJS:** Arquitetura modular perfeita para sistema complexo com múltiplos domínios (motoristas, veículos, contratos, cobranças, etc.). Decorators facilitam implementação de RBAC e validações.
- **Prisma:** Migrations declarativas, cliente 100% type-safe, Prisma Studio para debug visual do banco.
- **PostgreSQL:** Confiabilidade ACID, suporte nativo a JSON (para audit logs), views materializadas para relatórios, extensões como PostGIS se precisarmos geolocalização no futuro.

### 🎨 **Frontend: React + Vite + TanStack Query + Tailwind CSS**

**Justificativa:**
- **React 18:** Biblioteca mais popular no Brasil, fácil contratar devs, ecossistema gigante.
- **Vite:** Build instantâneo (10x mais rápido que Webpack), HMR ultra-responsivo, configuração mínima.
- **TanStack Query:** Elimina 90% do boilerplate de state management, cache automático, invalidação inteligente após mutations.
- **Tailwind CSS:** Prototipagem rápida, dark mode nativo, bundle final menor (unused CSS removido automaticamente).

### 🔐 **Segurança e Qualidade**

- **JWT:** Autenticação stateless, expira em 7 dias, refresh token implementado.
- **Bcrypt:** Hashing de senhas com salt automático.
- **Class Validator:** Validação de DTOs em tempo de runtime (backend).
- **ESLint + Prettier:** Code quality garantida, 0 erros no CI/CD.
- **Audit Log:** Interceptor automático registra todas as alterações (quem, quando, o quê).

---

## 4. Tecnologias Complementares

### **Testes**
- **Backend:** Jest (unit + integration) - já instalado
- **Frontend:** Vitest (compatível com Vite) - planejado
- **E2E:** Playwright - planejado

### **Build e Deploy**
- **CI/CD:** GitHub Actions (lint + build + test automáticos)
- **Backend Deploy:** Railway ou Render (PostgreSQL gerenciado)
- **Frontend Deploy:** Vercel (CDN global, zero config)
- **Storage:** Local (desenvolvimento) → AWS S3 ou Cloudflare R2 (produção)

### **Monitoramento (Futuro)**
- **Logs:** Sentry (error tracking)
- **Metrics:** DataDog ou New Relic
- **Uptime:** BetterStack

### **Integrações Planejadas**
- **Pagamento:** Mercado Pago ou Stripe
- **Email:** NodeMailer + SendGrid/Resend
- **SMS:** Twilio (notificações críticas)
- **PDF:** pdfmake (já implementado para contratos)

---

## 5. Estrutura de Pastas

### **Backend (NestJS)**

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelagem do banco (11 models, 9 enums)
│   ├── migrations/            # Histórico de migrations
│   └── seed.ts                # Dados iniciais (usuários, planos)
├── src/
│   ├── main.ts                # Bootstrap da aplicação
│   ├── app.module.ts          # Módulo raiz
│   ├── common/                # Shared utilities
│   │   ├── decorators/        # @CurrentUser(), @Roles()
│   │   ├── enums/             # Enums centralizados
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/      # AuditInterceptor (log automático)
│   │   └── pipes/             # ValidationPipe global
│   ├── modules/               # Módulos de domínio (1 pasta = 1 feature)
│   │   ├── auth/              # Login, JWT, refresh token
│   │   ├── motoristas/        # CRUD motoristas + validações
│   │   ├── veiculos/          # CRUD veículos + controle de status
│   │   ├── planos/            # CRUD planos + cálculo de preços
│   │   ├── contratos/         # CRUD contratos + workflow de status
│   │   ├── cobrancas/         # Gestão financeira + inadimplência
│   │   ├── manutencoes/       # Manutenções preventivas/corretivas
│   │   ├── uploads/           # Upload de documentos (CNH, CRLV, etc)
│   │   ├── contrato-templates/# Templates customizáveis + geração PDF
│   │   ├── audit-log/         # Rastreamento de alterações
│   │   ├── stats/             # Relatórios e dashboard
│   │   └── filiais/           # Multi-filial (planejado)
│   └── prisma/                # Prisma Service (conexão global)
└── uploads/                   # Arquivos locais (dev)
```

**Padrão de Módulo:**
- `*.module.ts` - Declaração de dependências
- `*.controller.ts` - Rotas REST + validação de RBAC
- `*.service.ts` - Lógica de negócio
- `dto/*.dto.ts` - Data Transfer Objects (validação com class-validator)

---

### **Frontend (React)**

```
frontend/
├── src/
│   ├── main.tsx               # Entry point (React.render)
│   ├── App.tsx                # Router principal (22 rotas)
│   ├── index.css              # Tailwind imports + custom utilities
│   ├── components/            # Componentes reutilizáveis
│   │   ├── layout/            # Header, Sidebar, Footer
│   │   ├── ui/                # Buttons, Inputs, Badges (design system)
│   │   ├── FileUpload.tsx     # Drag-and-drop com preview
│   │   ├── ContratoModal.tsx  # Modal de detalhes do contrato
│   │   ├── DocumentModal.tsx  # Visualizador de documentos
│   │   ├── PDFThumbnail.tsx   # Preview de PDF
│   │   ├── PrivateRoute.tsx   # Guard de autenticação
│   │   └── ThemeToggle.tsx    # Switch dark/light mode
│   ├── contexts/              # React Context API
│   │   ├── AuthContext.tsx    # Estado global de autenticação
│   │   └── ThemeContext.tsx   # Persistência do tema (localStorage)
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Hook de autenticação
│   │   └── useTheme.ts        # Hook de tema
│   ├── pages/                 # Páginas (1 arquivo = 1 rota)
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx  # 4 KPIs + widgets
│   │   ├── motoristas/        # 3 páginas (list, form, detail)
│   │   ├── veiculos/          # 3 páginas
│   │   ├── planos/            # 3 páginas
│   │   ├── contratos/         # 2 páginas (list, detail)
│   │   ├── cobrancas/         # 2 páginas
│   │   ├── manutencoes/       # 3 páginas
│   │   ├── templates/         # 3 páginas
│   │   ├── documentos/        # 1 página
│   │   ├── audit-logs/        # 1 página
│   │   └── RelatoriosPage.tsx
│   ├── services/              # API clients (axios + TanStack Query)
│   │   ├── api.ts             # Axios instance (base URL + interceptors)
│   │   ├── authService.ts
│   │   ├── motoristasService.ts
│   │   ├── veiculosService.ts
│   │   └── ...                # 1 service por módulo
│   ├── types/                 # TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── motorista.ts
│   │   ├── veiculo.ts
│   │   └── ...                # Sincronizado com DTOs do backend
│   └── utils/                 # Funções auxiliares
│       ├── formatters.ts      # CPF, CNPJ, moeda, datas
│       ├── validators.ts      # Validações client-side
│       └── downloadPDF.ts     # Download de PDFs gerados
└── public/                    # Assets estáticos
```

**Padrão de Página:**
- `ListPage` - Tabela + filtros + paginação
- `FormPage` - Create/Edit com validações
- `DetailPage` - Visualização + ações (ativar, suspender, etc)

---

## 6. Decisões Arquiteturais Relacionadas

### **6.1. Autenticação: JWT Stateless**

**Decisão:** JWT com expiração de 7 dias, armazenado em `localStorage`.

**Alternativas consideradas:**
- ❌ Sessions no servidor (não escala horizontalmente)
- ❌ Cookies httpOnly (problemas com CORS em ambientes SPA)

**Justificativa:** JWT permite escalabilidade horizontal (stateless), facilita integração com apps mobile no futuro.

**Riscos:** Tokens roubados não podem ser revogados antes da expiração.  
**Mitigação:** Implementar blacklist de tokens (Redis) se houver necessidade de revogação imediata.

---

### **6.2. Auditoria: Interceptor Global**

**Decisão:** Interceptor do NestJS registra automaticamente todas as operações CREATE/UPDATE/DELETE.

**Alternativas:**
- ❌ Triggers no banco de dados (menos flexível, dificulta testes)
- ❌ Código manual em cada service (propenso a esquecimentos)

**Justificativa:** Interceptor garante auditoria 100% consistente, sem código duplicado.

---

### **6.3. State Management: TanStack Query (React Query)**

**Decisão:** Usar React Query para cache e sincronização com backend, sem Redux/Zustand.

**Alternativas:**
- ❌ Redux Toolkit (muito boilerplate para CRUD simples)
- ❌ Zustand (bom para estado local, mas React Query já resolve 90% dos casos)

**Justificativa:** React Query elimina necessidade de gerenciar loading/error states manualmente, cache automático reduz chamadas à API.

---

### **6.4. Upload de Arquivos: Sistema Próprio vs S3**

**Decisão Atual:** Upload local (`backend/uploads/`) em desenvolvimento, migrar para S3/R2 em produção.

**Justificativa:** Simplicidade no início, mas escalável. S3 oferece CDN, backups automáticos e redundância geográfica.

**Plano de migração:** Criar adapter pattern no `UploadService` para trocar storage sem quebrar código.

---

### **6.5. Soft Delete vs Hard Delete**

**Decisão:** Soft delete em todas as entidades críticas (motoristas, veículos, contratos).

**Justificativa:** Conformidade com LGPD (direito ao esquecimento exige processo controlado), recuperação de dados acidentalmente deletados, auditoria completa.

**Implementação:** Campo `deletedAt` (nullable DateTime) + filter global no Prisma.

---

### **6.6. Multi-tenancy: Database Separation vs Row-Level Security**

**Decisão (Futura - PASSO 25):** Row-Level Security com `locadoraId` em todas as tabelas.

**Alternativas:**
- ❌ Database separado por locadora (custo alto, complexidade operacional)
- ❌ Schema separation (limite de schemas no PostgreSQL)

**Justificativa:** RLS é nativo do PostgreSQL, alta performance, baixo custo. Filtro `WHERE locadoraId = X` aplicado automaticamente.

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Node.js single-threaded sobrecarregado** | Baixa | Alto | PostgreSQL faz o trabalho pesado (queries). Workers para tarefas assíncronas (emails, relatórios). |
| **Banco de dados crescendo indefinidamente** | Média | Médio | Arquivamento de contratos antigos (>3 anos) em tabela separada. Particionamento por ano. |
| **JWT roubado** | Média | Alto | HTTPS obrigatório. Refresh token rotation. Blacklist de tokens (Redis) se necessário. |
| **Upload de arquivos maliciosos** | Média | Alto | Validação de MIME type, tamanho máximo (10MB), antivírus (ClamAV) em produção. |
| **Inadimplência em massa** | Média | Alto | Sistema de notificações automáticas, bloqueio de contratos, lista negra compartilhada (PASSO 25). |
| **Perda de dados (falha de HD)** | Baixa | Crítico | Backup diário automático (PostgreSQL dump), replicação em standby, testes mensais de restore. |
| **Desenvolvedor único (bus factor)** | Alta | Alto | Documentação extensa (este arquivo + onde-parei.md), código bem comentado, padrões claros. |

---

## 8. Métricas de Sucesso (Atuais)

- ✅ **60 endpoints REST** implementados (100% funcionais)
- ✅ **22 páginas frontend** responsivas com dark mode
- ✅ **0 erros TypeScript** (backend + frontend)
- ✅ **0 erros ESLint** (13 warnings aceitáveis em decorators)
- ✅ **Build frontend:** 1.28 MB (360 KB gzip) - dentro do esperado
- ✅ **100% cobertura de RBAC** em endpoints críticos
- ✅ **Auditoria automática** em 100% das operações destrutivas
- ✅ **Dark mode** implementado em todas as páginas

---

## 9. Referências

### Documentação Oficial
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Arquitetura e Padrões
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Best Practices](https://github.com/nestjs/nest/tree/master/sample)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [LGPD - Lei Geral de Proteção de Dados](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**Última atualização:** 22 de novembro de 2025  
**Próxima revisão:** Após implementação do PASSO 25 (Multi-tenancy)
