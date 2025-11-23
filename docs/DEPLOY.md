# Guia de Deploy para Produção

**Versão:** 1.0.0  
**Data:** 23/11/2025  
**Projeto:** Portal da Locadora

---

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

- [ ] Conta no serviço de hospedagem escolhido (Railway, Render, Vercel, etc)
- [ ] Domínio configurado (opcional, mas recomendado)
- [ ] Certificado SSL/HTTPS configurado
- [ ] Banco PostgreSQL gerenciado (Railway, Render, AWS RDS, etc)
- [ ] Variáveis de ambiente configuradas
- [ ] Testes executados com sucesso
- [ ] Backup do banco de dados de desenvolvimento

---

## 🎯 Checklist Completo de Deploy

### Fase 1: Preparação (Antes do Deploy)

#### Backend

- [ ] **1. Remover Dados Sensíveis**
  ```bash
  # Verificar se não há secrets commitados
  git grep -i "password\|secret\|token\|api_key"
  ```

- [ ] **2. Gerar JWT_SECRET Forte**
  ```bash
  openssl rand -base64 64
  ```

- [ ] **3. Atualizar .gitignore**
  ```gitignore
  .env
  .env.local
  .env.production
  /uploads/*
  !/uploads/.gitkeep
  /dist
  /node_modules
  ```

- [ ] **4. Testar Build Local**
  ```bash
  cd backend
  npm run build
  npm run typecheck
  npm run lint:check
  ```

- [ ] **5. Executar Migrations**
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **6. Criar Seed de Produção**
  - Remover dados de teste
  - Manter apenas usuário admin + dados essenciais
  - Não commitar senhas reais

#### Frontend

- [ ] **1. Atualizar Variáveis de Ambiente**
  ```env
  VITE_API_URL=https://api.seudominio.com.br/api/v1
  ```

- [ ] **2. Testar Build Local**
  ```bash
  cd frontend
  npm run build
  npm run type-check
  npm run lint
  ```

- [ ] **3. Verificar Bundle Size**
  ```bash
  # Bundle deve ser < 2MB idealmente
  npm run build
  # Verificar output em dist/
  ```

- [ ] **4. Testar Build Localmente**
  ```bash
  npm run preview
  # Abrir http://localhost:4173
  ```

#### Database

- [ ] **1. Criar Banco de Produção**
  - PostgreSQL 14+ recomendado
  - Conexão SSL obrigatória
  - Configurar backup automático (diário)

- [ ] **2. Aplicar Migrations**
  ```bash
  DATABASE_URL="postgresql://..." npx prisma migrate deploy
  ```

- [ ] **3. Executar Seed Produção (Opcional)**
  ```bash
  # Apenas se necessário criar usuário admin
  DATABASE_URL="postgresql://..." npx prisma db seed
  ```

---

### Fase 2: Deploy Backend

#### Opção A: Railway.app (Recomendado)

1. **Criar Conta e Projeto**
   - Acesse https://railway.app
   - Conecte com GitHub
   - Criar novo projeto

2. **Adicionar PostgreSQL**
   - New → Database → PostgreSQL
   - Copiar `DATABASE_URL` das variáveis

3. **Adicionar Serviço Backend**
   - New → GitHub Repo
   - Selecionar repositório
   - Branch: `main`
   - Root directory: `backend`

4. **Configurar Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=seu-secret-forte-aqui
   JWT_EXPIRATION=7d
   CORS_ORIGIN=https://seudominio.com.br
   API_PREFIX=api/v1
   ```

5. **Configurar Build**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`

6. **Deploy**
   - Railway detecta automaticamente e faz deploy
   - Verificar logs em tempo real

#### Opção B: Render.com

1. **Criar Conta**
   - Acesse https://render.com
   - Conecte com GitHub

2. **Criar PostgreSQL**
   - New → PostgreSQL
   - Nome: portal-locadora-db
   - Copiar Internal Database URL

