# Guia de Segurança e Boas Práticas

**Data:** 23/11/2025  
**Versão:** 1.0  
**Projeto:** Portal da Locadora

---

## 🔐 Segurança Implementada

### 1. Autenticação e Autorização

#### JWT (JSON Web Tokens)
- ✅ **Configurado:** Tokens com expiração de 7 dias
- ✅ **Secret:** Variável de ambiente `JWT_SECRET`
- ⚠️ **PRODUÇÃO:** Gerar secret forte (mínimo 32 caracteres)
  ```bash
  # Gerar secret seguro
  openssl rand -base64 64
  ```
- ✅ **Storage:** Tokens armazenados em `localStorage` (considerar `httpOnly cookies` para produção)

#### Senhas
- ✅ **Hashing:** bcrypt com 10 rounds
- ✅ **Validação:** Mínimo 6 caracteres (aumentar para 8+ em produção)
- ✅ **Seed:** Senhas de desenvolvimento: `senha123` (TROCAR EM PRODUÇÃO)

#### RBAC (Role-Based Access Control)
- ✅ **7 Roles:** ADMIN, DIRETORIA, FINANCEIRO, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE, EQUIPE_EXTERNA
- ✅ **Guards:** Implementados em todos os endpoints críticos
- ✅ **Decorators:** `@Roles()` e `@CurrentUser()`

### 2. Validação de Dados

#### Backend (class-validator)
- ✅ **DTOs:** Validações em todos os DTOs
- ✅ **Tipos:** `IsString`, `IsEmail`, `IsInt`, `Min`, `Max`
- ✅ **Sanitização:** `whitelist: true`, `forbidNonWhitelisted: true`
- ✅ **Transform:** Conversão automática de tipos

#### Frontend (React)
- ✅ **Validações locais:** Antes de enviar para API
- ✅ **Feedback:** Mensagens de erro claras
- ✅ **TypeScript:** Type-safety em toda aplicação

### 3. CORS (Cross-Origin Resource Sharing)

```typescript
// backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
```

**Configuração:**
- ✅ **Desenvolvimento:** `http://localhost:5173`
- ⚠️ **Produção:** Configurar domínio real em `.env`

### 4. Upload de Arquivos

- ✅ **Multer:** Configurado com limites
- ✅ **Tamanho máximo:** 10 MB por arquivo
- ✅ **Tipos permitidos:** Documentos (PDF, JPG, PNG, WEBP)
- ✅ **Validação:** Client-side e server-side
- ⚠️ **Produção:** Migrar para S3/CloudFlare R2

**Validações:**
```typescript
// Tipos permitidos
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Tamanho máximo: 10 MB
const maxSize = 10 * 1024 * 1024;
```

### 5. SQL Injection

- ✅ **Prisma ORM:** Proteção automática contra SQL injection
- ✅ **Parameterized queries:** Todas as queries são parametrizadas
- ✅ **Type-safe:** TypeScript + Prisma garantem tipos corretos

### 6. Audit Logs

- ✅ **Interceptor:** Registra automaticamente ações de CREATE, UPDATE, DELETE
- ✅ **Rastreamento:** Usuário, timestamp, entidade, alterações
- ✅ **Immutable:** Logs não podem ser editados/deletados

---

## ⚠️ Checklist para Produção

### Antes do Deploy

#### Backend

- [ ] **1. Trocar JWT_SECRET**
  ```bash
  # Gerar novo secret
  openssl rand -base64 64
  ```

- [ ] **2. Configurar DATABASE_URL**
  - Usar banco gerenciado (Railway, Render, AWS RDS)
  - Conexão SSL habilitada
  - Backup automático configurado

- [ ] **3. Remover console.logs**
  - ✅ FEITO: Console.logs de debug removidos

- [ ] **4. Configurar variáveis de ambiente**
  ```env
  NODE_ENV=production
  LOG_LEVEL=info
  CORS_ORIGIN=https://seudominio.com.br
  ```

- [ ] **5. Habilitar HTTPS**
  - Certificado SSL válido
  - Redirecionar HTTP → HTTPS

- [ ] **6. Rate Limiting**
  ```bash
  npm install @nestjs/throttler
  ```
  ```typescript
  // Limitar requisições por IP
  ThrottlerModule.forRoot({
    ttl: 60,
    limit: 100,
  }),
  ```

- [ ] **7. Helmet (Security Headers)**
  ```bash
  npm install helmet
  ```
  ```typescript
  app.use(helmet());
  ```

- [ ] **8. Migrar uploads para S3**
  - Instalar `@aws-sdk/client-s3`
  - Configurar bucket
  - Atualizar upload service

- [ ] **9. Configurar logs profissionais**
  ```bash
  npm install winston
  ```

