// Enum de status do contrato (alinhado com Prisma)
const ContractStatusEnum = {
  RASCUNHO: 'RASCUNHO',
  ATIVO: 'ATIVO',
  SUSPENSO: 'SUSPENSO',
  CANCELADO: 'CANCELADO',
  CONCLUIDO: 'CONCLUIDO',
} as const;

export type ContractStatus =
  (typeof ContractStatusEnum)[keyof typeof ContractStatusEnum];

export { ContractStatusEnum as ContractStatus };

// Labels em português para os status
export const ContractStatusLabels: Record<ContractStatus, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
};

// Cores dos badges por status
export const ContractStatusColors: Record<
  ContractStatus,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  RASCUNHO: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    darkBg: 'dark:bg-gray-700',
    darkText: 'dark:text-gray-300',
  },
  ATIVO: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-300',
  },
  SUSPENSO: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    darkBg: 'dark:bg-yellow-900',
    darkText: 'dark:text-yellow-300',
  },
  CANCELADO: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    darkBg: 'dark:bg-red-900',
    darkText: 'dark:text-red-300',
  },
  CONCLUIDO: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-900',
    darkText: 'dark:text-blue-300',
  },
};

// Type do Contrato (alinhado com schema Prisma)
export type Contrato = {
  id: string;
  contractNumber: string;

  // IDs dos relacionamentos
  motoristaId: string;
  veiculoId: string;
  planoId: string;
  filialId: string;

  // Período
  startDate: string;
  endDate: string;
  billingDay: number;

  // Valores
  monthlyAmount: number;
  deposit: number | null;

  // Quilometragem
  kmStart: number;
  kmCurrent: number | null;

  // Status
  status: ContractStatus;

  // Observações
  notes: string | null;

  // Datas de controle
  signedAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;

  createdAt: string;
  updatedAt: string;

  // Relacionamentos (opcional - incluídos quando fazemos include no backend)
  motorista?: {
    id: string;
    name: string;
    cpf: string | null;
    cnpj: string | null;
    phone: string;
  };
  veiculo?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    category: string;
  };
  plano?: {
    id: string;
    name: string;
    monthlyPrice: number;
  };
  filial?: {
    id: string;
    name: string;
    city: string;
  };
};

// DTO para criação de Contrato
export type CreateContratoDto = {
  contractNumber: string;
  motoristaId: string;
  veiculoId: string;
  planoId: string;
  filialId: string;
  startDate: string;
  endDate: string;
  billingDay: number;
  monthlyAmount: number;
  deposit?: number;
  kmStart: number;
  kmCurrent?: number;
  notes?: string;
};

// DTO para atualização de Contrato
export type UpdateContratoDto = Partial<CreateContratoDto> & {
  status?: ContractStatus;
  cancelReason?: string;
};

// DTO para troca de veículo
export type ChangeVehicleDto = {
  newVeiculoId: string;
  reason: string;
};
