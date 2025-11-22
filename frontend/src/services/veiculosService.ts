import { api } from './api';

export interface Veiculo {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  mileage: number;
  status: string;
}

export interface VeiculoAlertaManutencao extends Veiculo {
  kmRestantes: number;
  atrasado: boolean;
  nextMaintenanceKm?: number;
  filial?: {
    id: string;
    name: string;
  };
}

export const veiculosService = {
  async list() {
    const response = await api.get<Veiculo[]>('/veiculos');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Veiculo>(`/veiculos/${id}`);
    return response.data;
  },

  async getAlertasManutencao() {
    const response = await api.get<VeiculoAlertaManutencao[]>('/veiculos/alertas-manutencao');
    return response.data;
  },
};
