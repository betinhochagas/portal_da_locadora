import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { documentosService } from '../../services/documentosService';
import { formatFileSize, isImage, isPDF } from '../../types/documento';
import type { DocumentoDigital } from '../../types/documento';
import { Download, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import { useState } from 'react';
import { DocumentModal } from '../../components/DocumentModal';
import { PDFThumbnail } from '../../components/PDFThumbnail';

interface Veiculo {
  id: string;
  plate: string;
  renavam: string | null;
  chassi: string | null;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: string;
  fuelType: string;
  transmission: string;
  status: string;
  km: number;
  fipeValue: number | null;
  filialId: string;
  active: boolean;
  filial: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  contratos: Array<{
    id: string;
    contractNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    motorista: {
      id: string;
      name: string;
      phone: string;
    };
  }>;
}

const categoryLabels: Record<string, string> = {
  HATCH: 'Hatch',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  PICAPE: 'Picape',
  VAN: 'Van',
};

const fuelLabels: Record<string, string> = {
  FLEX: 'Flex',
  GASOLINA: 'Gasolina',
  DIESEL: 'Diesel',
  ELETRICO: 'Elétrico',
  HIBRIDO: 'Híbrido',
};

const transmissionLabels: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATICO: 'Automático',
  AUTOMATIZADO: 'Automatizado',
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  LOCADO: 'Locado',
  MANUTENCAO: 'Em Manutenção',
  VISTORIA: 'Em Vistoria',
  INATIVO: 'Inativo',
};

export function VeiculoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentoDigital | null>(null);

  const { data: veiculo, isLoading, error } = useQuery<Veiculo>({
    queryKey: ['veiculo', id],
    queryFn: async () => {
      const response = await api.get(`/veiculos/${id}`);
      return response.data;
    },
  });

  const { data: documentos = [] } = useQuery<DocumentoDigital[]>({
    queryKey: ['documentos', 'veiculo', id],
    queryFn: () => documentosService.getAll({ veiculoId: id }),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/veiculos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      setMessage({ type: 'success', text: 'Veículo excluído com sucesso!' });
      // Aguardar 1.5s para mostrar mensagem antes de navegar
      setTimeout(() => navigate('/veiculos'), 1500);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao excluir veículo. Pode haver contratos ativos associados.';
      setMessage({ type: 'error', text: errorMessage });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando veículo...</p>
        </div>
      </div>
    );
  }

  if (error || !veiculo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Veículo não encontrado</h2>
            <p className="text-gray-600 mb-4">O veículo solicitado não existe ou foi removido</p>
            <Link to="/veiculos" className="btn-primary inline-block">
              ← Voltar para Veículos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user?.role && ['ADMIN', 'DIRETORIA', 'GESTOR_FROTA'].includes(user.role);
  const canDelete = user?.role && ['ADMIN', 'DIRETORIA'].includes(user.role);

  const statusColors: Record<string, string> = {
    DISPONIVEL: 'bg-green-100 text-green-800',
    LOCADO: 'bg-purple-100 text-purple-800',
    MANUTENCAO: 'bg-orange-100 text-orange-800',
    VISTORIA: 'bg-yellow-100 text-yellow-800',
    INATIVO: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/veiculos" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
              ← Voltar para Veículos
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {veiculo.brand} {veiculo.model}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{veiculo.year} • {veiculo.color}</p>
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={`/veiculos/${veiculo.id}/editar`}
                className="btn-primary bg-blue-600 hover:bg-blue-700"
              >
                ✏️ Editar
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                {deleteMutation.isPending ? '⏳ Excluindo...' : '🗑️ Excluir'}
              </button>
            )}
          </div>
        </div>

        {/* Main Info Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{veiculo.plate}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[veiculo.status]} ${
                veiculo.status === 'DISPONIVEL' ? 'dark:bg-green-900 dark:text-green-200' :
                veiculo.status === 'LOCADO' ? 'dark:bg-purple-900 dark:text-purple-200' :
                veiculo.status === 'MANUTENCAO' ? 'dark:bg-orange-900 dark:text-orange-200' :
                veiculo.status === 'VISTORIA' ? 'dark:bg-yellow-900 dark:text-yellow-200' :
                'dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {statusLabels[veiculo.status]}
              </span>
            </div>
            <div className="text-6xl">🚗</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</div>
              <div className="font-semibold dark:text-gray-200">{categoryLabels[veiculo.category]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Combustível</div>
              <div className="font-semibold dark:text-gray-200">{fuelLabels[veiculo.fuelType]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transmissão</div>
              <div className="font-semibold dark:text-gray-200">{transmissionLabels[veiculo.transmission]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quilometragem</div>
              <div className="font-semibold dark:text-gray-200">{veiculo.km?.toLocaleString('pt-BR') || 'N/A'} km</div>
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Renavam</div>
              <div className="font-semibold dark:text-gray-200">{veiculo.renavam || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chassi</div>
              <div className="font-semibold dark:text-gray-200">{veiculo.chassi || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor FIPE</div>
              <div className="font-semibold dark:text-gray-200">
                {veiculo.fipeValue ? `R$ ${veiculo.fipeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Filial Card */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📍 Filial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nome</div>
              <div className="font-semibold dark:text-gray-200">{veiculo.filial.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Localização</div>
              <div className="font-semibold dark:text-gray-200">{veiculo.filial.city} - {veiculo.filial.state}</div>
            </div>
          </div>
        </div>

        {/* Documentos - Preview Only */}
        {documentos.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📄 Documentos do Veículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentos.map(doc => (
                <div key={doc.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow">
                  {/* Preview */}
                  <div 
                    className="mb-3 cursor-pointer group relative"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    {isImage(doc.mimeType) ? (
                      <>
                        <img
                          src={documentosService.getViewUrl(doc.id)}
                          alt={doc.nomeOriginal}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : isPDF(doc.mimeType) ? (
                      <div className="relative">
                        <PDFThumbnail
                          url={documentosService.getViewUrl(doc.id)}
                          alt={doc.nomeOriginal}
                          className="w-full h-32 rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-600 rounded group-hover:bg-gray-300 dark:group-hover:bg-gray-500 transition-colors">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        <Eye className="w-6 h-6 text-gray-600 dark:text-gray-400 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      {isImage(doc.mimeType) ? (
                        <ImageIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {doc.nomeOriginal}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatFileSize(doc.tamanho)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <a
                      href={documentosService.getDownloadUrl(doc.id)}
                      download
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Visualização */}
        {selectedDocument && (
          <DocumentModal
            isOpen={!!selectedDocument}
            onClose={() => setSelectedDocument(null)}
            documento={selectedDocument}
          />
        )}

        {/* Contratos Card */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Contratos</h2>
          {veiculo.contratos && veiculo.contratos.length > 0 ? (
            <div className="space-y-3">
              {veiculo.contratos.map((contrato) => (
                <div key={contrato.id} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-purple-900 dark:text-purple-200">
                      Contrato #{contrato.contractNumber}
                    </div>
                    <span className="px-2 py-1 bg-purple-600 dark:bg-purple-700 text-white text-xs rounded-full">
                      {contrato.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div><strong>Motorista:</strong> {contrato.motorista.name}</div>
                    <div><strong>Telefone:</strong> {contrato.motorista.phone}</div>
                    <div><strong>Período:</strong> {new Date(contrato.startDate).toLocaleDateString('pt-BR')} até {new Date(contrato.endDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Nenhum contrato associado a este veículo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
