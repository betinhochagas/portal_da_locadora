import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import templateService from '../../services/templateService';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Edit, CheckCircle, Trash2, XCircle, User, Calendar } from 'lucide-react';

export function TemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const canManage = user?.role === 'ADMIN' || user?.role === 'DIRETORIA';

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getById(id!),
    enabled: !!id,
  });

  const ativarMutation = useMutation({
    mutationFn: () => templateService.ativar(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => templateService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      navigate('/templates');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao excluir template';
      alert(errorMessage);
    },
  });

  const handleAtivar = () => {
    if (window.confirm('Deseja ativar este template? O template atualmente ativo será desativado.')) {
      ativarMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (template?.ativo) {
      alert('Não é possível excluir o template ativo. Ative outro template primeiro.');
      return;
    }
    if (window.confirm('Deseja realmente excluir este template? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Template não encontrado</p>
          <Link to="/templates" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Voltar para Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/templates"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📄 {template.titulo}
              </h1>
              {template.ativo ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3" />
                  Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  <XCircle className="w-3 h-3" />
                  Inativo
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visualize os detalhes do template de contrato
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/templates/${id}/editar`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Editar
            </Link>
            {!template.ativo && (
              <button
                onClick={handleAtivar}
                disabled={ativarMutation.isPending}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {ativarMutation.isPending ? 'Ativando...' : 'Ativar'}
              </button>
            )}
            {!template.ativo && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metadata Card */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Criado por</div>
              <div className="font-medium text-gray-900 dark:text-white">{template.user.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data de criação</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {new Date(template.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conteúdo do Template</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Texto que será usado para gerar os contratos em PDF
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <div className="font-mono text-sm text-gray-800 dark:text-gray-50 whitespace-pre-wrap break-words leading-relaxed">
            {template.conteudo}
          </div>
        </div>

        {/* Character Count */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-200">
          {template.conteudo.length.toLocaleString('pt-BR')} caracteres
        </div>
      </div>

      {/* Placeholders Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-white mb-2">
          📋 Placeholders Utilizados
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-100">
          {[
            '{{MOTORISTA_NOME}}',
            '{{MOTORISTA_CPF}}',
            '{{MOTORISTA_CNH}}',
            '{{MOTORISTA_ENDERECO}}',
            '{{VEICULO_PLACA}}',
            '{{VEICULO_MODELO}}',
            '{{VEICULO_COR}}',
            '{{VEICULO_KM_INICIAL}}',
            '{{CONTRATO_NUMERO}}',
            '{{CONTRATO_DATA_INICIO}}',
            '{{CONTRATO_DATA_FIM}}',
            '{{CONTRATO_VALOR_MENSAL}}',
            '{{CONTRATO_CAUCAO}}',
            '{{PLANO_NOME}}',
            '{{PLANO_KM_INCLUIDO}}',
            '{{DATA_ATUAL}}',
          ]
            .filter((ph) => template.conteudo.includes(ph))
            .map((ph, idx) => (
              <code
                key={idx}
                className="inline-block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded mr-2 mb-2 text-xs text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700"
              >
                {ph}
              </code>
            ))}
          {[
            '{{MOTORISTA_NOME}}',
            '{{MOTORISTA_CPF}}',
            '{{MOTORISTA_CNH}}',
            '{{MOTORISTA_ENDERECO}}',
            '{{VEICULO_PLACA}}',
            '{{VEICULO_MODELO}}',
            '{{VEICULO_COR}}',
            '{{VEICULO_KM_INICIAL}}',
            '{{CONTRATO_NUMERO}}',
            '{{CONTRATO_DATA_INICIO}}',
            '{{CONTRATO_DATA_FIM}}',
            '{{CONTRATO_VALOR_MENSAL}}',
            '{{CONTRATO_CAUCAO}}',
            '{{PLANO_NOME}}',
            '{{PLANO_KM_INCLUIDO}}',
            '{{DATA_ATUAL}}',
          ].filter((ph) => template.conteudo.includes(ph)).length === 0 && (
            <span className="text-gray-600 dark:text-gray-200 font-medium">
              Nenhum placeholder encontrado neste template
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
