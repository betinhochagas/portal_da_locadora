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

export interface DashboardData {
  contratos: {
    total: number;
    ativos: number;
    proxVencimento?: string;
  };
  veiculo?: {
    id: string;
    modelo: string;
    placa: string;
    ano: number;
  };
  pagamentos: {
    total: number;
    pendentes: number;
    proximoPagamento?: {
      valor: number;
      vencimento: string;
    };
  };
  estatisticas: {
    diasComoMotorista: number;
    totalPago: number;
  };
}

export const motoristaDashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/motorista/dashboard');
    return response.data;
  },
};
