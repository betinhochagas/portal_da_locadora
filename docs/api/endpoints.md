# Endpoints da API

Base URL: `http://localhost:3000/api/v1`

## Autenticação

### POST /auth/login
Login de usuário.

**Payload:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta (200):**
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "filial": {
      "id": "string",
      "name": "string",
      "city": "string",
      "state": "string"
    }
  }
}
```

**Guards:** Público  
**RBAC:** N/A

---

## Motoristas

### GET /motoristas
Lista todos os motoristas.

**Resposta (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "cpf": "string",
    "cnpj": "string (opcional)",
    "phone": "string",
    "email": "string (opcional)",
    "cnh": "string",
    "cnhCategory": "string",
    "cnhExpiry": "date",
    "active": "boolean",
    "blacklisted": "boolean",
    "blacklistReason": "string (opcional)",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /motoristas/:id
Busca motorista por ID.

**Resposta (200):** Objeto motorista (igual ao GET /motoristas, único elemento)

**Guards:** JWT  
**RBAC:** Todos os perfis

### POST /motoristas
Cria novo motorista.

**Payload:**
```json
{
  "name": "string",
  "cpf": "string (11 dígitos)",
  "cnpj": "string (14 dígitos, opcional)",
  "phone": "string",
  "email": "string (opcional)",
  "cnh": "string",
  "cnhCategory": "string",
  "cnhExpiry": "date (ISO 8601)"
}
```

**Resposta (201):** Objeto motorista criado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE

### PATCH /motoristas/:id
Atualiza motorista.

**Payload:** Campos opcionais do POST (PartialType)

**Resposta (200):** Objeto motorista atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE

### DELETE /motoristas/:id
Remove motorista (soft delete).

**Resposta (200):** Objeto motorista removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

---

## Veículos

### GET /veiculos
Lista todos os veículos.

**Resposta (200):**
```json
[
  {
    "id": "string",
    "plate": "string",
    "brand": "string",
    "model": "string",
    "year": "number",
    "color": "string",
    "category": "string",
    "renavam": "string",
    "chassi": "string",
    "currentKm": "number",
    "status": "DISPONIVEL | LOCADO | MANUTENCAO | INATIVO",
    "createdAt": "date",
    "updatedAt": "date",
    "filial": {
      "id": "string",
      "name": "string"
    }
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /veiculos/:id
Busca veículo por ID.

**Resposta (200):** Objeto veículo (igual ao GET /veiculos, único elemento)

**Guards:** JWT  
**RBAC:** Todos os perfis

### POST /veiculos
Cria novo veículo.

**Payload:**
```json
{
  "plate": "string",
  "brand": "string",
  "model": "string",
  "year": "number",
  "color": "string",
  "category": "string",
  "renavam": "string (11 dígitos)",
  "chassi": "string (17 caracteres)",
  "currentKm": "number",
  "filialId": "string (UUID)"
}
```

**Resposta (201):** Objeto veículo criado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA

### PATCH /veiculos/:id
Atualiza veículo.

**Payload:** Campos opcionais do POST (PartialType)

**Resposta (200):** Objeto veículo atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### DELETE /veiculos/:id
Remove veículo (soft delete).

**Resposta (200):** Objeto veículo removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

### GET /veiculos/alertas-manutencao
Lista veículos que precisam de manutenção preventiva em breve (dentro de 1000 km) ou já estão atrasados.

**Resposta (200):**
```json
[
  {
    "id": "string",
    "plate": "string",
    "brand": "string",
    "model": "string",
    "year": "number",
    "category": "HATCH | SEDAN | SUV | PICKUP",
    "km": "number",
    "nextMaintenanceKm": "number",
    "kmRestantes": "number",
    "atrasado": "boolean",
    "filial": {
      "id": "string",
      "name": "string"
    }
  }
]
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

**Lógica:**
- Retorna veículos onde `km >= nextMaintenanceKm - 1000`
- Campo `kmRestantes` = `nextMaintenanceKm - km` (pode ser negativo)
- Campo `atrasado` = `true` se `km >= nextMaintenanceKm`
- Ordenado por `nextMaintenanceKm` crescente

---

## Planos

### GET /planos
Lista todos os planos.

**Resposta (200):**
```json
[
  {
    "id": "string",
    "code": "string",
    "name": "string",
    "description": "string (opcional)",
    "category": "string",
    "weeklyKmLimit": "number",
    "monthlyAmount": "number",
    "kmExcessFee": "number",
    "insuranceIncluded": "boolean",
    "active": "boolean",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /planos/:id
Busca plano por ID.

**Resposta (200):** Objeto plano (igual ao GET /planos, único elemento)

**Guards:** JWT  
**RBAC:** Todos os perfis

### POST /planos
Cria novo plano.

**Payload:**
```json
{
  "code": "string (único)",
  "name": "string",
  "description": "string (opcional)",
  "category": "string",
  "weeklyKmLimit": "number",
  "monthlyAmount": "number",
  "kmExcessFee": "number",
  "insuranceIncluded": "boolean"
}
```

**Resposta (201):** Objeto plano criado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO

### PATCH /planos/:id
Atualiza plano.

**Payload:** Campos opcionais do POST (PartialType) + `active: boolean`

**Resposta (200):** Objeto plano atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO

### DELETE /planos/:id
Remove plano (soft delete).

**Resposta (200):** Objeto plano removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

---

## Contratos

### GET /contratos
Lista todos os contratos.

**Resposta (200):**
```json
[
  {
    "id": "string",
    "code": "string",
    "startDate": "date",
    "endDate": "date",
    "monthlyAmount": "number",
    "depositAmount": "number",
    "initialKm": "number",
    "status": "RASCUNHO | ATIVO | SUSPENSO | CANCELADO | CONCLUIDO",
    "observations": "string (opcional)",
    "createdAt": "date",
    "updatedAt": "date",
    "motorista": {
      "id": "string",
      "name": "string",
      "cpf": "string",
      "phone": "string"
    },
    "veiculo": {
      "id": "string",
      "plate": "string",
      "brand": "string",
      "model": "string"
    },
    "plano": {
      "id": "string",
      "name": "string"
    },
    "filial": {
      "id": "string",
      "name": "string"
    }
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /contratos/:id
Busca contrato por ID.

**Resposta (200):** Objeto contrato (igual ao GET /contratos, único elemento)

**Guards:** JWT  
**RBAC:** Todos os perfis

### POST /contratos
Cria novo contrato.

**Payload:**
```json
{
  "code": "string (único)",
  "motoristaId": "string (UUID)",
  "veiculoId": "string (UUID)",
  "planoId": "string (UUID)",
  "filialId": "string (UUID)",
  "startDate": "date (ISO 8601)",
  "endDate": "date (ISO 8601)",
  "monthlyAmount": "number",
  "depositAmount": "number",
  "initialKm": "number",
  "observations": "string (opcional)"
}
```

**Validações:**
- Motorista deve estar ativo e não blacklisted
- Veículo deve estar DISPONIVEL
- Plano deve estar ativo
- Categoria do plano deve ser compatível com veículo
- startDate < endDate
- Não pode haver outro contrato ativo para o mesmo motorista
- Não pode haver outro contrato ativo para o mesmo veículo

**Resposta (201):** Objeto contrato criado  
**Side effects:** Veículo alterado para status LOCADO

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE

### PATCH /contratos/:id
Atualiza contrato.

**Payload:** Campos opcionais do POST (PartialType) + `status: string`

**Resposta (200):** Objeto contrato atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA, ATENDENTE

### DELETE /contratos/:id
Remove contrato (soft delete).

**Resposta (200):** Objeto contrato removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

### POST /contratos/:id/activate
Ativa contrato (RASCUNHO → ATIVO).

**Resposta (200):** Objeto contrato ativado  
**Side effects:** Veículo alterado para LOCADO

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### POST /contratos/:id/suspend
Suspende contrato (ATIVO → SUSPENSO).

**Payload:**
```json
{
  "reason": "string"
}
```

**Resposta (200):** Objeto contrato suspenso  
**Side effects:** Veículo alterado para DISPONIVEL

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### POST /contratos/:id/reactivate
Reativa contrato (SUSPENSO → ATIVO).

**Resposta (200):** Objeto contrato reativado  
**Side effects:** Veículo alterado para LOCADO

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### POST /contratos/:id/cancel
Cancela contrato (qualquer status → CANCELADO).

**Payload:**
```json
{
  "reason": "string"
}
```

**Resposta (200):** Objeto contrato cancelado  
**Side effects:** Veículo alterado para DISPONIVEL

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### POST /contratos/:id/complete
Conclui contrato (ATIVO → CONCLUIDO).

**Payload:**
```json
{
  "finalKm": "number"
}
```

**Validação:** finalKm >= initialKm

**Resposta (200):** Objeto contrato concluído  
**Side effects:** Veículo alterado para DISPONIVEL, currentKm atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

### POST /contratos/:id/change-vehicle
Troca veículo do contrato.

**Payload:**
```json
{
  "newVeiculoId": "string (UUID)",
  "reason": "string"
}
```

**Validações:**
- Contrato deve estar ATIVO
- Novo veículo deve estar DISPONIVEL
- Novo veículo deve ser compatível com plano

**Resposta (200):** Objeto contrato atualizado  
**Side effects:** 
- Veículo antigo alterado para DISPONIVEL
- Novo veículo alterado para LOCADO

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GESTOR_FROTA, GERENTE_LOJA

---

## Estatísticas

### GET /stats/dashboard
Estatísticas gerais do dashboard.

**Resposta (200):**
```json
{
  "contratos": {
    "total": "number",
    "ativos": "number",
    "suspensos": "number",
    "vencendo30dias": "number"
  },
  "veiculos": {
    "total": "number",
    "disponiveis": "number",
    "locados": "number",
    "manutencao": "number",
    "taxaOcupacao": "number (percentual)"
  },
  "motoristas": {
    "total": "number",
    "ativos": "number",
    "blacklist": "number"
  },
  "receita": {
    "mensalEstimada": "number"
  }
}
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /stats/contratos/vencendo
Lista contratos vencendo em N dias.

**Query params:**
- `dias` (opcional, padrão: 30): número de dias

**Resposta (200):**
```json
[
  {
    "id": "string",
    "code": "string",
    "startDate": "date",
    "endDate": "date",
    "monthlyAmount": "number",
    "status": "string",
    "motorista": {
      "id": "string",
      "name": "string",
      "phone": "string"
    },
    "veiculo": {
      "id": "string",
      "plate": "string",
      "brand": "string",
      "model": "string"
    },
    "plano": {
      "id": "string",
      "name": "string"
    }
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis

### GET /stats/receita/mensal
Receita mensal dos últimos N meses.

**Query params:**
- `meses` (opcional, padrão: 6): número de meses

**Resposta (200):**
```json
[
  {
    "mes": "string (YYYY-MM)",
    "receita": "number"
  }
]
```

**Guards:** JWT  
**RBAC:** Todos os perfis (FINANCEIRO, DIRETORIA, ADMIN têm acesso privilegiado)

### GET /stats/frota/distribuicao
Distribuição da frota por categoria e status.

**Resposta (200):**
```json
{
  "porCategoria": [
    {
      "categoria": "string",
      "quantidade": "number"
    }
  ],
  "porStatus": [
    {
      "status": "string",
      "quantidade": "number"
    }
  ]
}
```

**Guards:** JWT  
**RBAC:** Todos os perfis

---

## Cobranças

### GET /cobrancas
Lista todas as cobranças.

**Query params:**
- `contratoId` (opcional): Filtrar por contrato
- `status` (opcional): Filtrar por status (PENDENTE, PAGA, ATRASADA, CANCELADA)

**Resposta (200):**
```json
[
  {
    "id": "string",
    "contratoId": "string",
    "referenceMonth": "string (YYYY-MM)",
    "dueDate": "date",
    "amount": "number",
    "status": "PENDENTE | PAGA | ATRASADA | CANCELADA",
    "paymentDate": "date | null",
    "paymentMethod": "string | null",
    "daysLate": "number",
    "lateFee": "number | null",
    "observations": "string | null",
    "contrato": {
      "id": "string",
      "contractNumber": "string",
      "motorista": {
        "id": "string",
        "name": "string",
        "phone": "string",
        "cpf": "string | null",
        "cnpj": "string | null"
      },
      "veiculo": {
        "id": "string",
        "plate": "string",
        "brand": "string",
        "model": "string"
      },
      "plano": {
        "id": "string",
        "name": "string"
      }
    }
  }
]
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA, ATENDENTE

### GET /cobrancas/inadimplentes
Lista cobranças atrasadas.

**Resposta (200):** Array de cobranças (igual ao GET /cobrancas)

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA

### GET /cobrancas/:id
Busca cobrança por ID.

**Resposta (200):** Objeto cobrança (igual ao GET /cobrancas, único elemento)

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA, ATENDENTE

### POST /cobrancas
Cria nova cobrança manualmente.

**Payload:**
```json
{
  "contratoId": "string (UUID)",
  "referenceMonth": "string (YYYY-MM)",
  "dueDate": "date (ISO 8601)",
  "amount": "number",
  "observations": "string (opcional)"
}
```

**Validações:**
- Contrato deve existir e estar ATIVO
- Não pode haver cobrança duplicada para o mesmo mês/contrato

**Resposta (201):** Objeto cobrança criado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA

### PATCH /cobrancas/:id
Atualiza cobrança.

**Payload:** Campos opcionais do POST + status, paymentDate, paymentMethod, daysLate, lateFee

**Validações:**
- Não pode alterar cobrança já PAGA

**Resposta (200):** Objeto cobrança atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA

### DELETE /cobrancas/:id
Remove cobrança.

**Validações:**
- Não pode excluir cobrança já PAGA

**Resposta (200):** Objeto cobrança removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

### POST /cobrancas/:id/registrar-pagamento
Registra pagamento de uma cobrança.

**Payload:**
```json
{
  "paymentDate": "date (ISO 8601)",
  "paymentMethod": "string (PIX, TED, Dinheiro, Cartão, etc.)",
  "lateFee": "number (opcional)",
  "observations": "string (opcional)"
}
```

**Validações:**
- Cobrança não pode estar PAGA ou CANCELADA
- Calcula automaticamente dias de atraso baseado na data de pagamento vs vencimento

**Resposta (200):** Objeto cobrança atualizado com status PAGA

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO, GERENTE_LOJA, ATENDENTE

### POST /cobrancas/gerar-mensais
Gera cobranças do mês atual para todos os contratos ativos.

**Resposta (200):**
```json
{
  "message": "string",
  "cobrancas": [/* array de cobranças criadas */]
}
```

**Lógica:**
- Busca todos os contratos com status ATIVO
- Verifica se já existe cobrança para o mês atual
- Cria cobrança com valor = contrato.monthlyAmount
- Define vencimento baseado em contrato.billingDay

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO

### POST /cobrancas/atualizar-atrasadas
Atualiza status de cobranças PENDENTES para ATRASADAS (vencimento < hoje).

**Resposta (200):**
```json
{
  "message": "string"
}
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, FINANCEIRO

---

## Manutenções

### GET /manutencoes
Lista todas as manutenções.

**Query params:**
- `veiculoId` (opcional): Filtrar por veículo
- `status` (opcional): Filtrar por status (AGENDADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA)

**Resposta (200):**
```json
[
  {
    "id": "string",
    "veiculoId": "string",
    "type": "PREVENTIVA | CORRETIVA | REVISAO",
    "description": "string",
    "date": "date",
    "mileage": "number",
    "cost": "number",
    "provider": "string",
    "status": "AGENDADA | EM_ANDAMENTO | CONCLUIDA | CANCELADA",
    "observations": "string | null",
    "createdAt": "date",
    "updatedAt": "date",
    "veiculo": {
      "id": "string",
      "plate": "string",
      "brand": "string",
      "model": "string",
      "year": "number",
      "category": "string",
      "mileage": "number"
    }
  }
]
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA, ATENDENTE, FINANCEIRO

### GET /manutencoes/pendentes
Lista veículos com manutenções pendentes (AGENDADA ou EM_ANDAMENTO).

**Resposta (200):**
```json
[
  {
    "veiculo": {
      "id": "string",
      "plate": "string",
      "brand": "string",
      "model": "string",
      "year": "number",
      "category": "string",
      "mileage": "number",
      "status": "string"
    },
    "manutencoesPendentes": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "date": "date",
        "status": "string",
        "cost": "number",
        "provider": "string"
      }
    ]
  }
]
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA

### GET /manutencoes/veiculo/:veiculoId/historico
Busca histórico completo de manutenções de um veículo.

**Resposta (200):**
```json
{
  "veiculo": {
    "id": "string",
    "plate": "string",
    "brand": "string",
    "model": "string",
    "mileage": "number"
  },
  "stats": {
    "totalCost": "number",
    "totalManutencoes": "number",
    "byType": {
      "PREVENTIVA": "number",
      "CORRETIVA": "number",
      "REVISAO": "number"
    }
  },
  "historico": [/* array de manutenções */]
}
```

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA, ATENDENTE

### GET /manutencoes/veiculo/:veiculoId/proxima-preventiva
Calcula quando será a próxima manutenção preventiva baseada na quilometragem.

**Resposta (200):**
```json
{
  "veiculo": {
    "id": "string",
    "plate": "string",
    "brand": "string",
    "model": "string",
    "quilometragemAtual": "number"
  },
  "ultimaPreventiva": {
    "date": "date",
    "mileage": "number"
  } | null,
  "proximaManutencaoKm": "number",
  "kmRestantes": "number",
  "necessitaManutencao": "boolean"
}
```

**Lógica:**
- Intervalo padrão: 10.000 km entre manutenções preventivas
- Alerta quando faltam menos de 1.000 km (`necessitaManutencao: true`)

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA

### GET /manutencoes/:id
Busca manutenção por ID.

**Resposta (200):** Objeto manutenção (igual ao GET /manutencoes, único elemento)

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA, ATENDENTE, FINANCEIRO

### POST /manutencoes
Cria nova manutenção.

**Payload:**
```json
{
  "veiculoId": "string (UUID)",
  "type": "PREVENTIVA | CORRETIVA | REVISAO",
  "description": "string",
  "date": "date (ISO 8601)",
  "mileage": "number",
  "cost": "number",
  "provider": "string",
  "status": "AGENDADA | EM_ANDAMENTO | CONCLUIDA | CANCELADA (opcional)",
  "observations": "string (opcional)"
}
```

**Validações:**
- Veículo deve existir
- Status padrão: AGENDADA

**Resposta (201):** Objeto manutenção criado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA

### PATCH /manutencoes/:id
Atualiza manutenção.

**Payload:** Campos opcionais do POST

**Validações:**
- Se mudar `veiculoId`, o novo veículo deve existir

**Resposta (200):** Objeto manutenção atualizado

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA, GERENTE_LOJA

### DELETE /manutencoes/:id
Remove manutenção.

**Resposta (200):** Objeto manutenção removido

**Guards:** JWT  
**RBAC:** ADMIN, DIRETORIA

---

## Relatórios
Implementado na página frontend `/relatorios` com consumo dos endpoints de stats acima.
