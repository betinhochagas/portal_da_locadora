import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import templateService from '../../services/templateService';
import type { CreateTemplateDto } from '../../services/templateService';
import { ArrowLeft, Save, Copy } from 'lucide-react';

const placeholders = [
  {
    category: '👤 Motorista',
    items: [
      { key: '{{MOTORISTA_NOME}}', desc: 'Nome completo' },
      { key: '{{MOTORISTA_CPF}}', desc: 'CPF formatado' },
      { key: '{{MOTORISTA_CNH}}', desc: 'Número da CNH' },
      { key: '{{MOTORISTA_ENDERECO}}', desc: 'Endereço completo' },
    ],
  },
  {
    category: '🚗 Veículo',
    items: [
      { key: '{{VEICULO_PLACA}}', desc: 'Placa do veículo' },
      { key: '{{VEICULO_MODELO}}', desc: 'Marca e modelo' },
      { key: '{{VEICULO_COR}}', desc: 'Cor do veículo' },
      { key: '{{VEICULO_KM_INICIAL}}', desc: 'KM inicial formatado' },
    ],
  },
  {
    category: '📄 Contrato',
    items: [
      { key: '{{CONTRATO_NUMERO}}', desc: 'Número do contrato' },
      { key: '{{CONTRATO_DATA_INICIO}}', desc: 'Data de início' },
      { key: '{{CONTRATO_DATA_FIM}}', desc: 'Data de término' },
      { key: '{{CONTRATO_VALOR_MENSAL}}', desc: 'Valor mensal' },
      { key: '{{CONTRATO_CAUCAO}}', desc: 'Valor da caução' },
    ],
  },
  {
    category: '📋 Plano',
    items: [
      { key: '{{PLANO_NOME}}', desc: 'Nome do plano' },
      { key: '{{PLANO_KM_INCLUIDO}}', desc: 'KM incluído/semana' },
    ],
  },
  {
    category: '📅 Data',
    items: [{ key: '{{DATA_ATUAL}}', desc: 'Data de geração' }],
  },
];

export function TemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState<CreateTemplateDto>({
    titulo: '',
    conteudo: '',
  });

  const [errors, setErrors] = useState<{ titulo?: string; conteudo?: string }>({});

  const isEditing = !!id;

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getById(id!),
    enabled: isEditing,
  });

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (template && !hasLoadedRef.current) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setFormData({
          titulo: template.titulo,
          conteudo: template.conteudo,
        });
      }, 0);
      hasLoadedRef.current = true;
    }
  }, [template]);

  const createMutation = useMutation({
    mutationFn: templateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      navigate('/templates');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        const newErrors: Record<string, string> = {};
        message.forEach((msg: string) => {
          if (msg.includes('titulo')) newErrors.titulo = msg;
          if (msg.includes('conteudo')) newErrors.conteudo = msg;
        });
        setErrors(newErrors);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateTemplateDto) => templateService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
      navigate('/templates');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const message = err.response?.data?.message;
      if (Array.isArray(message)) {
        const newErrors: Record<string, string> = {};
        message.forEach((msg: string) => {
          if (msg.includes('titulo')) newErrors.titulo = msg;
          if (msg.includes('conteudo')) newErrors.conteudo = msg;
        });
        setErrors(newErrors);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validação local
    const newErrors: Record<string, string> = {};
    if (!formData.titulo || formData.titulo.length < 3) {
      newErrors.titulo = 'Título deve ter no mínimo 3 caracteres';
    }
    if (!formData.conteudo || formData.conteudo.length < 50) {
      newErrors.conteudo = 'Conteúdo deve ter no mínimo 50 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.conteudo;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + placeholder + after;
    setFormData({ ...formData, conteudo: newText });

    // Reposicionar cursor após o placeholder inserido
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/templates"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? '✏️ Editar Template' : '➕ Novo Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditing
              ? 'Atualize o template de contrato'
              : 'Crie um novo template personalizado para contratos'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título do Template *
              </label>
              <input
                type="text"
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className={`input w-full ${errors.titulo ? 'border-red-500' : ''}`}
                placeholder="Ex: Contrato de Locação Padrão"
                maxLength={100}
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titulo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.titulo.length}/100 caracteres
              </p>
            </div>

            {/* Conteúdo */}
            <div>
              <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo do Contrato *
              </label>
              <textarea
                id="conteudo"
                ref={textareaRef}
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                className={`input w-full font-mono text-sm ${errors.conteudo ? 'border-red-500' : ''}`}
                rows={20}
                placeholder="Digite o conteúdo do contrato aqui. Use os placeholders do painel ao lado para inserir dados dinâmicos."
              />
              {errors.conteudo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.conteudo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.conteudo.length} caracteres (mínimo: 50)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to="/templates" className="btn-secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : isEditing
                  ? 'Atualizar Template'
                  : 'Criar Template'}
              </button>
            </div>
          </form>
        </div>

        {/* Placeholders Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Placeholders Disponíveis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Clique para inserir no conteúdo na posição do cursor
            </p>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {placeholders.map((group, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    {group.category}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-start justify-between gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer group border border-transparent dark:border-gray-700 dark:hover:border-gray-600"
                        onClick={() => insertPlaceholder(item.key)}
                      >
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-purple-600 dark:text-purple-300 block truncate font-bold">
                            {item.key}
                          </code>
                          <span className="text-xs text-gray-500 dark:text-gray-200">
                            {item.desc}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.key);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Copiar"
                        >
                          <Copy className="w-3 h-3 text-gray-600 dark:text-gray-100" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-100">
                💡 <strong className="text-blue-900 dark:text-white font-semibold">Dica:</strong> Posicione o cursor no texto onde deseja inserir e clique no placeholder.
                Os valores serão substituídos automaticamente na geração do PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
