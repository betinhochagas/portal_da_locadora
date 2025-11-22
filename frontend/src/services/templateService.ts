import { api } from './api';

export interface ContratoTemplate {
  id: string;
  titulo: string;
  conteudo: string;
  ativo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTemplateDto {
  titulo: string;
  conteudo: string;
}

export interface UpdateTemplateDto {
  titulo?: string;
  conteudo?: string;
}

const templateService = {
  /**
   * Lista todos os templates
   */
  async getAll(): Promise<ContratoTemplate[]> {
    const response = await api.get('/contrato-templates');
    return response.data;
  },

  /**
   * Busca template ativo
   */
  async getAtivo(): Promise<ContratoTemplate> {
    const response = await api.get('/contrato-templates/ativo');
    return response.data;
  },

  /**
   * Busca template por ID
   */
  async getById(id: string): Promise<ContratoTemplate> {
    const response = await api.get(`/contrato-templates/${id}`);
    return response.data;
  },

  /**
   * Cria novo template
   */
  async create(data: CreateTemplateDto): Promise<ContratoTemplate> {
    const response = await api.post('/contrato-templates', data);
    return response.data;
  },

  /**
   * Atualiza template
   */
  async update(id: string, data: UpdateTemplateDto): Promise<ContratoTemplate> {
    const response = await api.patch(`/contrato-templates/${id}`, data);
    return response.data;
  },

  /**
   * Ativa template
   */
  async ativar(id: string): Promise<ContratoTemplate> {
    const response = await api.post(`/contrato-templates/${id}/ativar`);
    return response.data;
  },

  /**
   * Remove template
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/contrato-templates/${id}`);
    return response.data;
  },
};

export default templateService;
