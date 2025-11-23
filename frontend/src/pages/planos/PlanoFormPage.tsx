import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Plano, CreatePlanoDto, UpdatePlanoDto } from '../../types/plano';
import { VehicleCategory, VehicleCategoryLabels } from '../../types/plano';

export default function PlanoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  // Buscar plano existente (modo edição)
  const { data: plano } = useQuery<Plano>({
    queryKey: ['planos', id],
    queryFn: async () => {
      const response = await api.get(`/planos/${id}`);
      return response.data;
    },
    enabled: isEdit,
  });

  // Estado do formulário (inicializado com plano se estiver em modo edição)
  const [formData, setFormData] = useState<CreatePlanoDto>(() => {
    if (plano && isEdit) {
      return {
        name: plano.name,
        description: plano.description || '',
        dailyPrice: Number(plano.dailyPrice),
        weeklyPrice: plano.weeklyPrice ? Number(plano.weeklyPrice) : undefined,
        monthlyPrice: Number(plano.monthlyPrice),
        kmIncluded: plano.kmIncluded || undefined,
        kmExtraPrice: plano.kmExtraPrice
          ? Number(plano.kmExtraPrice)
          : undefined,
        includesInsurance: plano.includesInsurance,
        includesMaintenance: plano.includesMaintenance,
        allowedCategories: plano.allowedCategories,
        active: plano.active,
      };
    }
    return {
      name: '',
      description: '',
      dailyPrice: 0,
      weeklyPrice: undefined,
      monthlyPrice: 0,
      kmIncluded: undefined,
      kmExtraPrice: undefined,
      includesInsurance: false,
      includesMaintenance: true,
      allowedCategories: [],
      active: true,
    };
  });

  // Atualizar formData quando plano é carregado (apenas uma vez)
  useEffect(() => {
    if (plano && isEdit && !formData.name) {
      setFormData({
        name: plano.name,
        description: plano.description || '',
        dailyPrice: Number(plano.dailyPrice),
        weeklyPrice: plano.weeklyPrice ? Number(plano.weeklyPrice) : undefined,
        monthlyPrice: Number(plano.monthlyPrice),
        kmIncluded: plano.kmIncluded || undefined,
        kmExtraPrice: plano.kmExtraPrice
          ? Number(plano.kmExtraPrice)
          : undefined,
        includesInsurance: plano.includesInsurance,
        includesMaintenance: plano.includesMaintenance,
        allowedCategories: plano.allowedCategories,
        active: plano.active,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plano, isEdit]);

  // Mutation para criar/atualizar
  const mutation = useMutation({
    mutationFn: async (data: CreatePlanoDto | UpdatePlanoDto) => {
      // Garantir que valores numéricos estão corretos e remover campos undefined/vazios
      const cleanData: any = {
        name: data.name,
        description: data.description || undefined,
        dailyPrice: Number(data.dailyPrice) || 0,
        monthlyPrice: Number(data.monthlyPrice) || 0,
        allowedCategories: data.allowedCategories,
        includesInsurance: Boolean(data.includesInsurance),
        includesMaintenance: Boolean(data.includesMaintenance),
      };
      
      // Adicionar apenas se tiver valor válido
      if (data.weeklyPrice && Number(data.weeklyPrice) > 0) {
        cleanData.weeklyPrice = Number(data.weeklyPrice);
      }
      
      if (data.kmIncluded && Number(data.kmIncluded) > 0) {
        cleanData.kmIncluded = Number(data.kmIncluded);
      }
      
      if (data.kmExtraPrice && Number(data.kmExtraPrice) > 0) {
        cleanData.kmExtraPrice = Number(data.kmExtraPrice);
      }
      
      if (typeof data.active !== 'undefined') {
        cleanData.active = Boolean(data.active);
      }
      
      console.log('Enviando dados do plano:', cleanData);
      
      if (isEdit) {
        return api.patch(`/planos/${id}`, cleanData);
      }
      return api.post('/planos', cleanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      navigate('/planos');
    },
    onError: (error: any) => {
      console.error('Erro ao salvar plano:', error);
      console.error('Resposta do servidor:', error.response?.data);
      alert(`Erro ao salvar plano: ${error.response?.data?.message || error.message}`);
    },
  });

  // Handler de submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // Handler de mudança de campo
  const handleChange = (
    field: keyof CreatePlanoDto,
    value: string | number | boolean | VehicleCategory[] | undefined
  ) => {
    setFormData((prev: CreatePlanoDto) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle de categoria
  const toggleCategory = (category: VehicleCategory) => {
    setFormData((prev: CreatePlanoDto) => {
      const categories = prev.allowedCategories || [];
      const newCategories = categories.includes(category)
        ? categories.filter((c: VehicleCategory) => c !== category)
        : [...categories, category];
      return { ...prev, allowedCategories: newCategories };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Plano' : 'Novo Plano'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isEdit
              ? 'Atualize as informações do plano'
              : 'Cadastre um novo plano de locação'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card - Informações Básicas */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nome do Plano *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Plano Uber Mensal"
                  required
                />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descrição opcional do plano"
                />
              </div>
            </div>
          </div>

          {/* Card - Preços */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Diária (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  value={formData.dailyPrice}
                  onChange={(e) =>
                    handleChange('dailyPrice', parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Semanal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  value={formData.weeklyPrice || ''}
                  onChange={(e) =>
                    handleChange(
                      'weeklyPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="label">Mensal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    handleChange(
                      'monthlyPrice',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Card - Quilometragem */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quilometragem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">KM Inclusos (deixe vazio se ilimitado)</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={formData.kmIncluded || ''}
                  onChange={(e) =>
                    handleChange(
                      'kmIncluded',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 5000"
                />
              </div>
              <div>
                <label className="label">Valor por KM Excedente (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.kmExtraPrice || ''}
                  onChange={(e) =>
                    handleChange(
                      'kmExtraPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 0.50"
                />
              </div>
            </div>
          </div>

          {/* Card - Benefícios */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Benefícios Inclusos
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={formData.includesInsurance}
                  onChange={(e) =>
                    handleChange('includesInsurance', e.target.checked)
                  }
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Inclui Seguro
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={formData.includesMaintenance}
                  onChange={(e) =>
                    handleChange('includesMaintenance', e.target.checked)
                  }
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Inclui Manutenção
                </span>
              </label>
            </div>
          </div>

          {/* Card - Categorias Permitidas */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Categorias de Veículos Permitidas *
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.values(VehicleCategory) as VehicleCategory[]).map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded"
                    checked={formData.allowedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {VehicleCategoryLabels[category]}
                  </span>
                </label>
              ))}
            </div>
            {formData.allowedCategories.length === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Selecione pelo menos uma categoria
              </p>
            )}
          </div>

          {/* Card - Status */}
          <div className="card bg-white dark:bg-gray-800 border dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded"
                checked={formData.active}
                onChange={(e) => handleChange('active', e.target.checked)}
              />
              <span className="text-gray-700 dark:text-gray-300">
                Plano ativo
              </span>
            </label>
          </div>

          {/* Mensagem de erro */}
          {mutation.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">
                {(mutation.error as Error).message ||
                  'Erro ao salvar o plano. Verifique os dados e tente novamente.'}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Link
              to="/planos"
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={
                mutation.isPending || formData.allowedCategories.length === 0
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isPending
                ? 'Salvando...'
                : isEdit
                  ? 'Atualizar Plano'
                  : 'Cadastrar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
