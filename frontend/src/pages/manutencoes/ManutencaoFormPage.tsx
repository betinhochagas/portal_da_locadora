import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { manutencoesService } from '../../services/manutencoesService';
import { veiculosService } from '../../services/veiculosService';
import {
  MaintenanceType,
  MaintenanceStatus,
  maintenanceTypeLabel,
  maintenanceStatusLabel,
} from '../../types/manutencao';
import type { CreateManutencaoData } from '../../types/manutencao';

export function ManutencaoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const initialized = useRef(false);

  const [formData, setFormData] = useState<CreateManutencaoData>({
    veiculoId: '',
    type: MaintenanceType.PREVENTIVA,
    description: '',
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    cost: 0,
    provider: '',
    status: MaintenanceStatus.AGENDADA,
    observations: '',
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosService.list(),
  });

  const { data: manutencao } = useQuery({
    queryKey: ['manutencao', id],
    queryFn: () => manutencoesService.getById(id!),
    enabled: isEditing,
  });

  // Inicializa formData com dados da manutenção se estiver editando
  useEffect(() => {
    if (manutencao && isEditing && !initialized.current) {
      initialized.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        veiculoId: manutencao.veiculoId,
        type: manutencao.type,
        description: manutencao.description,
        date: new Date(manutencao.date).toISOString().split('T')[0],
        mileage: manutencao.mileage,
        cost: manutencao.cost,
        provider: manutencao.provider,
        status: manutencao.status,
        observations: manutencao.observations || '',
      });
    }
  }, [manutencao, isEditing]);

  const createMutation = useMutation({
    mutationFn: manutencoesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      navigate('/manutencoes');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateManutencaoData) =>
      manutencoesService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      queryClient.invalidateQueries({ queryKey: ['manutencao', id] });
      navigate('/manutencoes');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'mileage' || name === 'cost') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
        <Link
          to="/manutencoes"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
        >
          ← Voltar para lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Manutenção' : 'Nova Manutenção'}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
      >
        <div>
          <label
            htmlFor="veiculoId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Veículo *
          </label>
          <select
            id="veiculoId"
            name="veiculoId"
            value={formData.veiculoId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecione um veículo</option>
            {veiculos?.map((veiculo: { id: string; plate: string; brand: string; model: string }) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.plate} - {veiculo.brand} {veiculo.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tipo *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.entries(maintenanceTypeLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Descrição *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ex: Troca de óleo e filtros"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Data *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="mileage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Quilometragem *
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cost"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Custo (R$) *
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label
              htmlFor="provider"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Fornecedor *
            </label>
            <input
              type="text"
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nome da oficina"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.entries(maintenanceStatusLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="observations"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Observações
          </label>
          <textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Informações adicionais..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
          <Link
            to="/manutencoes"
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}
