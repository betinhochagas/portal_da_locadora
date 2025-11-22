import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentosService } from '../services/documentosService';
import type { TipoDocumentoType, UploadDocumentoDto } from '../types/documento';
import { formatTipoDocumento, formatFileSize } from '../types/documento';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  tipo: TipoDocumentoType;
  motoristaId?: string;
  veiculoId?: string;
  contratoId?: string;
  onUploadSuccess?: () => void;
  maxSizeMB?: number;
}

export function FileUpload({
  tipo,
  motoristaId,
  veiculoId,
  contratoId,
  onUploadSuccess,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (dto: { file: File; dto: UploadDocumentoDto }) =>
      documentosService.upload(dto.file, dto.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      if (onUploadSuccess) onUploadSuccess();
    },
    onError: (err: Error) => {
      setError(err.message || 'Erro ao fazer upload');
    },
  });

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou PDF.');
      return false;
    }

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setError(null);

    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate({
      file: selectedFile,
      dto: {
        tipo,
        motoristaId,
        veiculoId,
        contratoId,
      },
    });
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
            onChange={handleChange}
          />

          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Arraste o arquivo aqui ou
          </p>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Selecionar Arquivo
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {formatTipoDocumento(tipo)} - Máximo {maxSizeMB}MB
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Formatos aceitos: JPEG, PNG, GIF, PDF
          </p>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {preview ? (
                <Image className="w-10 h-10 text-indigo-500" />
              ) : (
                <FileText className="w-10 h-10 text-red-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-3">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="btn w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Enviando...' : 'Fazer Upload'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {uploadMutation.isSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-800 dark:text-green-300 text-sm">
          Upload realizado com sucesso!
        </div>
      )}
    </div>
  );
}
