export type MotoristaStatus = 'ATIVO' | 'INATIVO' | 'SUSPENSO';

export interface Motorista {
  id: string;
  name: string;
  cpf?: string | null;
  cnpj?: string | null;
  email?: string | null;
  phone: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  status: MotoristaStatus;
  active: boolean;
  blacklisted: boolean;
  createdAt: string;
  updatedAt: string;
  contratos?: Array<{
    id: string;
    contractNumber: string;
    status: string;
  }>;
}
