import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token do motorista
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('motorista_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Contrato {
  id: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  veiculo: {
    brand: string;
    model: string;
    plate: string;
    year: number;
  };
  plano: {
    name: string;
    weeklyValue: number;
  };
  filial: {
    name: string;
    phone: string;
    address?: string;
  };
  cobrancas?: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

export interface Cobranca {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
  contratoId: string;
  contrato: {
    contractNumber: string;
    veiculo: {
      brand: string;
      model: string;
    };
  };
}

export const motoristaContratosService = {
  async getContratos(): Promise<Contrato[]> {
    const response = await api.get<Contrato[]>('/motorista/contratos');
    return response.data;
  },

  async getContrato(id: string): Promise<Contrato> {
    const response = await api.get<Contrato>(`/motorista/contratos/${id}`);
    return response.data;
  },
};

export const motoristaPagamentosService = {
  async getPagamentos(): Promise<Cobranca[]> {
    const response = await api.get<Cobranca[]>('/motorista/pagamentos');
    return response.data;
  },
};
