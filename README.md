# 🚗 Portal da Locadora - Sistema de Gestão para Motoristas de App

![Status](https://img.shields.io/badge/status-production--ready-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Audit](https://img.shields.io/badge/audit-approved-success)
![Last Audit](https://img.shields.io/badge/last%20audit-2025--11--23-informational)

Sistema completo de gestão para locadoras de veículos focadas em **motoristas de aplicativos** (Uber, 99, etc.). Desenvolvido com as melhores práticas de engenharia de software, arquitetura moderna e type safety end-to-end.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação](#instalação)
- [Uso](#uso)
- [Documentação](#documentação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Contato](#contato)

---

## 🎯 Sobre o Projeto

O **Portal da Locadora** é um ERP moderno e completo para gestão de locadoras que atendem motoristas de aplicativos. O sistema cobre toda a jornada operacional, desde o cadastro do motorista até o controle financeiro, passando por gestão de frota, manutenções e relatórios executivos.

### Diferenciais

✅ **Type Safety End-to-End** - TypeScript em 100% do código  
✅ **RBAC Granular** - 7 perfis de usuário com permissões específicas  
✅ **Auditoria Automática** - Rastreamento completo de alterações  
✅ **Dark Mode** - Interface adaptável com persistência  
✅ **Performance** - Build otimizado (360 KB gzip)  
✅ **Documentação Completa** - Guias técnicos e de negócio  

---

## ⚡ Funcionalidades

### 🔐 Autenticação e Autorização
- Login com JWT (expiração: 7 dias)
- RBAC com 7 perfis: Admin, Diretoria, Financeiro, Gestor de Frota, Gerente de Loja, Atendente, Equipe Externa
- Guards de rotas protegidas no frontend e backend

### 👤 Gestão de Motoristas
- ✅ Cadastro completo (dados pessoais, CNH, endereço, dados bancários)
- ✅ Validações: CPF/CNPJ único, telefone formatado, CNH válida
- ✅ Controle de blacklist (inadimplentes)
- ✅ Upload de documentos (CNH, RG, comprovante)
- ✅ Foto de perfil
- ✅ Histórico de contratos
- ✅ Status de pagamento em tempo real

### 🚙 Gestão de Frota
- ✅ CRUD de veículos (11 campos validados)
- ✅ Status: Disponível, Locado, Manutenção, Vistoria, Inativo
- ✅ Controle de quilometragem (KM atual, histórico semanal)
- ✅ Alertas de manutenção preventiva (a cada 10.000 km)
- ✅ Relacionamento com filiais
- ✅ Documentação digital (CRLV, fotos)

### 📋 Planos e Contratos
- ✅ Planos customizáveis (diário, semanal, mensal)
- ✅ Contratos com workflow de status (Rascunho → Ativo → Suspenso → Cancelado → Concluído)
- ✅ Troca de veículo dentro do contrato
- ✅ Geração automática de cobranças
- ✅ Templates de contrato customizáveis (16 placeholders)
- ✅ Geração de PDF profissional com pdfmake

### 💰 Gestão Financeira
- ✅ Cobranças recorrentes (mensais)
- ✅ Controle de inadimplência (status: Pendente, Paga, Atrasada)
- ✅ Cálculo automático de multas
- ✅ Registro de pagamentos (PIX, TED, Dinheiro, Cartão)
- ✅ Relatórios de inadimplentes
- ⏳ Cobranças semanais (planejado)
- ⏳ Gateway de pagamento (Mercado Pago/Stripe - planejado)

### 🔧 Manutenções
- ✅ Registro de manutenções preventivas e corretivas
- ✅ Tipos: Preventiva, Corretiva, Revisão
- ✅ Status: Agendada, Em Andamento, Concluída, Cancelada
- ✅ Histórico completo por veículo
- ✅ Cálculo automático da próxima manutenção
- ✅ Widget de alertas no dashboard

### 📊 Dashboard e Relatórios
- ✅ 4 KPIs principais: Contratos Ativos, Veículos Disponíveis, Manutenções Pendentes, Receita Mensal
- ✅ Widget de KM rodados (total semanal + top 5 veículos)
- ✅ Gráficos: Distribuição de frota, contratos vencendo, receita mensal
- ✅ Estatísticas em tempo real
- ⏳ Relatórios avançados com exportação (planejado)

### 📄 Documentos Digitais
- ✅ Upload com drag-and-drop
- ✅ 10 tipos: CNH, RG, CPF, Foto de Perfil, Comprovante de Residência, CRLV, Laudo de Vistoria, Contrato Assinado, Foto do Veículo, Outros
- ✅ Preview de imagens e PDFs
- ✅ Download e exclusão
- ✅ Validação de tipo e tamanho (max 10MB)

### 🔍 Auditoria
- ✅ Log automático de todas as operações (CREATE, UPDATE, DELETE)
- ✅ Registro de quem fez, quando e o quê
- ✅ Diff de alterações (before/after)
- ✅ Filtros: entidade, usuário, data

---

## 🛠 Stack Tecnológica

### Backend
- **NestJS 11** - Framework progressivo para Node.js
- **TypeScript 5.7** - Type safety end-to-end
- **Prisma 5.22** - ORM type-safe com migrations automáticas
- **PostgreSQL** - Banco de dados relacional ACID
- **JWT** - Autenticação stateless
- **Passport** - Estratégias de autenticação
- **Bcrypt** - Hashing de senhas (salt 10 rounds)
- **Multer** - Upload de arquivos
- **pdfmake** - Geração de PDFs profissionais

### Frontend
- **React 19** - Biblioteca UI moderna
- **TypeScript 5.9** - Type safety no frontend
- **Vite 7** - Build tool ultra-rápido
- **Tailwind CSS 3.4** - Styling utility-first
- **TanStack Query 5** - Data fetching + cache inteligente
- **React Router 7** - Roteamento
- **Axios** - HTTP client
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos responsivos

### DevOps & Tooling
- **Docker** - Containerização (PostgreSQL + PgAdmin)
- **ESLint** - Linting (0 erros)
- **Prettier** - Formatação de código
- **Jest** - Testes unitários
- **Git** - Controle de versão

### Storage
- **Local Storage** - Armazenamento local (desenvolvimento)
- **AWS S3** - Storage em nuvem (produção)
- **Adapter Pattern** - Troca transparente entre local e cloud

### Futuras Integrações
- ⏳ Mercado Pago / Stripe (pagamentos)
- ⏳ NodeMailer + SendGrid (emails)
- ⏳ Twilio (SMS)
- ⏳ Sentry (error tracking)
- ⏳ GitHub Actions (CI/CD)

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Docker** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### 🚀 Setup Rápido (Windows)

**Primeira vez:**
```bash
# Clone o repositório
git clone https://github.com/betinhochagas/portal_da_locadora.git
cd portal_da_locadora

# Execute o script de setup (instala tudo automaticamente)
setup-primeiro-uso.bat
```

**Uso diário:**
```bash
# Inicia backend + frontend + docker em janelas separadas
start-dev.bat

# Para parar tudo
stop-dev.bat
```

### 🔧 Setup Manual (Linux/Mac)

```bash
# 1. Clone o repositório
git clone https://github.com/betinhochagas/portal_da_locadora.git
cd portal_da_locadora

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Instale as dependências do frontend
cd ../frontend
npm install
cd ..

# 4. Suba o banco de dados (Docker)
docker-compose up -d

# 5. Configure o banco (migrations + seed)
cd backend
npx prisma migrate dev
npx prisma db seed

# 6. Inicie os servidores (2 terminais)
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### ✅ Verificação

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **PgAdmin:** http://localhost:5050
- **Login:** admin@portaldalocadora.com / senha123

📖 **Documentação completa:** [SETUP.md](./SETUP.md)

---

## 🎮 Uso

### Login Padrão

Após o seed do banco, use:
- **Email:** admin@portaldalocadora.com
- **Senha:** senha123

### Fluxo Básico

1. **Dashboard** - Visualize KPIs e estatísticas
2. **Motoristas** - Cadastre novos motoristas
3. **Veículos** - Adicione veículos à frota
4. **Planos** - Crie planos de locação
5. **Contratos** - Crie contratos entre motoristas e veículos
6. **Cobranças** - Gere e controle pagamentos
7. **Manutenções** - Registre manutenções da frota

---

## 📚 Documentação

### Documentação Técnica

- 🏗️ [Decisão de Stack](./docs/arquitetura/decisao-stack.md) - Análise de tecnologias
- 🎯 [Visão Geral da Arquitetura](./docs/arquitetura/visao-geral.md) - Diagrama de contexto, camadas, fluxos
- 🔐 [RBAC e Permissões](./docs/arquitetura/rbac-permissoes.md) - Controle de acesso
- 🔌 [Endpoints da API](./docs/api/endpoints.md) - 72 endpoints REST
- ☁️ [Cloud Storage](./docs/CLOUD_STORAGE.md) - Configuração de armazenamento AWS S3

### Documentação de Negócio

- 📊 [Modelagem de Domínio](./docs/dominio/modelagem.md) - Entidades e relacionamentos
- 🚗 [Jornada do Motorista](./docs/dominio/jornada-motorista.md) - Fluxo completo
- 🚙 [Gestão de Frota](./docs/dominio/gestao-frota.md) - Controle de veículos

### Guias de Desenvolvimento

- 📝 [SETUP.md](./SETUP.md) - Instalação detalhada
- 📋 [Onde Parei](./docs/onde-parei.md) - Status do projeto e próximos passos

---

## 📂 Estrutura do Projeto

```
portal_da_locadora/
├── backend/                    # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma      # Modelagem do banco (11 models, 9 enums)
│   │   ├── migrations/        # Histórico de migrations (5 aplicadas)
│   │   └── seed.ts            # Dados iniciais
│   ├── src/
│   │   ├── modules/           # 11 módulos de domínio
│   │   │   ├── auth/          # Autenticação JWT
│   │   │   ├── motoristas/    # CRUD + validações
│   │   │   ├── veiculos/      # CRUD + status + KM
│   │   │   ├── planos/        # CRUD + cálculos
│   │   │   ├── contratos/     # CRUD + workflow
│   │   │   ├── cobrancas/     # Financeiro + inadimplência
│   │   │   ├── manutencoes/   # Preventiva + corretiva
│   │   │   ├── uploads/       # Documentos digitais
│   │   │   ├── contrato-templates/  # Templates + PDFs
│   │   │   ├── audit-log/     # Rastreamento
│   │   │   ├── stats/         # Relatórios
│   │   │   └── filiais/       # Multi-filial
│   │   ├── common/
│   │   │   ├── decorators/    # @CurrentUser(), @Roles()
│   │   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   │   ├── interceptors/  # AuditInterceptor (automático)
│   │   │   └── enums/         # Enums centralizados
│   │   └── prisma/            # Prisma Service
│   └── uploads/               # Arquivos locais (dev)
├── frontend/                   # SPA React
│   ├── src/
│   │   ├── components/        # 15+ componentes reutilizáveis
│   │   ├── pages/             # 27 páginas
│   │   ├── services/          # 12 API clients
│   │   ├── contexts/          # Auth + Theme
│   │   ├── hooks/             # Custom hooks
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Helpers (formatters, validators)
│   └── public/
├── docs/                       # Documentação completa
│   ├── arquitetura/
│   ├── dominio/
│   └── api/
├── docker-compose.yml          # PostgreSQL + PgAdmin
├── setup-primeiro-uso.bat      # Setup automático (Windows)
├── start-dev.bat               # Inicia desenvolvimento
└── stop-dev.bat                # Para servidores
```

---

## 💻 Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm run start:dev      # Desenvolvimento (hot reload)
npm run build          # Build de produção
npm run lint           # ESLint (fix automático)
npm run lint:check     # ESLint (apenas verificação)
npm run test           # Testes unitários
npm run test:e2e       # Testes end-to-end
npm run prisma:studio  # GUI do banco de dados
```

**Frontend:**
```bash
npm run dev            # Desenvolvimento (Vite)
npm run build          # Build de produção
npm run lint           # ESLint (fix automático)
npm run lint:fix       # ESLint (fix forçado)
npm run preview        # Preview do build
npm run type-check     # Verificação de tipos
```

### Convenções de Código

- **TypeScript:** 100% do código (sem `any`)
- **ESLint:** 0 erros permitidos
- **Prettier:** Formatação automática
- **Commits:** Mensagens descritivas em português
- **Branches:** feature/nome-da-feature, fix/nome-do-bug

---

## 🧪 Testes

### Backend (Jest)

```bash
cd backend
npm run test          # Testes unitários
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # End-to-end
```

### Frontend (Vitest - Planejado)

```bash
cd frontend
npm run test          # Testes unitários
npm run test:ui       # UI de testes
```

### E2E (Playwright - Planejado)

```bash
npm run test:e2e      # Todos os testes E2E
npm run test:e2e:ui   # Interface visual
```

**Coverage esperado:** 70%+

---

## 🚀 Deploy em Produção

> ⚠️ **IMPORTANTE:** O deploy em produção será realizado **APENAS** após o sistema estar **100% completo** com todas as funcionalidades implementadas, testadas e documentadas.

### Pré-requisitos para Deploy

Antes de fazer deploy, certifique-se que:

- ✅ Todas as funcionalidades core estão implementadas
- ✅ Portal do Motorista está funcional
- ✅ Testes E2E foram executados com sucesso
- ✅ Documentação completa foi revisada
- ✅ Sistema foi validado em ambiente local
- ✅ Variáveis de ambiente de produção configuradas
- ✅ Backups automáticos configurados

### Estratégia de Deploy (quando o sistema estiver completo)

#### Backend (Railway / Render / AWS)

```bash
# 1. Configure variáveis de ambiente
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3000
MAIL_HOST=...
MAIL_USER=...
MAIL_PASSWORD=...

# 2. Build e deploy
npm run build
npm run start:prod
```

#### Frontend (Vercel / Netlify)

```bash
# 1. Configure variável de ambiente
VITE_API_URL=https://api.seudominio.com

# 2. Build
npm run build

# 3. Deploy (Vercel)
vercel --prod
```

#### Docker (Produção)

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Suba os containers
docker-compose -f docker-compose.prod.yml up -d
```

**Status atual:** Sistema em desenvolvimento. Deploy será realizado na versão 1.0 final.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Guia de Contribuição

- Leia [CONTRIBUTING.md](./CONTRIBUTING.md) (futuro)
- Siga as convenções de código
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

---

## 📈 Métricas do Projeto

| Categoria | Métrica |
|-----------|---------|
| **Linhas de Código** | ~15.000 |
| **Commits** | 100+ |
| **Tempo de Desenvolvimento** | 3 meses |
| **Módulos Backend** | 11 |
| **Endpoints REST** | 72 |
| **Páginas Frontend** | 27 |
| **Componentes** | 15+ |
| **Tabelas DB** | 11 |
| **Migrations** | 5 |
| **Documentação** | 10+ arquivos |
| **Build Size (Frontend)** | 360 KB (gzip) |
| **Build Time** | ~6s (frontend) + ~8s (backend) |
| **ESLint Errors** | 0 |
| **TypeScript Coverage** | 100% |

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Roberto Chagas (betinhochagas)**

- GitHub: [@betinhochagas](https://github.com/betinhochagas)
- Email: roberto@exemplo.com
- LinkedIn: [Roberto Chagas](https://linkedin.com/in/betinhochagas)

---

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade NestJS
- Comunidade React
- Contributors do projeto

---

## 🔮 Roadmap

### ✅ Concluído (v1.0)
- [x] Autenticação JWT + RBAC
- [x] CRUD completo de Motoristas, Veículos, Planos
- [x] Contratos com workflow de status
- [x] Gestão financeira (cobranças)
- [x] Sistema de manutenções
- [x] Upload de documentos
- [x] Templates de contrato + geração de PDF
- [x] Auditoria automática
- [x] Dashboard com estatísticas
- [x] Dark mode
- [x] Documentação completa
- [x] Cloud Storage (AWS S3) com adapter pattern

### 🔄 Em Progresso (v1.1)
- [ ] Wizard de criação de contratos (PASSO 23)
- [ ] Envio de contrato por email (PASSO 19)
- [ ] Validação end-to-end de templates PDF

### 🚀 Próximos Passos (v1.2)
- [ ] App PWA para motoristas
- [ ] Cobranças semanais
- [ ] Gateway de pagamento (Mercado Pago/Stripe)
- [ ] Notificações automáticas (email + SMS)
- [ ] Testes E2E (Playwright)

### 🌟 Futuro (v2.0)
- [ ] Sistema SaaS multi-tenant
- [ ] Lista negra nacional compartilhada
- [ ] Integração com rastreadores
- [ ] App mobile nativo (React Native)
- [ ] IA para precificação dinâmica

---

<p align="center">
  Desenvolvido com ❤️ por <a href="https://github.com/betinhochagas">Roberto Chagas</a>
</p>

<p align="center">
  <sub>Se este projeto te ajudou, considere dar uma ⭐!</sub>
</p>
