# Setup do Ambiente de Desenvolvimento

## Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **Docker Desktop** (para PostgreSQL local)
3. **npm** ou **yarn**

---

## 1. Backend (NestJS + Prisma)

### 1.1. Instalar dependências
```powershell
cd backend
npm install
```

### 1.2. Iniciar banco de dados (Docker)
Na raiz do projeto:
```powershell
docker-compose up -d
```

Serviços disponíveis:
- **PostgreSQL**: `localhost:54321` ⚠️ _Nota: porta 54321 para evitar conflito_
  - User: `postgres`
  - Password: `postgres`
  - Database: `portal_locadora`
- **PgAdmin**: `http://localhost:5050`
  - Email: `admin@portaldalocadora.com`
  - Password: `admin`

### 1.3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```powershell
cd backend
Copy-Item .env.example .env
```

O arquivo `.env` já contém as configurações corretas para desenvolvimento local.

### 1.4. Executar migrations e seed
```powershell
cd backend
npx prisma migrate dev
npx prisma db seed
```

**Dados de teste criados:**
- 3 usuários com diferentes perfis
- 3 motoristas
- 5 veículos
- 3 contratos

### 1.5. Gerar Prisma Client
```powershell
npx prisma generate
```

### 1.6. Iniciar servidor de desenvolvimento
```powershell
npm run start:dev
```

API disponível em: `http://localhost:3000/api/v1`

**Credenciais de teste:**
- **Admin:** admin@portaldalocadora.com / senha123
- **Gerente:** gerente@portaldalocadora.com / senha123
- **Atendente:** atendente@portaldalocadora.com / senha123

---

## 2. Frontend (React + Vite)

### 2.1. Instalar dependências
```powershell
cd frontend
npm install
```

### 2.2. Configurar variáveis de ambiente
O arquivo `.env` já está configurado:
```
VITE_API_URL=http://localhost:3000/api/v1
```

### 2.3. Iniciar servidor de desenvolvimento
```powershell
npm run dev
```

Aplicação disponível em: `http://localhost:5173`

**Credenciais de login:**
- Email: `admin@portaldalocadora.com`
- Senha: `senha123`

---

## 3. Comandos Úteis

### Backend
```powershell
# Desenvolvimento
npm run start:dev          # Servidor com hot-reload

# Testes
npm run test               # Testes unitários
npm run test:watch         # Testes em modo watch
npm run test:e2e           # Testes end-to-end
npm run test:cov           # Cobertura de testes

# Qualidade de código
npm run lint               # Lint com auto-fix
npm run format             # Formatar código
npm run validate           # Lint + format + typecheck + tests
npm run typecheck          # Verificar tipos TypeScript
npm run build              # Build de produção

# Prisma
npx prisma studio          # Interface visual do banco
npx prisma migrate dev     # Criar nova migration
npx prisma db push         # Aplicar schema sem migration (dev)
npx prisma generate        # Gerar Prisma Client
npx prisma db seed         # Popular banco com dados de teste
```

### Frontend
```powershell
# Desenvolvimento
npm run dev                # Servidor Vite com hot-reload

# Build
npm run build              # Build de produção
npm run preview            # Preview do build

# Qualidade de código
npm run lint               # ESLint
npm run type-check         # Verificar tipos TypeScript
```

### Docker
```powershell
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Parar e remover volumes (apaga dados!)
docker-compose down -v
```

---

## 4. Estrutura do Projeto

```
portal_da_locadora/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Domínios (motoristas, veiculos, etc.)
│   │   ├── common/            # Guards, interceptors, decorators
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   └── test/
├── frontend/                   # SPA React (TODO)
├── docs/                       # Documentação
└── docker-compose.yml          # PostgreSQL + PgAdmin
```

---

## 5. Troubleshooting

### Erro: "Cannot connect to database"
1. Verifique se o Docker Desktop está rodando
2. Verifique se os containers estão ativos: `docker ps`
3. Verifique a `DATABASE_URL` no arquivo `.env`

### Erro: "Port 54321 already in use"
Você tem outro serviço usando esta porta. Opções:
1. Pare o serviço conflitante
2. Mude a porta no `docker-compose.yml` (ex: `54322:5432`) e atualize DATABASE_URL no `.env`

### Erro: Prisma não conecta (porta 5432)
O projeto usa porta 54321 para evitar conflito com PostgreSQL local. Certifique-se de que o `.env` tem a porta correta.

### Erro: Prisma Client não encontrado
Execute: `npx prisma generate`

---

## 6. Setup Completo em Outro Ambiente

### 6.1. Clonar o repositório
```powershell
git clone https://github.com/betinhochagas/portal_da_locadora.git
cd portal_da_locadora
```

### 6.2. Instalar dependências
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 6.3. Configurar ambiente
```powershell
# Copiar .env do backend (se necessário)
cd backend
Copy-Item .env.example .env
# Edite DATABASE_URL se necessário
cd ..
```

### 6.4. Subir banco de dados
```powershell
docker-compose up -d
```

### 6.5. Executar migrations e seed
```powershell
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..
```

### 6.6. Iniciar servidores
```powershell
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Acesse:** http://localhost:5173  
**Login:** admin@portaldalocadora.com / senha123

---

## 7. Próximos Passos

## 7. Próximos Passos

1. ✅ Setup do backend (PASSO 2)
2. ✅ Configuração do Prisma + PostgreSQL (PASSO 3)
3. ✅ Setup do frontend (PASSO 4)
4. ✅ Implementação de autenticação + RBAC (PASSO 6)
5. ✅ CRUD de Motoristas (PASSO 7)
6. ✅ CRUD de Veículos (PASSO 8)
7. ✅ Tema Dark Mode
8. ⏳ CRUD de Planos (PASSO 9)
9. ⏳ CRUD de Contratos (PASSO 10)
