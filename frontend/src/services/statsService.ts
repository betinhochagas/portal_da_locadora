import { api } from './api';

export interface DashboardStats {
  contratos: {
    total: number;
    ativos: number;
    suspensos: number;
    vencendo30dias: number;
  };
  veiculos: {
    total: number;
    disponiveis: number;
    locados: number;
    manutencao: number;
    taxaOcupacao: number;
  };
  motoristas: {
    total: number;
    ativos: number;
    blacklist: number;
  };
  receita: {
    mensalEstimada: number;
  };
}

export interface ContratoVencendo {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: string;
  motorista: {
    id: string;
    name: string;
    phone: string;
  };
  veiculo: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  };
  plano: {
    id: string;
    name: string;
  };
}

export interface ReceitaMensal {
  mes: string;
  receita: number;
}

export interface DistribuicaoFrota {
  porCategoria: Array<{
    categoria: string;
    quantidade: number;
  }>;
  porStatus: Array<{
    status: string;
    quantidade: number;
  }>;
}

const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  getContratosVencendo: async (dias: number = 30): Promise<ContratoVencendo[]> => {
    const response = await api.get(`/stats/contratos/vencendo?dias=${dias}`);
    return response.data;
  },

  getReceitaMensal: async (meses: number = 6): Promise<ReceitaMensal[]> => {
    const response = await api.get(`/stats/receita/mensal?meses=${meses}`);
    return response.data;
  },

  getDistribuicaoFrota: async (): Promise<DistribuicaoFrota> => {
    const response = await api.get('/stats/frota/distribuicao');
    return response.data;
  },
};

export default statsService;
