import { api } from './api';
import type {
  DocumentoDigital,
  UploadDocumentoDto,
  TipoDocumentoType,
} from '../types/documento';

export const documentosService = {
  /**
   * Upload de arquivo
   */
  upload: async (
    file: File,
    dto: UploadDocumentoDto,
  ): Promise<DocumentoDigital> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', dto.tipo);
    if (dto.motoristaId) formData.append('motoristaId', dto.motoristaId);
    if (dto.veiculoId) formData.append('veiculoId', dto.veiculoId);
    if (dto.contratoId) formData.append('contratoId', dto.contratoId);
    if (dto.descricao) formData.append('descricao', dto.descricao);

    const response = await api.post<DocumentoDigital>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Lista documentos com filtros
   */
  getAll: async (filters?: {
    motoristaId?: string;
    veiculoId?: string;
    contratoId?: string;
    tipo?: TipoDocumentoType;
  }): Promise<DocumentoDigital[]> => {
    const params = new URLSearchParams();
    if (filters?.motoristaId) params.append('motoristaId', filters.motoristaId);
    if (filters?.veiculoId) params.append('veiculoId', filters.veiculoId);
    if (filters?.contratoId) params.append('contratoId', filters.contratoId);
    if (filters?.tipo) params.append('tipo', filters.tipo);

    const queryString = params.toString();
    const url = queryString ? `/uploads?${queryString}` : '/uploads';

    const response = await api.get<DocumentoDigital[]>(url);
    return response.data;
  },

  /**
   * Busca documento por ID
   */
  getById: async (id: string): Promise<DocumentoDigital> => {
    const response = await api.get<DocumentoDigital>(`/uploads/${id}`);
    return response.data;
  },

  /**
   * Remove documento
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },

  /**
   * Gera URL de download
   */
  getDownloadUrl: (id: string): string => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return `${baseURL}/uploads/${id}/download`;
  },

  /**
   * Gera URL de visualização (para imagens e PDFs no modal/iframe)
   */
  getViewUrl: (documentoId: string): string => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return `${baseURL}/uploads/${documentoId}/view`;
  },
};
