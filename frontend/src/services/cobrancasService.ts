import { api } from './api';
import type { Cobranca, PaymentStatus } from '../types/cobranca';

export interface CreateCobrancaDto {
  contratoId: string;
  referenceMonth: string;
  dueDate: string;
  amount: number;
  observations?: string;
}

export interface UpdateCobrancaDto {
  referenceMonth?: string;
  dueDate?: string;
  amount?: number;
  status?: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: string;
  daysLate?: number;
  lateFee?: number;
  observations?: string;
}

export interface RegistrarPagamentoDto {
  paymentDate: string;
  paymentMethod: string;
  lateFee?: number;
  observations?: string;
}

const cobrancasService = {
  getAll: async (contratoId?: string, status?: string): Promise<Cobranca[]> => {
    const params = new URLSearchParams();
    if (contratoId) params.append('contratoId', contratoId);
    if (status) params.append('status', status);
    
    const response = await api.get(`/cobrancas?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Cobranca> => {
    const response = await api.get(`/cobrancas/${id}`);
    return response.data;
  },

  create: async (data: CreateCobrancaDto): Promise<Cobranca> => {
    const response = await api.post('/cobrancas', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCobrancaDto): Promise<Cobranca> => {
    const response = await api.patch(`/cobrancas/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cobrancas/${id}`);
  },

  registrarPagamento: async (id: string, data: RegistrarPagamentoDto): Promise<Cobranca> => {
    const response = await api.post(`/cobrancas/${id}/registrar-pagamento`, data);
    return response.data;
  },

  gerarCobrancasMensais: async (): Promise<{ message: string; cobrancas: Cobranca[] }> => {
    const response = await api.post('/cobrancas/gerar-mensais');
    return response.data;
  },

  atualizarStatusAtrasadas: async (): Promise<{ message: string }> => {
    const response = await api.post('/cobrancas/atualizar-atrasadas');
    return response.data;
  },

  getInadimplentes: async (): Promise<Cobranca[]> => {
    const response = await api.get('/cobrancas/inadimplentes');
    return response.data;
  },
};

export default cobrancasService;
