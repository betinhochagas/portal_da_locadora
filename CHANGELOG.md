# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não Lançado]

### Em Desenvolvimento
- PASSO 19: App PWA para Motoristas
- PASSO 20: Sistema de Cobranças Semanais
- PASSO 21: Integração com Gateway de Pagamento

---

## [1.1.0] - 2025-11-23

### ✅ Cloud Storage com Adapter Pattern

#### Adicionado
- **Storage Adapter Pattern** - Arquitetura flexível para trocar entre local e cloud storage
- **LocalStorageAdapter** - Mantém armazenamento local para desenvolvimento
- **S3StorageAdapter** - Suporte a AWS S3 para produção
- **StorageModule** - Módulo global com seleção automática baseada em `STORAGE_TYPE`
- Variável de ambiente `STORAGE_TYPE` (opções: `local` ou `s3`)
- Configuração AWS S3 via variáveis de ambiente
- `docs/CLOUD_STORAGE.md` - Guia completo de configuração (400+ linhas)
- Integração com AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)

#### Melhorado
- **UploadsService** - Refatorado para usar storage adapter
- **UploadsModule** - Integração com StorageModule
- Backend agora suporta armazenamento em nuvem sem modificar código existente
- URLs presignadas do S3 com expiração de 1 hora (segurança)
- Backward compatibility total com storage local

#### Documentação
- Guia de setup AWS S3 (IAM, bucket, CORS)
- Guia de migração de local para S3
- Estimativa de custos AWS S3
- Troubleshooting de erros comuns
- Boas práticas de segurança

---

## [1.0.0] - 2025-11-23

### ✅ Auditoria Completa e Preparação para Produção

#### Adicionado
- `docs/SECURITY.md` - Guia completo de segurança e boas práticas (300+ linhas)
- `backend/.env.production.example` - Template de variáveis de ambiente para produção
- `frontend/.env.production.example` - Template de variáveis de ambiente frontend produção
- Checklist detalhado para deploy em produção
- Seção de resumo executivo em `docs/onde-parei.md`

#### Corrigido
- **pdf-generator.service.ts:** Removidos 10 console.logs de debug
- **pdf-generator.service.ts:** Corrigido erro de sintaxe (`});` extra na linha 104)
- Projeto 100% pronto para produção (0 erros críticos)

#### Melhorado
- Documentação de segurança completa
- Guias de boas práticas de código
- Procedimentos de incidente de segurança
- Templates de configuração para ambientes de produção

---

## [0.18.0] - 2025-11-22

### ✅ PASSO 18 - Template de Contrato Customizável

#### Adicionado
- Sistema completo de templates de contrato com editor
- Geração de PDF com pdfmake
- 16 placeholders dinâmicos (motorista, veículo, contrato, plano)
- CRUD de templates (7 endpoints REST)
- Páginas frontend: lista, criação, edição, visualização
- Ativação/desativação de templates
- Substituição automática de placeholders no PDF
- Template profissional com 10 cláusulas legais seedado

#### Melhorado
- ContratoDetailPage: Botão "Baixar Contrato PDF" funcional
- ContratoModal: Botão "Baixar PDF" implementado
- Utility `downloadPDF.ts` para download de PDFs

#### Técnico
- Instalado: pdfmake + @types/pdfmake (0 vulnerabilities)
- Migration: `20251122184228_add_foto_perfil_tipo_documento`
- Build: Backend SUCCESS, Frontend SUCCESS (1.32 MB)

---

## [0.17.0] - 2025-11-22

### ✅ PASSO 17 - Melhorias Página Motoristas

#### Adicionado
- Card "Veículo em Uso" para contratos ativos
- Modal "Ver Contrato Completo" com 5 seções coloridas
- Status de pagamento com 3 estados visuais (em dia, vence em X dias, atrasado)
- Upload de documentos na página de edição (4 tipos: Foto Perfil, CNH, RG, Comprovante)
- Preview de upload no cadastro (com mensagem informativa)
- Redirecionamento automático após criação → edição
- Widget "KM Rodados Esta Semana" no card de veículo
- Cálculo de KM rodados (KM atual - KM inicial)

#### Melhorado
- Fluxo de cadastro de motoristas aprimorado
- Mensagens de sucesso destacadas
- Interface de upload mais clara e intuitiva
- Dark mode em todos os componentes novos

