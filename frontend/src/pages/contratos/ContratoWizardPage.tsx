import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { Motorista } from '../../types/motorista';
import type { Veiculo } from '../../types/veiculo';
import type { Plano } from '../../types/plano';
import type { Filial } from '../../types/filial';

interface WizardData {
  contractNumber: string;
  motoristaId: string;
  veiculoId: string;
  planoId: string;
  filialId: string;
  startDate: string;
  endDate: string;
  billingDay: number;
  monthlyAmount: number;
  deposit: number;
  kmStart: number;
  notes: string;
}

export default function ContratoWizardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({
    billingDay: 5,
    deposit: 0,
    kmStart: 0,
    notes: '',
  });

  const [searchMotorista, setSearchMotorista] = useState('');
  const [searchVeiculo, setSearchVeiculo] = useState('');
  const [tipoCobranca, setTipoCobranca] = useState<'DIARIA' | 'SEMANAL' | 'MENSAL'>('MENSAL');

  // Queries
  const { data: motoristas = [] } = useQuery<Motorista[]>({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const response = await api.get('/motoristas');
      return response.data;
    },
  });

  const { data: veiculos = [] } = useQuery<Veiculo[]>({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const response = await api.get('/veiculos');
      return response.data;
    },
  });

  const { data: planos = [] } = useQuery<Plano[]>({
    queryKey: ['planos'],
    queryFn: async () => {
      const response = await api.get('/planos');
      return response.data;
    },
  });

  const { data: filiais = [] } = useQuery<Filial[]>({
    queryKey: ['filiais'],
    queryFn: async () => {
      const response = await api.get('/filiais');
      return response.data;
    },
  });

  const createContratoMutation = useMutation({
    mutationFn: async (data: WizardData) => {
      const response = await api.post('/contratos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      navigate('/contratos');
    },
  });

  // Filtros
  const motoristasAtivos = motoristas.filter(
    (m) => {
      // Verificar se está ativo (boolean) e não na blacklist
      if (!m.active || m.blacklisted) return false;
      
      const search = searchMotorista.toLowerCase();
      const searchClean = search.replace(/[.\-/]/g, ''); // Remove pontuação
      
      return (
        m.name.toLowerCase().includes(search) ||
        m.cpf?.replace(/[.\-]/g, '').includes(searchClean) ||
        m.cnpj?.replace(/[.\-/]/g, '').includes(searchClean)
      );
    }
  );

  const veiculosDisponiveis = veiculos.filter(
    (v) =>
      v.status === 'DISPONIVEL' &&
      (v.plate.toLowerCase().includes(searchVeiculo.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchVeiculo.toLowerCase()) ||
        v.model.toLowerCase().includes(searchVeiculo.toLowerCase())),
  );

  const selectedMotorista = motoristas.find((m) => m.id === wizardData.motoristaId);
  const selectedVeiculo = veiculos.find((v) => v.id === wizardData.veiculoId);
  const selectedPlano = planos.find((p) => p.id === wizardData.planoId);
  const selectedFilial = filiais.find((f) => f.id === wizardData.filialId);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!isStep5Valid()) return;
    
    // Gerar número de contrato único
    const contractNumber = `CONT-${Date.now()}`;
    
    // Preparar dados com conversões necessárias
    // IMPORTANTE: monthlyAmount e deposit precisam ser strings para o @IsDecimal do backend
    const payload = {
      ...wizardData,
      contractNumber,
      monthlyAmount: String(Number(wizardData.monthlyAmount || 0).toFixed(2)),
      deposit: String(Number(wizardData.deposit || 0).toFixed(2)),
      kmStart: Number(wizardData.kmStart || 0),
      billingDay: Number(wizardData.billingDay),
    };
    
    console.log('Enviando contrato:', payload);
    createContratoMutation.mutate(payload as any);
  };

  const isStep1Valid = () => !!wizardData.motoristaId;
  const isStep2Valid = () => !!wizardData.veiculoId;
  const isStep3Valid = () => !!wizardData.planoId && !!wizardData.filialId;
  const isStep4Valid = () =>
    !!wizardData.startDate &&
    !!wizardData.endDate &&
    wizardData.monthlyAmount! > 0 &&
    wizardData.kmStart! >= 0;
  const isStep5Valid = () =>
    isStep1Valid() && isStep2Valid() && isStep3Valid() && isStep4Valid();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Novo Contrato
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Wizard de criação - Passo {currentStep} de 5
            </p>
          </div>
          <Link to="/contratos" className="btn-secondary">
            Cancelar
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Motorista</span>
            <span>Veículo</span>
            <span>Plano</span>
            <span>Dados</span>
            <span>Revisão</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {/* STEP 1: Selecionar Motorista */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Selecionar Motorista
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Escolha um motorista ativo para o contrato
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nome, CPF ou CNPJ..."
                  value={searchMotorista}
                  onChange={(e) => setSearchMotorista(e.target.value)}
                  className="input"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchMotorista.trim() === '' ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Digite o nome, CPF ou CNPJ para buscar um motorista
                  </div>
                ) : motoristasAtivos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum motorista ativo encontrado
                  </div>
                ) : (
                  motoristasAtivos.map((motorista) => (
                    <div
                      key={motorista.id}
                      onClick={() =>
                        setWizardData({ ...wizardData, motoristaId: motorista.id })
                      }
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        wizardData.motoristaId === motorista.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {motorista.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {motorista.cpf || motorista.cnpj} • {motorista.phone}
                          </p>
                          {motorista.email && (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {motorista.email}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
                          ATIVO
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Selecionar Veículo */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Selecionar Veículo
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Escolha um veículo disponível para locação
              </p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Buscar por placa, marca ou modelo..."
                  value={searchVeiculo}
                  onChange={(e) => setSearchVeiculo(e.target.value)}
                  className="input"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {veiculosDisponiveis.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum veículo disponível no momento
                  </div>
                ) : (
                  veiculosDisponiveis.map((veiculo) => (
                    <div
                      key={veiculo.id}
                      onClick={() =>
                        setWizardData({ 
                          ...wizardData, 
                          veiculoId: veiculo.id,
                          kmStart: veiculo.kmCurrent // Preenche automaticamente o KM inicial
                        })
                      }
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        wizardData.veiculoId === veiculo.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {veiculo.plate}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {veiculo.brand} {veiculo.model}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {veiculo.year} • {veiculo.category} • {veiculo.color} • {veiculo.kmCurrent.toLocaleString('pt-BR')} km
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
                          {veiculo.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Selecionar Plano e Filial */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Plano e Filial
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Escolha o plano de locação e a filial responsável
              </p>

              <div className="mb-6">
                <label className="label">Plano de Locação</label>
                <div className="space-y-3">
                  {planos.map((plano) => (
                    <div
                      key={plano.id}
                      onClick={() =>
                        setWizardData({
                          ...wizardData,
                          planoId: plano.id,
                          monthlyAmount: plano.monthlyPrice,
                        })
                      }
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        wizardData.planoId === plano.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {plano.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plano.description}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Diária: {formatCurrency(plano.dailyPrice)}
                            </span>
                            {plano.weeklyPrice && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Semanal: {formatCurrency(plano.weeklyPrice)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              Mensal: {formatCurrency(plano.monthlyPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Filial Responsável</label>
                <select
                  value={wizardData.filialId || ''}
                  onChange={(e) =>
                    setWizardData({ ...wizardData, filialId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Selecione uma filial</option>
                  {filiais
                    .filter((f) => f.active)
                    .map((filial) => (
                      <option key={filial.id} value={filial.id}>
                        {filial.name} - {filial.city}/{filial.state}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Configurar Dados do Contrato */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Dados do Contrato
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Configure as datas, valores e observações
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Data de Início *</label>
                  <input
                    type="date"
                    value={wizardData.startDate || ''}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, startDate: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Data de Término *</label>
                  <input
                    type="date"
                    value={wizardData.endDate || ''}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, endDate: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Dia de Vencimento *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={wizardData.billingDay || 5}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        billingDay: parseInt(e.target.value),
                      })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Tipo de Cobrança *</label>
                  <select
                    value={tipoCobranca}
                    onChange={(e) => {
                      const tipo = e.target.value as 'DIARIA' | 'SEMANAL' | 'MENSAL';
                      setTipoCobranca(tipo);
                      
                      // Atualizar valor automaticamente baseado no plano selecionado
                      if (selectedPlano) {
                        let valor = 0;
                        if (tipo === 'DIARIA') valor = selectedPlano.dailyPrice;
                        else if (tipo === 'SEMANAL') valor = selectedPlano.weeklyPrice || 0;
                        else valor = selectedPlano.monthlyPrice;
                        
                        setWizardData({ ...wizardData, monthlyAmount: valor });
                      }
                    }}
                    className="input"
                  >
                    <option value="DIARIA">Diária</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Valor {tipoCobranca === 'DIARIA' ? 'Diário' : tipoCobranca === 'SEMANAL' ? 'Semanal' : 'Mensal'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={wizardData.monthlyAmount || ''}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        monthlyAmount: parseFloat(e.target.value),
                      })
                    }
                    className="input"
                    placeholder="Digite o valor"
                    required
                  />
                </div>

                <div>
                  <label className="label">Caução</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={wizardData.deposit || ''}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        deposit: parseFloat(e.target.value),
                      })
                    }
                    className="input"
                    placeholder="Digite o valor da caução (opcional)"
                  />
                </div>

                <div>
                  <label className="label">KM Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    value={wizardData.kmStart || ''}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        kmStart: parseInt(e.target.value),
                      })
                    }
                    className="input"
                    placeholder="Digite a quilometragem inicial"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="label">Observações</label>
                <textarea
                  value={wizardData.notes || ''}
                  onChange={(e) =>
                    setWizardData({ ...wizardData, notes: e.target.value })
                  }
                  className="input"
                  rows={4}
                  placeholder="Informações adicionais sobre o contrato..."
                />
              </div>
            </div>
          )}

          {/* STEP 5: Revisão */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Revisar Contrato
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Confira todos os dados antes de criar o contrato
              </p>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Motorista
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedMotorista?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMotorista?.cpf || selectedMotorista?.cnpj} •{' '}
                    {selectedMotorista?.phone}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Veículo
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-bold">
                    {selectedVeiculo?.plate}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedVeiculo?.brand} {selectedVeiculo?.model}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVeiculo?.year} • {selectedVeiculo?.category}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Plano e Filial
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedPlano?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {selectedFilial?.name} - {selectedFilial?.city}/
                    {selectedFilial?.state}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Dados do Contrato
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Período
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {wizardData.startDate &&
                          new Date(wizardData.startDate).toLocaleDateString('pt-BR')}{' '}
                        até{' '}
                        {wizardData.endDate &&
                          new Date(wizardData.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dia de Vencimento
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Todo dia {wizardData.billingDay}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Valor Mensal
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(wizardData.monthlyAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Caução</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {formatCurrency(wizardData.deposit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        KM Inicial
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {wizardData.kmStart?.toLocaleString('pt-BR')} km
                      </p>
                    </div>
                  </div>
                  {wizardData.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Observações
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {wizardData.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Voltar
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid()) ||
                  (currentStep === 3 && !isStep3Valid()) ||
                  (currentStep === 4 && !isStep4Valid())
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStep5Valid() || createContratoMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createContratoMutation.isPending
                  ? '⏳ Criando...'
                  : '✓ Criar Contrato'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
