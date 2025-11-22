import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { documentosService } from '../../services/documentosService';
import { FileUpload } from '../../components/FileUpload';
import {
  TipoDocumento,
  formatTipoDocumento,
  formatFileSize,
  isImage,
  isPDF,
} from '../../types/documento';
import type { TipoDocumentoType, DocumentoDigital } from '../../types/documento';
import { FileText, Download, Trash2, Image as ImageIcon, File } from 'lucide-react';

export default function DocumentosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumentoType>(TipoDocumento.OUTROS);

  const { data: documentos = [], isLoading } = useQuery<DocumentoDigital[]>({
    queryKey: ['documentos'],
    queryFn: () => documentosService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
    },
  });

  const handleDelete = (id: string, nomeOriginal: string) => {
    if (window.confirm(`Deseja realmente excluir "${nomeOriginal}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Documentos Digitalizados
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gerencie todos os documentos uploadados no sistema
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                Novo Upload
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn bg-gray-500 hover:bg-gray-600 text-white"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total de Documentos</p>
                <p className="text-3xl font-bold mt-2">{documentos.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Imagens</p>
                <p className="text-3xl font-bold mt-2">
                  {documentos.filter((d) => isImage(d.mimeType)).length}
                </p>
              </div>
              <ImageIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">PDFs</p>
                <p className="text-3xl font-bold mt-2">
                  {documentos.filter((d) => isPDF(d.mimeType)).length}
                </p>
              </div>
              <File className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Tamanho Total</p>
                <p className="text-3xl font-bold mt-2">
                  {formatFileSize(documentos.reduce((sum, d) => sum + d.tamanho, 0))}
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Documents List */}
        {documentos.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Nenhum documento encontrado</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white mt-4"
            >
              Fazer Primeiro Upload
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Arquivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vinculado a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tamanho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Upload
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documentos.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isImage(doc.mimeType) ? (
                            <ImageIcon className="w-5 h-5 text-green-500" />
                          ) : isPDF(doc.mimeType) ? (
                            <File className="w-5 h-5 text-red-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {doc.nomeOriginal}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatTipoDocumento(doc.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {doc.motorista ? `Motorista: ${doc.motorista.name}` :
                         doc.veiculo ? `Veículo: ${doc.veiculo.plate}` :
                         doc.contrato ? `Contrato: ${doc.contrato.contractNumber}` :
                         '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatFileSize(doc.tamanho)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <a
                            href={documentosService.getDownloadUrl(doc.id)}
                            download
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDelete(doc.id, doc.nomeOriginal)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload de Documento
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <label className="label">Tipo de Documento</label>
                <select
                  className="input"
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value as TipoDocumentoType)}
                >
                  {Object.values(TipoDocumento).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {formatTipoDocumento(tipo)}
                    </option>
                  ))}
                </select>
              </div>

              <FileUpload
                tipo={selectedTipo}
                onUploadSuccess={() => {
                  setShowUploadModal(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
