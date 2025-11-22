import { X, Download } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { documentosService } from '../services/documentosService';
import { isImage, isPDF } from '../types/documento';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documento: {
    id: string;
    nomeOriginal: string;
    mimeType: string;
    url: string;
    tipo: string;
  };
}

export function DocumentModal({ isOpen, onClose, documento }: DocumentModalProps) {
  // Memoizar função de fechar para evitar problemas com useEffect
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentosService.getDownloadUrl(documento.id);
    link.download = documento.nomeOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {documento.tipo}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {documento.nomeOriginal}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          {isImage(documento.mimeType) ? (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={documentosService.getViewUrl(documento.id)}
                alt={documento.nomeOriginal}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : isPDF(documento.mimeType) ? (
            <iframe
              src={documentosService.getViewUrl(documento.id)}
              className="w-full h-full min-h-[600px] rounded-lg shadow-lg"
              title={documento.nomeOriginal}
              allow="fullscreen"
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Pré-visualização não disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Este tipo de arquivo não pode ser visualizado no navegador.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Fazer Download
              </button>
            </div>
          )}
        </div>

        {/* Footer com informações adicionais */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Tipo: {documento.mimeType}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Pressione ESC para fechar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
