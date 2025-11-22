// Const enum pattern para verbatimModuleSyntax
export const MaintenanceType = {
  PREVENTIVA: 'PREVENTIVA',
  CORRETIVA: 'CORRETIVA',
  REVISAO: 'REVISAO',
} as const;

export type MaintenanceType =
  (typeof MaintenanceType)[keyof typeof MaintenanceType];

export const MaintenanceStatus = {
  AGENDADA: 'AGENDADA',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
} as const;

export type MaintenanceStatus =
  (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

// Interfaces
export interface Manutencao {
  id: string;
  veiculoId: string;
  type: MaintenanceType;
  description: string;
  date: string;
  mileage: number;
  cost: number;
  provider: string;
  status: MaintenanceStatus;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  veiculo?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    mileage: number;
  };
}

export interface CreateManutencaoData {
  veiculoId: string;
  type: MaintenanceType;
  description: string;
  date: string;
  mileage: number;
  cost: number;
  provider: string;
  status?: MaintenanceStatus;
  observations?: string;
}

export interface UpdateManutencaoData {
  veiculoId?: string;
  type?: MaintenanceType;
  description?: string;
  date?: string;
  mileage?: number;
  cost?: number;
  provider?: string;
  status?: MaintenanceStatus;
  observations?: string;
}

export interface ManutencaoHistorico {
  veiculo: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    mileage: number;
  };
  stats: {
    totalCost: number;
    totalManutencoes: number;
    byType: Record<string, number>;
  };
  historico: Manutencao[];
}

export interface VeiculoComManutencaoPendente {
  veiculo: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    mileage: number;
    status: string;
  };
  manutencoesPendentes: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    status: string;
    cost: number;
    provider: string;
  }>;
}

export interface ProximaManutencaoPreventiva {
  veiculo: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    quilometragemAtual: number;
  };
  ultimaPreventiva: {
    date: string;
    mileage: number;
  } | null;
  proximaManutencaoKm: number;
  kmRestantes: number;
  necessitaManutencao: boolean;
}

// Helper functions
export const maintenanceTypeLabel: Record<MaintenanceType, string> = {
  [MaintenanceType.PREVENTIVA]: 'Preventiva',
  [MaintenanceType.CORRETIVA]: 'Corretiva',
  [MaintenanceType.REVISAO]: 'Revisão',
};

export const maintenanceTypeColor: Record<MaintenanceType, string> = {
  [MaintenanceType.PREVENTIVA]: 'blue',
  [MaintenanceType.CORRETIVA]: 'orange',
  [MaintenanceType.REVISAO]: 'purple',
};

export const maintenanceStatusLabel: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.AGENDADA]: 'Agendada',
  [MaintenanceStatus.EM_ANDAMENTO]: 'Em Andamento',
  [MaintenanceStatus.CONCLUIDA]: 'Concluída',
  [MaintenanceStatus.CANCELADA]: 'Cancelada',
};

export const maintenanceStatusColor: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.AGENDADA]: 'yellow',
  [MaintenanceStatus.EM_ANDAMENTO]: 'blue',
  [MaintenanceStatus.CONCLUIDA]: 'green',
  [MaintenanceStatus.CANCELADA]: 'red',
};
