import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker do PDF.js usando o arquivo do node_modules
// Vite irá processar este import automaticamente
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

interface PDFThumbnailProps {
  url: string;
  alt: string;
  className?: string;
}

export function PDFThumbnail({ url, alt, className = '' }: PDFThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const generateThumbnail = async () => {
      try {
        setLoading(true);
        setError(false);

        // Carregar o PDF com configuração de fontes padrão
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
        });
        const pdf = await loadingTask.promise;

        // Pegar apenas a primeira página
        const page = await pdf.getPage(1);

        // Configurar escala para thumbnail (menor resolução)
        const scale = 0.5;
        const viewport = page.getViewport({ scale });

        // Criar canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Não foi possível criar contexto do canvas');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Renderizar página no canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Converter canvas para imagem base64
        if (isMounted) {
          const thumbnailUrl = canvas.toDataURL('image/png');
          setThumbnail(thumbnailUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao gerar thumbnail do PDF:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-600 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={thumbnail}
      alt={alt}
      className={`object-cover bg-white ${className}`}
    />
  );
}
