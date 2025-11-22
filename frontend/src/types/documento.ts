// Enum de tipos de documento (const enum pattern)
export const TipoDocumento = {
  CNH: 'CNH',
  RG: 'RG',
  CPF: 'CPF',
  FOTO_PERFIL: 'FOTO_PERFIL',
  COMPROVANTE_RESIDENCIA: 'COMPROVANTE_RESIDENCIA',
  COMPROVANTE_RENDA: 'COMPROVANTE_RENDA',
  CRLV: 'CRLV',
  LAUDO_VISTORIA: 'LAUDO_VISTORIA',
  CONTRATO_ASSINADO: 'CONTRATO_ASSINADO',
  FOTO_VEICULO: 'FOTO_VEICULO',
  OUTROS: 'OUTROS',
} as const;

export type TipoDocumentoType = typeof TipoDocumento[keyof typeof TipoDocumento];

// Interface do documento digital
export interface DocumentoDigital {
  id: string;
  tipo: TipoDocumentoType;
  nomeArquivo: string;
  nomeOriginal: string;
  tamanho: number;
  mimeType: string;
  url: string;
  motoristaId: string | null;
  veiculoId: string | null;
  contratoId: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
  motorista?: {
    id: string;
    name: string;
  };
  veiculo?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  };
  contrato?: {
    id: string;
    contractNumber: string;
  };
}

// DTO para upload
export interface UploadDocumentoDto {
  tipo: TipoDocumentoType;
  motoristaId?: string;
  veiculoId?: string;
  contratoId?: string;
  descricao?: string;
}

// Helper para formatar nome do tipo
export const formatTipoDocumento = (tipo: TipoDocumentoType): string => {
  const tipos: Record<TipoDocumentoType, string> = {
    CNH: 'CNH',
    RG: 'RG',
    CPF: 'CPF',
    FOTO_PERFIL: 'Foto de Perfil',
    COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
    COMPROVANTE_RENDA: 'Comprovante de Renda',
    CRLV: 'CRLV',
    LAUDO_VISTORIA: 'Laudo de Vistoria',
    CONTRATO_ASSINADO: 'Contrato Assinado',
    FOTO_VEICULO: 'Foto do Veículo',
    OUTROS: 'Outros',
  };
  return tipos[tipo] || tipo;
};

// Helper para formatar tamanho do arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper para verificar se é imagem
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Helper para verificar se é PDF
export const isPDF = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};
