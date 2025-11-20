# Portal da Locadora - Sistema de Gestão para Motoristas de App

Sistema completo de gestão para locadoras que atendem motoristas de aplicativos (Uber, 99, etc.).

## Stack Tecnológica
- **Backend:** NestJS + TypeScript + Prisma ORM
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Banco de Dados:** PostgreSQL
- **Testes:** Jest + Supertest + React Testing Library

## Estrutura do Projeto
```
portal_da_locadora/
├── backend/          # API NestJS
├── frontend/         # SPA React
├── docs/             # Documentação técnica e de negócio
└── docker-compose.yml
```

## Documentação
- 📋 [Setup Completo](./SETUP.md) - Guia de instalação e configuração
- 🏗️ [Decisão de Stack](./docs/arquitetura/decisao-stack.md)
- 🎯 [Visão Geral da Arquitetura](./docs/arquitetura/visao-geral.md)
- 🔐 [RBAC e Permissões](./docs/arquitetura/rbac-permissoes.md)
- 📊 [Modelagem de Domínio](./docs/dominio/modelagem.md)
- 🚗 [Jornada do Motorista](./docs/dominio/jornada-motorista.md)
- 🚙 [Gestão de Frota](./docs/dominio/gestao-frota.md)
- 🔌 [Endpoints da API](./docs/api/endpoints.md)
- 📝 [Onde Parei](./docs/onde-parei.md) - Status do projeto

## Como Começar

### Setup Rápido
```bash
# 1. Clone o repositório
git clone https://github.com/betinhochagas/portal_da_locadora.git
cd portal_da_locadora

# 2. Instale as dependências
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Suba o banco de dados
docker-compose up -d

# 4. Configure o backend
cd backend
npx prisma migrate dev
npx prisma db seed

# 5. Inicie os servidores (2 terminais)
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

**Acesse:** http://localhost:5173  
**Login:** admin@portaldalocadora.com / senha123

📖 **Documentação completa:** [SETUP.md](./SETUP.md)

## Funcionalidades Implementadas

✅ **Autenticação e Autorização**
- Login com JWT
- RBAC (7 perfis de usuário)
- Guards de rotas protegidas

✅ **CRUD de Motoristas**
- Cadastro completo (dados pessoais, CNH, endereço, banco)
- Validações (CPF/CNPJ único, telefone formatado)
- Controle de blacklist
- Listagem com filtros

✅ **CRUD de Veículos**
- Gestão completa da frota
- Status (disponível, locado, manutenção)
- Relacionamento com filiais
- Validações de placa, renavam, chassi

✅ **Interface Moderna**
- Tema Dark/Light Mode com persistência
- Design responsivo (Tailwind CSS)
- Transições suaves
- Dashboard com estatísticas

## Licença
MIT

## Desenvolvedor
Roberto Chagas - [@betinhochagas](https://github.com/betinhochagas)