3. **Criar Web Service**
   - New → Web Service
   - Repositório: seu-repo
   - Branch: main
   - Root Directory: backend
   - Runtime: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`

4. **Configurar Environment**
   ```env
   NODE_ENV=production
   DATABASE_URL=seu-database-url-interno
   JWT_SECRET=seu-secret
   CORS_ORIGIN=https://seudominio.com.br
   ```

5. **Deploy Automático**
   - Render faz deploy a cada push em `main`

#### Opção C: AWS / DigitalOcean (Avançado)

Consultar documentação específica de cada provedor.

---

### Fase 3: Deploy Frontend

#### Opção A: Vercel (Recomendado)

1. **Criar Conta**
   - Acesse https://vercel.com
   - Conecte com GitHub

2. **Importar Projeto**
   - New Project
   - Selecionar repositório
   - Root Directory: `frontend`
   - Framework Preset: Vite

3. **Configurar Environment Variables**
   ```env
   VITE_API_URL=https://seu-backend.railway.app/api/v1
   ```

4. **Configurar Build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**
   - Vercel detecta e faz deploy automático
   - Domínio gerado: `seu-projeto.vercel.app`

#### Opção B: Netlify

1. **Criar Conta**
   - Acesse https://netlify.com
   - Conecte com GitHub

2. **New Site from Git**
   - Selecionar repositório
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   ```env
   VITE_API_URL=https://seu-backend.railway.app/api/v1
   ```

4. **Deploy**
   - Netlify faz deploy automático

---

### Fase 4: Configuração DNS e Domínio

#### 1. Configurar Domínio no Backend (Railway/Render)

**Railway:**
- Settings → Networking → Custom Domain
- Adicionar: `api.seudominio.com.br`
- Configurar DNS:
  ```
  CNAME api seu-projeto.up.railway.app
  ```

**Render:**
- Settings → Custom Domain
- Adicionar: `api.seudominio.com.br`
- Configurar DNS conforme instruções

#### 2. Configurar Domínio no Frontend (Vercel/Netlify)

**Vercel:**
- Settings → Domains
- Adicionar: `seudominio.com.br` e `www.seudominio.com.br`
- Configurar DNS:
  ```
  A     @        76.76.21.21
  CNAME www      cname.vercel-dns.com
  ```

**Netlify:**
- Domain Settings → Add custom domain
- Seguir instruções de configuração DNS

#### 3. Aguardar Propagação DNS
- Tempo médio: 2-24 horas
- Verificar: https://dnschecker.org

---

### Fase 5: Validação Pós-Deploy

#### Backend

- [ ] **1. Testar Health Check**
  ```bash
  curl https://api.seudominio.com.br/api/v1
  ```

- [ ] **2. Testar Login**
  ```bash
  curl -X POST https://api.seudominio.com.br/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"senha123"}'
  ```

- [ ] **3. Verificar CORS**
  - Abrir frontend
  - Tentar fazer login
  - Verificar erros de CORS no console

- [ ] **4. Verificar Logs**
  - Railway: Logs tab
  - Render: Logs menu
  - Procurar por erros

#### Frontend

- [ ] **1. Testar Rota Principal**
  - Abrir https://seudominio.com.br
  - Verificar se carrega sem erros

- [ ] **2. Testar Login**
  - Fazer login com usuário admin
  - Verificar se autentica corretamente

- [ ] **3. Testar Rotas**
  - Navegar entre páginas
  - Verificar se não há 404

- [ ] **4. Testar Dark Mode**
  - Alternar tema
  - Verificar persistência (localStorage)

- [ ] **5. Testar Responsividade**
  - Mobile (< 768px)
  - Tablet (768px - 1024px)
  - Desktop (> 1024px)

#### Database

- [ ] **1. Verificar Conexões**
  - Railway/Render: Metrics
  - Ver número de conexões ativas

- [ ] **2. Executar Query de Teste**
  ```sql
  SELECT COUNT(*) FROM users;
  ```

- [ ] **3. Verificar Backup**
  - Confirmar que backup automático está ativo
  - Testar restore em ambiente de teste

---

### Fase 6: Monitoramento e Segurança

#### 1. Configurar Sentry (Error Tracking)

**Backend:**
```bash
npm install @sentry/node
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Frontend:**
```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

#### 2. Configurar Rate Limiting

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
}),
```

#### 3. Adicionar Helmet (Security Headers)

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

#### 4. Configurar Logs Estruturados

```bash
npm install winston
```

---

### Fase 7: CI/CD (GitHub Actions)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Backend Tests
        run: |
          cd backend
          npm ci
          npm run lint:check
          npm run typecheck
          npm run test
      
      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm run lint
          npm run type-check

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          # Railway faz deploy automático
          echo "Backend deploying..."

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: |
          # Vercel faz deploy automático
          echo "Frontend deploying..."
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] JWT_SECRET forte (64+ caracteres)
- [ ] HTTPS obrigatório
- [ ] CORS configurado apenas para domínio real
- [ ] Rate limiting ativo
- [ ] Helmet.js instalado
- [ ] Senhas hasheadas (bcrypt)
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection (React auto-escape)
- [ ] CSRF tokens (se necessário)
- [ ] Logs sem dados sensíveis
- [ ] Backup automático do banco
- [ ] Monitoramento de erros (Sentry)
- [ ] Firewall configurado
- [ ] Atualizações de segurança automáticas

---

## 📊 Monitoramento

### Métricas Importantes

1. **Performance**
   - Tempo de resposta da API (< 500ms)
   - Tempo de carregamento do frontend (< 3s)
   - Bundle size (< 2MB)

2. **Disponibilidade**
   - Uptime (> 99.9%)
   - Health checks a cada 5 minutos

3. **Erros**
   - Taxa de erro (< 0.1%)
   - Erros críticos alertados imediatamente

4. **Usuários**
   - Usuários ativos
   - Sessões simultâneas
   - Taxa de conversão

---

## 🚨 Rollback

Se algo der errado:

### Railway
```bash
# Reverter para deploy anterior
railway rollback
```

### Vercel
- Dashboard → Deployments
- Selecionar versão anterior
- Promote to Production

### Render
- Dashboard → Deploys
- Selecionar versão anterior
- Redeploy

---

## 📞 Suporte

**Em caso de problemas:**
- Verificar logs em tempo real
- Consultar `docs/SECURITY.md`
- Abrir issue no GitHub
- Contato: suporte@portaldalocadora.com.br

---

**Última atualização:** 23/11/2025  
**Versão do guia:** 1.0.0