#### Técnico
- Tipo `FOTO_PERFIL` adicionado ao enum `TipoDocumento`
- Migration aplicada com sucesso
- 0 erros de build (Backend + Frontend)

---

## [0.16.0] - 2025-11-22

### ✅ PASSO 16 - Upload de Documentos

#### Adicionado
- Sistema completo de upload de documentos digitalizados
- Componente `FileUpload` com drag-and-drop (244 linhas)
- Preview de imagens antes do upload
- 10 tipos de documentos suportados (CNH, RG, CPF, CRLV, etc)
- Página `DocumentosPage` com lista e estatísticas
- Service `documentosService` com 6 métodos
- 5 endpoints REST para gestão de documentos
- Validação de tipo e tamanho de arquivo (client + server)

#### Técnico
- Multer configurado (10MB max, pasta `uploads/`)
- Static file serving no `main.ts`
- Migration: `20251122134511_add_documentos_digitais`
- RBAC configurado (6 roles upload, 3 roles delete)

---

## [0.15.0] - 2025-11-22

### ✅ PASSO 15 - Audit Logs

#### Adicionado
- Sistema automático de rastreamento de alterações
- Interceptor global que registra CREATE, UPDATE, DELETE
- 3 endpoints REST para consulta de logs
- Página frontend com lista e filtros
- Registro de: usuário, timestamp, entidade, alterações (before/after)
- Formatação JSON pretty-print das alterações

#### Técnico
- Model `AuditLog` no Prisma
- Migration: `20251122131852_add_audit_logs`
- Enum `AuditAction` (CREATE, UPDATE, DELETE)

---

## [0.14.0] - 2025-11-22

### ✅ PASSO 14 - Alertas de Manutenção

#### Adicionado
- Widget "Manutenções Pendentes" no dashboard
- Endpoint `/stats/manutencoes-pendentes`
- Lista de veículos com manutenção próxima
- Cálculo automático: próxima manutenção a cada 10.000 km
- Alerta visual quando veículo está próximo do limite

---

## [0.13.0] - 2025-11-22

### ✅ PASSO 13 - Módulo de Manutenções

#### Adicionado
- CRUD completo de manutenções (8 endpoints)
- 3 tipos: Preventiva, Corretiva, Revisão
- 4 status: Agendada, Em Andamento, Concluída, Cancelada
- Histórico de manutenções por veículo
- Estatísticas agregadas (total gasto, média custo)
- Lista de veículos com manutenção pendente
- Páginas frontend: lista, detalhe, formulário

#### Técnico
- Model `Manutencao` no Prisma
- Migration: `20251122122814_add_manutencoes`
- Campo `nextMaintenanceKm` em Veiculo

---

## [0.12.0] - 2025-11-22

### ✅ PASSO 12 - Módulo de Cobranças

#### Adicionado
- CRUD completo de cobranças (9 endpoints)
- Geração automática de cobranças mensais
- Registro de pagamento manual
- Cálculo de dias de atraso
- Filtros por status e período
- Estatísticas: total a receber, recebido, atrasado
- Páginas frontend: lista, detalhe

#### Técnico
- Model `Cobranca` no Prisma
- Enum `PaymentStatus` (PENDENTE, PAGA, ATRASADA, CANCELADA)
- Relacionamento com Contrato

---

## [0.11.0] - 2025-11-22

### ✅ PASSO 11 - Relatórios e Dashboard

#### Adicionado
- Endpoint `/stats/dashboard` com 5 métricas principais
- Endpoint `/stats/veiculos-status` (distribuição por status)
- Endpoint `/stats/contratos-mensal` (novos contratos por mês)
- Endpoint `/stats/receita-mensal` (receita por mês)
- Dashboard completo com 8 widgets
- 3 gráficos interativos (Recharts)
- Cards de KPIs (motoristas, veículos, contratos, receita)

---

## [0.10.0] - 2025-11-22

### ✅ PASSO 10 - CRUD de Contratos

#### Adicionado
- CRUD completo de contratos (11 endpoints)
- Workflow de status: RASCUNHO → ATIVO → SUSPENSO → CANCELADO → CONCLUIDO
- 8 validações cruzadas (motorista, veículo, plano, categoria, etc)
- Troca de veículo dentro do contrato
- Controle de status do veículo (DISPONIVEL ↔ LOCADO)
- Soft delete com bloqueio de contratos ativos
- Páginas frontend: lista, detalhe