- [ ] **10. Monitoramento e Alertas**
  - Sentry para error tracking
  - Datadog/New Relic para performance

#### Frontend

- [ ] **1. Configurar VITE_API_URL produção**
  ```env
  VITE_API_URL=https://api.seudominio.com.br/api/v1
  ```

- [ ] **2. Build otimizado**
  ```bash
  npm run build
  ```
  - Verificar bundle size (<500 KB ideal)
  - Code-splitting configurado

- [ ] **3. Configurar domínio**
  - DNS apontando para Vercel/Netlify
  - HTTPS configurado
  - WWW redirect (se aplicável)

- [ ] **4. Service Worker (PWA)**
  - Configurar offline fallback
  - Cache de assets estáticos
  - Manifest.json atualizado

- [ ] **5. Analytics (opcional)**
  - Google Analytics
  - Hotjar/Clarity para UX

#### Database

- [ ] **1. Backup automático**
  - Diário no mínimo
  - Armazenamento redundante
  - Testes de restore

- [ ] **2. Migrations em produção**
  ```bash
  # Rodar migrations
  npx prisma migrate deploy
  
  # Gerar Prisma Client
  npx prisma generate
  ```

- [ ] **3. Seed de produção**
  - Criar usuário admin
  - Dados essenciais (filiais, planos padrão)
  - NÃO incluir dados de teste

#### Infraestrutura

- [ ] **1. CI/CD Pipeline**
  - GitHub Actions configurado
  - Deploy automático em merge para `main`
  - Testes automáticos antes do deploy

- [ ] **2. Ambientes**
  - `development` - desenvolvimento local
  - `staging` - homologação
  - `production` - produção

- [ ] **3. Secrets Management**
  - Variáveis sensíveis no GitHub Secrets
  - Nunca commitar `.env` real
  - Rotação periódica de secrets

---

## 🛡️ Boas Práticas de Segurança

### Senhas

❌ **NÃO FAZER:**
```typescript
// Salvar senha em plain text
user.password = "senha123";
```

✅ **FAZER:**
```typescript
// Usar bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
user.password = hashedPassword;
```

### JWT

❌ **NÃO FAZER:**
```typescript
// Secret fraco
JWT_SECRET=123456
```

✅ **FAZER:**
```typescript
// Secret forte (64+ caracteres)
JWT_SECRET=kJ8sD3fG9hT2nV5bZ1xC4wQ7eR0yU6pM3iL8oK2jH5aS9dF1gT4hJ7nB0mV6cX3z
```

### Validação

❌ **NÃO FAZER:**
```typescript
// Aceitar qualquer input
@Post()
create(@Body() data: any) {
  return this.service.create(data);
}
```

✅ **FAZER:**
```typescript
// Validar com DTO
@Post()
create(@Body() createDto: CreateUserDto) {
  return this.service.create(createDto);
}
```

### CORS

❌ **NÃO FAZER:**
```typescript
// Permitir qualquer origem
app.enableCors({
  origin: '*',
});
```

✅ **FAZER:**
```typescript
// Origem específica
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

### SQL Queries

❌ **NÃO FAZER:**
```typescript
// String concatenation (SQL injection)
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`;
```

✅ **FAZER:**
```typescript
// Prisma query parametrizada
const user = await prisma.user.findUnique({
  where: { email },
});
```

---

## 📊 Auditoria de Segurança

### Vulnerabilidades Conhecidas

```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit
```

**Última verificação:** 23/11/2025  
**Resultado:** 0 vulnerabilidades críticas

### Dependências Desatualizadas

```bash
# Verificar updates
npm outdated

# Atualizar com cuidado
npm update
```

### Logs Sensíveis

✅ **VERIFICADO:** Nenhum log expondo:
- Senhas
- Tokens JWT
- Dados pessoais (CPF, CNH)
- Informações bancárias

---

## 🚨 Incidentes de Segurança

### Procedimento

1. **Identificar:** Detectar brecha/vazamento
2. **Conter:** Desabilitar funcionalidade afetada
3. **Investigar:** Logs de auditoria
4. **Remediar:** Corrigir vulnerabilidade
5. **Notificar:** Usuários afetados (se aplicável - LGPD)
6. **Documentar:** Pós-mortem e lições aprendidas

### Contatos

- **Admin Principal:** betinhochagas (GitHub)
- **Equipe Dev:** [email-dev@portaldalocadora.com.br]
- **Suporte:** [suporte@portaldalocadora.com.br]

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Prisma Security](https://www.prisma.io/docs/guides/deployment/deployment-guides/caveats-when-deploying-to-aws-platforms#security-considerations)
- [React Security](https://react.dev/learn/keeping-components-pure#side-effects-unintended-consequences)

---

**Última atualização:** 23/11/2025  
**Responsável:** GitHub Copilot (Auditoria Automatizada)
