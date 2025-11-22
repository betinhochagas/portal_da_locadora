import { api } from '../services/api';

/**
 * Downloads a PDF contract from the backend API
 * @param contratoId - The contract ID to generate PDF for
 * @param templateId - Optional: specific template ID to use (defaults to active template)
 * @returns Promise that resolves when download completes
 */
export async function downloadContratoPDF(
  contratoId: string,
  templateId?: string
): Promise<void> {
  try {
    // Build URL with optional templateId query param
    const url = `/contratos/${contratoId}/gerar-pdf${
      templateId ? `?templateId=${templateId}` : ''
    }`;

    // Make API request with blob response type
    const response = await api.post(url, null, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `contrato-${contratoId}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: unknown) {
    console.error('Erro ao baixar PDF do contrato:', error);
    
    // Extract error message from response
    const err = error as { response?: { data?: Blob | { message?: string } }; message?: string };
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || 'Erro ao gerar PDF do contrato');
      } catch {
        throw new Error('Erro ao gerar PDF do contrato');
      }
    }
    
    throw new Error(
      err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data 
        ? String(err.response.data.message)
        : err.message || 'Erro ao baixar PDF do contrato'
    );
  }
}
