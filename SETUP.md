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

### 1.4. Executar migrations
```powershell
cd backend
npx prisma migrate dev
```

### 1.5. Gerar Prisma Client
```powershell
npx prisma generate
```

### 1.6. Iniciar servidor de desenvolvimento
```powershell
npm run start:dev
```

API disponível em: `http://localhost:3000/api/v1`

---

## 2. Frontend (React + Vite)

_TODO: Será configurado no Passo 4_

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

# Prisma
npx prisma studio          # Interface visual do banco
npx prisma migrate dev     # Criar nova migration
npx prisma db push         # Aplicar schema sem migration (dev)
npx prisma generate        # Gerar Prisma Client
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

## 6. Próximos Passos

1. ✅ Setup do backend (PASSO 2)
2. ✅ Configuração do Prisma + PostgreSQL (PASSO 3)
3. ⏳ Setup do frontend (PASSO 4)
4. ⏳ Implementação de autenticação + RBAC
5. ⏳ CRUD de Motoristas e Veículos
