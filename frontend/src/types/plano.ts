// Enums importados do Prisma (devem estar sincronizados)
const VehicleCategoryEnum = {
  HATCH: 'HATCH',
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  PICAPE: 'PICAPE',
  VAN: 'VAN',
} as const;

export type VehicleCategory =
  (typeof VehicleCategoryEnum)[keyof typeof VehicleCategoryEnum];

export { VehicleCategoryEnum as VehicleCategory };

// Labels em português para as categorias
export const VehicleCategoryLabels: Record<VehicleCategory, string> = {
  HATCH: 'Hatch',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  PICAPE: 'Picape',
  VAN: 'Van',
};

// Type do Plano (alinhada com schema Prisma)
export type Plano = {
  id: string;
  name: string;
  description: string | null;

  // Preços
  dailyPrice: number;
  weeklyPrice: number | null;
  monthlyPrice: number;

  // KM
  kmIncluded: number | null; // null = ilimitado
  kmExtraPrice: number | null;

  // Benefícios
  includesInsurance: boolean;
  includesMaintenance: boolean;

  // Categorias permitidas
  allowedCategories: VehicleCategory[];

  // Status
  active: boolean;

  // Datas
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (opcional)
  _count?: {
    contratos: number;
  };
  contratos?: Array<{
    id: string;
    contractNumber: string;
    motorista: {
      id: string;
      name: string;
      cpf: string | null;
      cnpj: string | null;
    };
    veiculo: {
      id: string;
      plate: string;
      brand: string;
      model: string;
    };
  }>;
}

// DTO para criação de Plano
export type CreatePlanoDto = {
  name: string;
  description?: string;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice: number;
  kmIncluded?: number;
  kmExtraPrice?: number;
  includesInsurance?: boolean;
  includesMaintenance?: boolean;
  allowedCategories: VehicleCategory[];
  active?: boolean;
}

// DTO para atualização de Plano
export type UpdatePlanoDto = Partial<CreatePlanoDto>;