#### Técnico
- 475 linhas de lógica de negócio no service
- 3 DTOs (create, update, change-vehicle)
- Formatação de CPF/CNPJ, datas, valores

---

## [0.9.0] - 2025-11-21

### ✅ PASSO 9 - CRUD de Planos

#### Adicionado
- CRUD completo de planos (5 endpoints)
- Preços: diário, semanal, mensal
- KM inclusos + preço por KM excedente
- Categorias permitidas por plano
- Benefícios: seguro, manutenção
- Páginas frontend: lista, formulário, detalhe

---

## [0.8.0] - 2025-11-21

### ✅ PASSO 8 - CRUD de Veículos

#### Adicionado
- CRUD completo de veículos (6 endpoints)
- 5 categorias: HATCH, SEDAN, SUV, PICAPE, VAN
- 5 status: DISPONIVEL, LOCADO, MANUTENCAO, VISTORIA, INATIVO
- Controle de quilometragem
- Manutenção preventiva (próxima em KM)
- Páginas frontend: lista, formulário, detalhe

#### Técnico
- 3 enums: VehicleCategory, FuelType, Transmission, VehicleStatus

---

## [0.7.0] - 2025-11-20

### ✅ PASSO 7 - CRUD de Motoristas

#### Adicionado
- CRUD completo de motoristas (5 endpoints)
- Validações de CPF, CNH, email
- Blacklist com motivo
- Dados bancários para débito automático
- Páginas frontend: lista, formulário, detalhe
- Formatação de CPF/telefone

---

## [0.6.0] - 2025-11-19

### ✅ PASSO 6 - Autenticação JWT

#### Adicionado
- Sistema de autenticação com JWT
- Login com email + senha
- Guards: JwtAuthGuard, RolesGuard
- Decorator: @CurrentUser(), @Roles()
- RBAC com 7 roles
- Página de login no frontend
- Context de autenticação
- Private routes

#### Técnico
- JWT com expiração de 7 dias
- Bcrypt com 10 rounds
- Passport + passport-jwt

---

## [0.5.0] - 2025-11-18

### ✅ PASSO 5 - Modelagem de Domínio

#### Adicionado
- Documentação completa do domínio de negócio
- Fluxos principais: locação, cobrança, manutenção
- Casos de uso detalhados
- Regras de negócio documentadas

---

## [0.4.0] - 2025-11-17

### ✅ PASSO 4 - Setup React Frontend

#### Adicionado
- React 19 + TypeScript + Vite
- TailwindCSS para estilização
- React Router v7 para rotas
- TanStack Query para cache
- Context API para tema e autenticação
- Estrutura de pastas modular

---

## [0.3.0] - 2025-11-16

### ✅ PASSO 3 - Prisma + PostgreSQL

#### Adicionado
- Prisma ORM configurado
- Database schema completo (11 tabelas)
- 9 enums de domínio
- Docker Compose para PostgreSQL + PgAdmin
- 4 migrations aplicadas
- Seed com dados de demonstração

#### Técnico
- PostgreSQL 16
- Prisma Client type-safe
- Migrations versionadas

---

## [0.2.0] - 2025-11-15

### ✅ PASSO 2 - Setup NestJS Backend

#### Adicionado
- NestJS framework configurado
- Estrutura modular (modules, controllers, services)
- Validation com class-validator
- Exception filters
- CORS habilitado
- API prefix: `/api/v1`

---

## [0.1.0] - 2025-11-14

### ✅ PASSO 1 - Documentação Inicial

#### Adicionado
- README.md principal
- SETUP.md com instruções detalhadas
- Documentação de arquitetura
- Decisões de stack técnicas
- Estrutura de pastas
- Git hooks e convenções

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Modificado** para mudanças em funcionalidades existentes
- **Descontinuado** para funcionalidades que serão removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correção de bugs
- **Segurança** para vulnerabilidades corrigidas

---

**Convenções de Versionamento:**
- **Major (X.0.0):** Mudanças incompatíveis na API
- **Minor (0.X.0):** Novas funcionalidades compatíveis
- **Patch (0.0.X):** Correções de bugs compatíveis
