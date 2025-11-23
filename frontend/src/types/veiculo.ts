export type VeiculoStatus = 'DISPONIVEL' | 'ALUGADO' | 'MANUTENCAO' | 'INATIVO';

export type VehicleCategory = 'HATCH' | 'SEDAN' | 'SUV' | 'PICAPE' | 'VAN';

export interface Veiculo {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: VehicleCategory;
  status: VeiculoStatus;
  km: number; // Campo correto no schema Prisma
  active: boolean;
  createdAt: string;
  updatedAt: string;
  contratos?: Array<{
    id: string;
    contractNumber: string;
    status: string;
  }>;
}
