# 🚗 Portal do Motorista - Guia de Teste

## ✅ Implementado Até Agora

### Backend (Dia 1/10 - Completo)
- ✅ Campos de autenticação no Motorista (password, passwordReset, loginAttempts, etc.)
- ✅ JWT Strategy separada (`MotoristaJwtStrategy`)
- ✅ Auth Guard (`MotoristaAuthGuard`)
- ✅ 4 Endpoints de autenticação funcionais
- ✅ Geração automática de senha ao criar motorista
- ✅ Proteção contra brute force (5 tentativas → 15 min bloqueio)

### Frontend (Dia 2/10 - Parcial)
- ✅ Context de autenticação (`MotoristaAuthContext`)
- ✅ Service de autenticação (`motorista-auth.service.ts`)
- ✅ 3 Páginas de autenticação mobile-first:
  - Login (`/motorista/login`)
  - Primeiro Acesso (`/motorista/primeiro-acesso`)
  - Esqueci Senha (`/motorista/esqueci-senha`)
- ✅ Private Route component
- ✅ Integração com App.tsx

---

## 📱 Como Testar no Celular

### 1. Descobrir o IP do seu PC
```powershell
ipconfig
```
Procure por "Endereço IPv4" (ex: `192.168.1.10`)

### 2. Iniciar Backend
```powershell
cd backend
npm run start:dev
```
Backend rodará em: `http://localhost:3000`

### 3. Iniciar Frontend
```powershell
cd frontend
npm run dev
```
Frontend rodará em: `http://0.0.0.0:5173`

### 4. Acessar no Celular
Certifique-se que o celular está na **mesma rede Wi-Fi** do PC:
```
http://SEU_IP:5173/motorista/login
Exemplo: http://192.168.1.10:5173/motorista/login
```

---

## 🧪 Fluxo de Teste

### 1. Criar um Motorista (Admin)
Acesse o sistema admin e crie um motorista. O sistema irá:
- Gerar uma senha aleatória de 8 caracteres
- Retornar a senha no response
- **TODO**: Enviar por email (não implementado ainda)

Exemplo de senha gerada: `aB3xK9mP`

### 2. Fazer Login (Motorista)
Acesse `/motorista/login` no celular:
- **CPF**: Digite o CPF do motorista (com ou sem máscara)
- **Senha**: Use a senha gerada (ex: `aB3xK9mP`)

### 3. Primeiro Acesso
Se for o primeiro login, você será redirecionado para `/motorista/primeiro-acesso`:
- Digite a senha atual (enviada)
- Crie uma nova senha (mínimo 8 caracteres, letras + números)
- Confirme a nova senha

### 4. Próximo Login
Nos próximos logins, use o CPF e a nova senha criada.

### 5. Esqueci Senha
Se esquecer a senha, clique em "Esqueci minha senha":
- Digite o CPF
- **TODO**: Receberá email com instruções (não implementado ainda)

---

## 🎨 Design Mobile-First

### Características Implementadas:
✅ **Gradiente Vibrante**: Azul → Roxo no background
✅ **Cards com Sombra**: Elevação e bordas arredondadas
✅ **Touch-Friendly**: Botões com altura mínima de 44px
✅ **Formatação CPF**: Máscara automática enquanto digita
✅ **Toggle Senha**: Ícone de olho para mostrar/ocultar
✅ **Feedback Visual**: Cores para sucesso/erro
✅ **Loading States**: Spinners e estados desabilitados
✅ **Responsivo**: Max-width 640px, centralizado

### Ainda NÃO Implementado:
❌ Bottom Navigation Bar (4 ícones fixos)
❌ Dashboard do Motorista
❌ Páginas de Contratos
❌ Páginas de Pagamentos
❌ Perfil do Motorista

---

## 🔐 Segurança

### Proteção Contra Brute Force
- Máximo 5 tentativas de login
- Após 5 tentativas: conta bloqueada por 15 minutos
- Contador resetado após login bem-sucedido

