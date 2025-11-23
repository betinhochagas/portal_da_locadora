import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { documentosService } from '../../services/documentosService';
import { formatFileSize, isImage, isPDF } from '../../types/documento';
import type { DocumentoDigital } from '../../types/documento';
import { Download, FileText, Image as ImageIcon, Eye, ExternalLink, Car as CarIcon } from 'lucide-react';
import { DocumentModal } from '../../components/DocumentModal';
import { PDFThumbnail } from '../../components/PDFThumbnail';
import { ContratoModal } from '../../components/ContratoModal';

interface Motorista {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  active: boolean;
  blacklisted: boolean;
  blacklistReason: string | null;
  contratos: Array<{
    id: string;
    contractNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    kmInicial: number;
    veiculo: {
      id: string;
      plate: string;
      brand: string;
      model: string;
      km: number;
    };
    cobrancas: Array<{
      id: string;
      dueDate: string;
      status: string;
    }>;
  }>;
}

export function MotoristaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentoDigital | null>(null);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  
  // Estado para modal de reset de senha
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [novaSenhaGerada, setNovaSenhaGerada] = useState<string | null>(null);

  const { data: motorista, isLoading, error } = useQuery<Motorista>({
    queryKey: ['motorista', id],
    queryFn: async () => {
      const response = await api.get(`/motoristas/${id}`);
      return response.data;
    },
  });

  const { data: documentos = [] } = useQuery<DocumentoDigital[]>({
    queryKey: ['documentos', 'motorista', id],
    queryFn: () => documentosService.getAll({ motoristaId: id }),
    enabled: !!id,
  });

  // Buscar KM da semana para o veículo do contrato ativo (se houver)
  const contratoAtivo = motorista?.contratos?.find(c => c.status === 'ATIVO');
  const veiculoId = contratoAtivo?.veiculo?.id;

  const { data: kmSemana } = useQuery({
    queryKey: ['km-semana', veiculoId],
    queryFn: async () => {
      if (!veiculoId) return null;
      try {
        const response = await api.get(`/veiculos/${veiculoId}/km-semana-atual`);
        return response.data;
      } catch {
        return { kmRodadoSemana: null };
      }
    },
    enabled: !!veiculoId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/motoristas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      setMessage({ type: 'success', text: 'Motorista excluído com sucesso!' });
      // Aguardar 1.5s para mostrar mensagem antes de navegar
      setTimeout(() => navigate('/motoristas'), 1500);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao excluir motorista. Pode haver contratos ativos associados.';
      setMessage({ type: 'error', text: errorMessage });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/motoristas/${id}/reset-password`);
      return response.data;
    },
    onSuccess: (data) => {
      setNovaSenhaGerada(data.senhaGerada);
      setShowResetPasswordModal(true);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erro ao gerar nova senha',
      });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      deleteMutation.mutate();
    }
  };

  const handleResetPassword = () => {
    if (window.confirm('Tem certeza que deseja gerar uma nova senha para este motorista?\n\nA senha atual será invalidada.')) {
      resetPasswordMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando motorista...</p>
        </div>
      </div>
    );
  }

  if (error || !motorista) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md w-full">
          <div className="text-red-600 text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Motorista não encontrado</h2>
            <p className="text-gray-600 mb-4">O motorista solicitado não existe ou foi removido</p>
            <Link to="/motoristas" className="btn-primary inline-block">
              ← Voltar para Motoristas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user?.role && ['ADMIN', 'DIRETORIA', 'GERENTE_LOJA', 'ATENDENTE'].includes(user.role);
  const canDelete = user?.role && ['ADMIN', 'DIRETORIA'].includes(user.role);
  const canResetPassword = user?.role && ['ADMIN', 'DIRETORIA', 'GERENTE_LOJA'].includes(user.role);

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const getPaymentStatus = (cobrancas: Array<{ dueDate: string; status: string }>) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Verificar cobranças pendentes ou atrasadas
    const pendingOrOverdue = cobrancas.filter(c => 
      c.status === 'PENDENTE' || c.status === 'ATRASADA'
    );

    if (pendingOrOverdue.length === 0) {
      return { status: 'OK', label: '✅ Em dia', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    }

    // Verificar se tem atrasada
    const overdue = pendingOrOverdue.filter(c => c.status === 'ATRASADA');
    if (overdue.length > 0) {
      const oldestOverdue = overdue.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];
      const dueDate = new Date(oldestOverdue.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        status: 'OVERDUE', 
        label: `❌ Atrasado ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}`, 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
      };
    }

    // Verificar se tem pendente próxima (< 3 dias)
    const pending = pendingOrOverdue.filter(c => c.status === 'PENDENTE');
    const nextDue = pending.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0];
    
    const dueDate = new Date(nextDue.dueDate);
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 2) {
      return { 
        status: 'WARNING', 
        label: `⚠️ Vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''}`, 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
      };
    }

    return { status: 'OK', label: '✅ Em dia', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  return (
    <>
      {/* Modal de Nova Senha Gerada */}
      {showResetPasswordModal && novaSenhaGerada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Nova Senha Gerada!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Anote a senha abaixo. Ela não será exibida novamente.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                NOVA SENHA DO MOTORISTA:
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-gray-700 rounded px-4 py-3 border border-yellow-300 dark:border-yellow-600">
                <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                  {novaSenhaGerada}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(novaSenhaGerada);
                    alert('Senha copiada!');
                  }}
                  className="ml-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Copiar senha"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>⚠️ IMPORTANTE:</strong><br />
                • A senha anterior foi invalidada<br />
                • O motorista deve usar esta nova senha no Portal do Motorista<br />
                • Será solicitada a criação de uma senha pessoal no primeiro login<br />
                • Acesso: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">http://seu-ip:5173/motorista/login</code>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowResetPasswordModal(false);
                setNovaSenhaGerada(null);
              }}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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
            <Link to="/motoristas" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
              ← Voltar para Motoristas
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{motorista.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                motorista.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {motorista.active ? 'Ativo' : 'Inativo'}
              </span>
              {motorista.blacklisted && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Bloqueado
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Link
                to={`/motoristas/${motorista.id}/editar`}
                className="btn-primary bg-blue-600 hover:bg-blue-700"
              >
                ✏️ Editar
              </Link>
            )}
            {canResetPassword && (
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
                className="btn-primary bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
              >
                {resetPasswordMutation.isPending ? '⏳ Gerando...' : '🔑 Nova Senha'}
              </button>
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

        {/* Dados Pessoais */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 Dados Pessoais</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Foto de Perfil */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {(() => {
                  const fotoPerfil = documentos.find(d => d.tipo === 'FOTO_PERFIL');
                  if (fotoPerfil) {
                    return (
                      <img
                        src={documentosService.getDownloadUrl(fotoPerfil.id)}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                  return (
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <div className="text-6xl mb-2">👤</div>
                      <div className="text-xs">Sem foto</div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Dados */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF</div>
                <div className="font-semibold dark:text-gray-200">{formatCPF(motorista.cpf)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CNPJ</div>
                <div className="font-semibold dark:text-gray-200">{formatCNPJ(motorista.cnpj)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RG</div>
                <div className="font-semibold dark:text-gray-200">{motorista.rg || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Telefone</div>
                <div className="font-semibold dark:text-gray-200">{motorista.phone}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
                <div className="font-semibold dark:text-gray-200">{motorista.email || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CNH */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🪪 CNH</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número</div>
              <div className="font-semibold dark:text-gray-200">{motorista.cnh}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</div>
              <div className="font-semibold dark:text-gray-200">{motorista.cnhCategory}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Validade</div>
              <div className="font-semibold dark:text-gray-200">
                {new Date(motorista.cnhExpiry).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        {(motorista.address || motorista.city) && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📍 Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endereço</div>
                <div className="font-semibold dark:text-gray-200">{motorista.address || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cidade</div>
                <div className="font-semibold dark:text-gray-200">{motorista.city || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</div>
                <div className="font-semibold dark:text-gray-200">{motorista.state || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CEP</div>
                <div className="font-semibold dark:text-gray-200">{motorista.zipCode || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Dados Bancários */}
        {(motorista.bankName || motorista.bankAgency || motorista.bankAccount) && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏦 Dados Bancários</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Banco</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agência</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankAgency || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conta</div>
                <div className="font-semibold dark:text-gray-200">{motorista.bankAccount || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bloqueio */}
        {motorista.blacklisted && motorista.blacklistReason && (
          <div className="card bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">⚠️ Motivo do Bloqueio</h2>
            <p className="text-red-700 dark:text-red-300">{motorista.blacklistReason}</p>
          </div>
        )}

        {/* Documentos - Preview Only */}
        {documentos.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📄 Documentos</h2>
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

        {/* Veículo do Contrato Ativo */}
        {motorista.contratos && motorista.contratos.some(c => c.status === 'ATIVO') && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🚗 Veículo em Uso</h2>
            {motorista.contratos
              .filter(c => c.status === 'ATIVO')
              .map((contrato) => {
                const kmInicial = contrato.kmInicial || 0;
                const kmAtual = contrato.veiculo?.km || 0;
                const kmRodados = kmAtual - kmInicial;

                return (
                  <div key={contrato.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div className="text-sm text-green-700 dark:text-green-300">Veículo</div>
                        </div>
                        <div className="font-bold text-green-900 dark:text-green-100 text-lg">
                          {contrato.veiculo.plate}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          {contrato.veiculo.brand} {contrato.veiculo.model}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">KM Inicial</div>
                        <div className="font-semibold text-green-900 dark:text-green-100">
                          {kmInicial.toLocaleString('pt-BR')} km
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-2 mb-1">KM Atual</div>
                        <div className="font-semibold text-green-900 dark:text-green-100">
                          {kmAtual.toLocaleString('pt-BR')} km
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">KM Rodados</div>
                        <div className="font-bold text-green-900 dark:text-green-100 text-2xl">
                          {kmRodados.toLocaleString('pt-BR')} km
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {kmRodados >= 0 ? 'Total percorrido' : 'Verificar KM'}
                        </div>
                        
                        {/* KM Rodado Esta Semana */}
                        {kmSemana?.kmRodadoSemana !== null && kmSemana?.kmRodadoSemana !== undefined && (
                          <>
                            <div className="text-sm text-green-700 dark:text-green-300 mt-3 mb-1 font-semibold">
                              📊 KM Esta Semana
                            </div>
                            <div className="font-bold text-green-900 dark:text-green-100 text-xl">
                              {kmSemana.kmRodadoSemana.toLocaleString('pt-BR')} km
                            </div>
                            {kmSemana.ultimoRegistro && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Último registro: {new Date(kmSemana.ultimoRegistro.dataRegistro).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </>
                        )}
                        
                        {kmSemana?.kmRodadoSemana === 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Nenhum registro de KM esta semana
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* Contratos */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Contratos</h2>
          {motorista.contratos && motorista.contratos.length > 0 ? (
            <div className="space-y-3">
              {motorista.contratos.map((contrato) => {
                const paymentStatus = getPaymentStatus(contrato.cobrancas && contrato.cobrancas.length > 0 ? contrato.cobrancas : []);
                return (
                  <div key={contrato.id} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-purple-900 dark:text-purple-200">
                        Contrato #{contrato.contractNumber}
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-purple-600 dark:bg-purple-700 text-white text-xs rounded-full">
                          {contrato.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status de Pagamento */}
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${paymentStatus.color}`}>
                        {paymentStatus.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      <div><strong>Período:</strong> {new Date(contrato.startDate).toLocaleDateString('pt-BR')} até {new Date(contrato.endDate).toLocaleDateString('pt-BR')}</div>
                    </div>

                    {/* Botão Ver Contrato */}
                    <button
                      onClick={() => setSelectedContratoId(contrato.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Contrato Completo
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Nenhum contrato associado a este motorista</p>
            </div>
          )}
        </div>

        {/* Modal de Contrato */}
        {selectedContratoId && (
          <ContratoModal
            isOpen={!!selectedContratoId}
            onClose={() => setSelectedContratoId(null)}
            contratoId={selectedContratoId}
          />
        )}
      </div>
    </div>
    </>
  );
}
