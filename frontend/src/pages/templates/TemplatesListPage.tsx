import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import templateService from '../../services/templateService';
import { useAuth } from '../../hooks/useAuth';
import { FileText, Plus, Eye, Edit, CheckCircle, Trash2, XCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function TemplatesListPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'DIRETORIA';

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templateService.getAll,
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: templateService.toggleAtivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setMessage({ type: 'success', text: 'Status do template atualizado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: () => {
      setMessage({ type: 'error', text: 'Erro ao atualizar status do template' });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: templateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setMessage({ type: 'success', text: 'Template excluído com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Erro ao excluir template';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const handleToggleAtivo = (id: string, isActive: boolean) => {
    const action = isActive ? 'desativar' : 'ativar';
    if (window.confirm(`Deseja ${action} este template?`)) {
      toggleAtivoMutation.mutate(id);
    }
  };

  const handleDelete = (id: string, ativo: boolean) => {
    if (ativo) {
      alert('Não é possível excluir o template ativo. Ative outro template primeiro.');
      return;
    }
    if (window.confirm('Deseja realmente excluir este template? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  const totalTemplates = templates.length;
  const templateAtivo = templates.find((t) => t.ativo);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Templates de Contrato</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure templates personalizados para geração de contratos em PDF
            </p>
          </div>
        </div>
        {canManage && (
          <Link
            to="/templates/novo"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Template
          </Link>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Templates</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalTemplates}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Template Ativo</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-xs">
                {templateAtivo?.titulo || 'Nenhum'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="card overflow-hidden">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nenhum template cadastrado
            </p>
            {canManage && (
              <Link to="/templates/novo" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Primeiro Template
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Criado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {template.titulo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {template.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/templates/${template.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                      {canManage && (
                        <>
                          <Link
                            to={`/templates/${template.id}/editar`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleAtivo(template.id, template.ativo)}
                            disabled={toggleAtivoMutation.isPending}
                            className={`${
                              template.ativo
                                ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            } inline-flex items-center gap-1 disabled:opacity-50`}
                          >
                            {template.ativo ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Ativar
                              </>
                            )}
                          </button>
                          {!template.ativo && (
                            <button
                              onClick={() => handleDelete(template.id, template.ativo)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500 rounded-lg">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-100">
            <strong className="text-blue-900 dark:text-white font-semibold">Placeholders disponíveis:</strong>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{MOTORISTA_NOME}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{MOTORISTA_CPF}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{VEICULO_PLACA}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{CONTRATO_NUMERO}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{CONTRATO_VALOR_MENSAL}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-medium border dark:border-blue-700">{'{{DATA_ATUAL}}'}</code>
              <code className="block bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded text-blue-700 dark:text-blue-200 font-semibold border dark:border-blue-700">...e mais 10</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