### Validações de Senha
**Primeiro Acesso:**
- Mínimo 8 caracteres
- Pelo menos 1 letra
- Pelo menos 1 número
- Confirmação de senha

### JWT Tokens
- Expiração: 7 dias
- Payload: `{ motoristaId, type: 'motorista' }`
- Separado do token admin

---

## 📊 Endpoints Backend

### POST `/auth/motorista/login`
```json
Request:
{
  "cpf": "12345678900",
  "senha": "abc123XY"
}

Response 200:
{
  "access_token": "eyJ...",
  "motorista": {
    "id": 1,
    "cpf": "123.456.789-00",
    "nome": "João Silva",
    ...
  }
}

Response 401:
{ "message": "CPF ou senha incorretos" }

Response 403:
{ "message": "Conta bloqueada por múltiplas tentativas. Tente novamente em 15 minutos." }
```

### POST `/auth/motorista/primeiro-acesso`
```json
Request:
Headers: { "Authorization": "Bearer token..." }
{
  "cpf": "12345678900",
  "senhaAtual": "abc123XY",
  "novaSenha": "Senha@123"
}

Response 200:
{
  "access_token": "eyJ...",
  "motorista": { ... }
}
```

### POST `/auth/motorista/esqueci-senha`
```json
Request:
{
  "cpf": "12345678900"
}

Response 200:
{ "message": "Email enviado com instruções para reset de senha" }
```

---

## 🐛 Troubleshooting

### Problema: "Não consigo acessar do celular"
**Solução:**
- Certifique-se que PC e celular estão na **mesma rede Wi-Fi**
- Verifique se o firewall não está bloqueando a porta 5173
- Use o IP correto do PC (veja com `ipconfig`)

### Problema: "CPF ou senha incorretos"
**Solução:**
- Verifique se o motorista foi criado no sistema admin
- Use a senha gerada (retornada ao criar motorista)
- Aguarde 15 minutos se a conta estiver bloqueada

### Problema: "Erro ao conectar com backend"
**Solução:**
- Certifique-se que o backend está rodando em `localhost:3000`
- Verifique se o PostgreSQL está rodando
- Confira se a migration foi aplicada (`npx prisma migrate dev`)

---

## 📝 TODO - Próximas Implementações

### Frontend (Dias 3-5):
- [ ] Layout com Bottom Navigation
- [ ] Dashboard do Motorista
- [ ] Lista de Contratos
- [ ] Detalhe do Contrato com PDF
- [ ] Histórico de Pagamentos
- [ ] Página de Perfil

### Backend (Dias 6-8):
- [ ] GET `/motorista/contratos` - Listar contratos do motorista logado
- [ ] GET `/motorista/contratos/:id` - Detalhe do contrato
- [ ] GET `/motorista/contratos/:id/pdf` - Download PDF
- [ ] GET `/motorista/pagamentos` - Histórico de pagamentos
- [ ] GET `/motorista/perfil` - Dados do perfil
- [ ] PUT `/motorista/perfil` - Atualizar perfil

### Email Integration (Dia 9):
- [ ] Enviar credenciais ao criar motorista
- [ ] Enviar link de reset de senha
- [ ] Templates HTML bonitos

### PWA (Dia 10):
- [ ] Manifest.json
- [ ] Service Worker
- [ ] Ícones para iOS/Android
- [ ] "Adicionar à tela inicial"

---

## 🎯 Status Atual

**Progresso:** 20% (2/10 dias)

**Funcional:**
- ✅ Login do motorista
- ✅ Primeiro acesso com troca de senha
- ✅ Esqueci senha (sem email ainda)
- ✅ Proteção contra brute force

**Testável no Celular:**
- ✅ Design mobile-first
- ✅ Touch-friendly
- ✅ Gradientes e cores vibrantes

**Próximo Passo:**
Criar layout com bottom navigation e dashboard.

---

**Dúvidas?** Veja a especificação completa em: `docs/PASSO_20_PORTAL_MOTORISTA.md`
