import { api } from './api';
import type {
  Manutencao,
  CreateManutencaoData,
  UpdateManutencaoData,
  ManutencaoHistorico,
  VeiculoComManutencaoPendente,
  ProximaManutencaoPreventiva,
  MaintenanceStatus,
} from '../types/manutencao';

export const manutencoesService = {
  async list(veiculoId?: string, status?: MaintenanceStatus) {
    const params = new URLSearchParams();
    if (veiculoId) params.append('veiculoId', veiculoId);
    if (status) params.append('status', status);

    const query = params.toString();
    const url = query ? `/manutencoes?${query}` : '/manutencoes';

    const response = await api.get<Manutencao[]>(url);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Manutencao>(`/manutencoes/${id}`);
    return response.data;
  },

  async create(data: CreateManutencaoData) {
    const response = await api.post<Manutencao>('/manutencoes', data);
    return response.data;
  },

  async update(id: string, data: UpdateManutencaoData) {
    const response = await api.patch<Manutencao>(`/manutencoes/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<Manutencao>(`/manutencoes/${id}`);
    return response.data;
  },

  async getHistoricoByVeiculo(veiculoId: string) {
    const response = await api.get<ManutencaoHistorico>(
      `/manutencoes/veiculo/${veiculoId}/historico`,
    );
    return response.data;
  },

  async getPendentes() {
    const response = await api.get<VeiculoComManutencaoPendente[]>(
      '/manutencoes/pendentes',
    );
    return response.data;
  },

  async getProximaPreventiva(veiculoId: string) {
    const response = await api.get<ProximaManutencaoPreventiva>(
      `/manutencoes/veiculo/${veiculoId}/proxima-preventiva`,
    );
    return response.data;
  },
};
