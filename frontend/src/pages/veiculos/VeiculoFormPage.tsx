import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Filial {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface VeiculoFormData {
  plate: string;
  renavam: string;
  chassi: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: string;
  fuelType: string;
  transmission: string;
  status: string;
  km: number;
  fipeValue: number;
  filialId: string;
}

export function VeiculoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<VeiculoFormData>({
    plate: '',
    renavam: '',
    chassi: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    category: 'HATCH',
    fuelType: 'FLEX',
    transmission: 'MANUAL',
    status: 'DISPONIVEL',
    km: 0,
    fipeValue: 0,
    filialId: '',
  });

  const { data: filiais } = useQuery<Filial[]>({
    queryKey: ['filiais'],
    queryFn: async () => {
      const response = await api.get('/filiais');
      return response.data;
    },
  });

  const { data: veiculo, isLoading } = useQuery({
    queryKey: ['veiculo', id],
    queryFn: async () => {
      const response = await api.get(`/veiculos/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  // Populate form when editing
  if (veiculo && isEditing && formData.plate === '') {
    setFormData({
      plate: veiculo.plate || '',
      renavam: veiculo.renavam || '',
      chassi: veiculo.chassi || '',
      brand: veiculo.brand || '',
      model: veiculo.model || '',
      year: veiculo.year || new Date().getFullYear(),
      color: veiculo.color || '',
      category: veiculo.category || 'HATCH',
      fuelType: veiculo.fuelType || 'FLEX',
      transmission: veiculo.transmission || 'MANUAL',
      status: veiculo.status || 'DISPONIVEL',
      km: veiculo.km || 0,
      fipeValue: veiculo.fipeValue || 0,
      filialId: veiculo.filialId || '',
    });
  }

  const createMutation = useMutation({
    mutationFn: async (data: VeiculoFormData) => {
      await api.post('/veiculos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      navigate('/veiculos');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VeiculoFormData) => {
      console.log('Enviando dados para atualização:', data);
      await api.patch(`/veiculos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      queryClient.invalidateQueries({ queryKey: ['veiculo', id] });
      navigate(`/veiculos/${id}`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar veículo:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar campos vazios e converter tipos
    const dataToSend: Partial<VeiculoFormData> = {
      plate: formData.plate,
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      color: formData.color,
      category: formData.category,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      status: formData.status,
      km: Number(formData.km) || 0,
      filialId: formData.filialId,
    };

    // Adicionar campos opcionais apenas se preenchidos
    if (formData.renavam && formData.renavam.trim()) {
      dataToSend.renavam = formData.renavam.trim();
    }
    if (formData.chassi && formData.chassi.trim()) {
      dataToSend.chassi = formData.chassi.trim();
    }
    if (formData.fipeValue && Number(formData.fipeValue) > 0) {
      dataToSend.fipeValue = Number(formData.fipeValue);
    }

    if (isEditing) {
      updateMutation.mutate(dataToSend as VeiculoFormData);
    } else {
      createMutation.mutate(dataToSend as VeiculoFormData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Normalizar placa para maiúsculas e remover hífen
    if (name === 'plate') {
      const normalizedPlate = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: normalizedPlate }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando veículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/veiculos" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Voltar para Veículos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isEditing ? 'Atualize as informações do veículo' : 'Cadastre um novo veículo na frota'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Identificação */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🚗 Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Placa *</label>
                <input
                  type="text"
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  placeholder="ABC-1234 ou ABC1D23"
                  className="input"
                  required
                  maxLength={8}
                />
              </div>
              <div>
                <label className="label">Renavam</label>
                <input
                  type="text"
                  name="renavam"
                  value={formData.renavam}
                  onChange={handleChange}
                  placeholder="00000000000"
                  className="input"
                  maxLength={11}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Chassi</label>
                <input
                  type="text"
                  name="chassi"
                  value={formData.chassi}
                  onChange={handleChange}
                  placeholder="00000000000000000"
                  className="input"
                  maxLength={17}
                />
              </div>
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📋 Dados do Veículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Marca *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ex: Fiat, Volkswagen, Toyota"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Modelo *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Ex: Argo, Gol, Corolla"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Ano *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Cor *</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Ex: Branco, Preto, Prata"
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Especificações */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⚙️ Especificações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Categoria *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input" required>
                  <option value="HATCH">Hatch</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="PICAPE">Picape</option>
                  <option value="VAN">Van</option>
                </select>
              </div>
              <div>
                <label className="label">Combustível *</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input" required>
                  <option value="FLEX">Flex</option>
                  <option value="GASOLINA">Gasolina</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELETRICO">Elétrico</option>
                  <option value="HIBRIDO">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="label">Transmissão *</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="input" required>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATICO">Automático</option>
                  <option value="AUTOMATIZADO">Automatizado</option>
                </select>
              </div>
              <div>
                <label className="label">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input" required>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="LOCADO">Locado</option>
                  <option value="MANUTENCAO">Em Manutenção</option>
                  <option value="VISTORIA">Em Vistoria</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Valores e Localização */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💰 Valores e Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Quilometragem (km) *</label>
                <input
                  type="number"
                  name="km"
                  value={formData.km}
                  onChange={handleChange}
                  min={0}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Valor FIPE (R$)</label>
                <input
                  type="number"
                  name="fipeValue"
                  value={formData.fipeValue}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Filial *</label>
                <select name="filialId" value={formData.filialId} onChange={handleChange} className="input" required>
                  <option value="">Selecione...</option>
                  {filiais?.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.name} - {filial.city}/{filial.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <Link to="/veiculos" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {(createMutation.isPending || updateMutation.isPending) 
                ? '⏳ Salvando...' 
                : isEditing 
                  ? '💾 Atualizar Veículo' 
                  : '✅ Cadastrar Veículo'}
            </button>
          </div>

          {/* Error Messages */}
          {(createMutation.isError || updateMutation.isError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Erro:</strong>{' '}
              {(() => {
                const error = createMutation.error || updateMutation.error;
                if (error && typeof error === 'object' && 'response' in error) {
                  const axiosError = error as { response?: { data?: { message?: string | string[] } } };
                  const message = axiosError.response?.data?.message;
                  if (Array.isArray(message)) {
                    return message.join(', ');
                  }
                  return message || 'Erro ao salvar veículo';
                }
                return 'Erro ao salvar veículo';
              })()}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
