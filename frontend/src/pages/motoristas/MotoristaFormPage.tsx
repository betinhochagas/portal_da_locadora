import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface MotoristaFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  rg: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  active: boolean;
  blacklisted: boolean;
  blacklistReason: string;
}

export function MotoristaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<MotoristaFormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnpj: '',
    rg: '',
    cnh: '',
    cnhCategory: 'B',
    cnhExpiry: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    active: true,
    blacklisted: false,
    blacklistReason: '',
  });

  const { data: motorista, isLoading } = useQuery({
    queryKey: ['motorista', id],
    queryFn: async () => {
      const response = await api.get(`/motoristas/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  // Populate form when editing
  if (motorista && isEditing && formData.name === '') {
    // Formatar telefone ao carregar
    const phoneNumber = motorista.phone || '';
    let formattedPhone = phoneNumber;
    if (phoneNumber.length === 11) {
      formattedPhone = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    } else if (phoneNumber.length === 10) {
      formattedPhone = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6, 10)}`;
    }

    setFormData({
      name: motorista.name || '',
      email: motorista.email || '',
      phone: formattedPhone,
      cpf: motorista.cpf || '',
      cnpj: motorista.cnpj || '',
      rg: motorista.rg || '',
      cnh: motorista.cnh || '',
      cnhCategory: motorista.cnhCategory || 'B',
      cnhExpiry: motorista.cnhExpiry ? motorista.cnhExpiry.split('T')[0] : '',
      address: motorista.address || '',
      city: motorista.city || '',
      state: motorista.state || '',
      zipCode: motorista.zipCode || '',
      bankName: motorista.bankName || '',
      bankAgency: motorista.bankAgency || '',
      bankAccount: motorista.bankAccount || '',
      active: motorista.active ?? true,
      blacklisted: motorista.blacklisted ?? false,
      blacklistReason: motorista.blacklistReason || '',
    });
  }

  const createMutation = useMutation({
    mutationFn: async (data: Partial<MotoristaFormData>) => {
      await api.post('/motoristas', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      navigate('/motoristas');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MotoristaFormData>) => {
      await api.patch(`/motoristas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      queryClient.invalidateQueries({ queryKey: ['motorista', id] });
      navigate(`/motoristas/${id}`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar motorista:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar campos vazios e preparar dados
    const dataToSend: Partial<MotoristaFormData> = {
      name: formData.name,
      phone: formData.phone,
      cnh: formData.cnh,
      cnhCategory: formData.cnhCategory,
      cnhExpiry: formData.cnhExpiry,
      active: formData.active,
      blacklisted: formData.blacklisted,
    };

    // Adicionar campos opcionais apenas se preenchidos
    if (formData.email && formData.email.trim()) {
      dataToSend.email = formData.email.trim();
    }
    if (formData.cpf && formData.cpf.trim()) {
      dataToSend.cpf = formData.cpf.replace(/\D/g, '');
    }
    if (formData.cnpj && formData.cnpj.trim()) {
      dataToSend.cnpj = formData.cnpj.replace(/\D/g, '');
    }
    if (formData.rg && formData.rg.trim()) {
      dataToSend.rg = formData.rg.trim();
    }
    if (formData.address && formData.address.trim()) {
      dataToSend.address = formData.address.trim();
    }
    if (formData.city && formData.city.trim()) {
      dataToSend.city = formData.city.trim();
    }
    if (formData.state && formData.state.trim()) {
      dataToSend.state = formData.state.trim().toUpperCase();
    }
    if (formData.zipCode && formData.zipCode.trim()) {
      dataToSend.zipCode = formData.zipCode.replace(/\D/g, '');
    }
    if (formData.bankName && formData.bankName.trim()) {
      dataToSend.bankName = formData.bankName.trim();
    }
    if (formData.bankAgency && formData.bankAgency.trim()) {
      dataToSend.bankAgency = formData.bankAgency.trim();
    }
    if (formData.bankAccount && formData.bankAccount.trim()) {
      dataToSend.bankAccount = formData.bankAccount.trim();
    }
    if (formData.blacklisted && formData.blacklistReason && formData.blacklistReason.trim()) {
      dataToSend.blacklistReason = formData.blacklistReason.trim();
    }

    // Limpar formatação do telefone antes de enviar
    dataToSend.phone = formData.phone.replace(/\D/g, '');

    // Converter cnhExpiry para ISO-8601 DateTime
    if (dataToSend.cnhExpiry) {
      dataToSend.cnhExpiry = new Date(dataToSend.cnhExpiry + 'T00:00:00.000Z').toISOString();
    }

    if (isEditing) {
      updateMutation.mutate(dataToSend);
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      // Remover tudo exceto números
      const cleaned = value.replace(/\D/g, '');
      // Limitar a 11 dígitos
      const limited = cleaned.slice(0, 11);
      // Formatar visualmente
      let formatted = limited;
      if (limited.length >= 11) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
      } else if (limited.length >= 7) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
      } else if (limited.length >= 2) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cpf') {
      // Apenas números para CPF
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 11) }));
    } else if (name === 'cnpj') {
      // Apenas números para CNPJ
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 14) }));
    } else if (name === 'zipCode') {
      // Apenas números para CEP
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 8) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando motorista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/motoristas" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Voltar para Motoristas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Motorista' : 'Novo Motorista'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isEditing ? 'Atualize as informações do motorista' : 'Cadastre um novo motorista'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Dados Pessoais */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👤 Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="00000000000"
                  className="input"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="label">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00000000000000"
                  className="input"
                  maxLength={18}
                />
              </div>
              <div>
                <label className="label">RG</label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Telefone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* CNH */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🪪 CNH</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Número *</label>
                <input
                  type="text"
                  name="cnh"
                  value={formData.cnh}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Categoria *</label>
                <select name="cnhCategory" value={formData.cnhCategory} onChange={handleChange} className="input" required>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
              <div>
                <label className="label">Validade *</label>
                <input
                  type="date"
                  name="cnhExpiry"
                  value={formData.cnhExpiry}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📍 Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Estado (UF)</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="SC"
                  className="input"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="label">CEP</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="00000000"
                  className="input"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏦 Dados Bancários</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Banco</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Agência</label>
                <input
                  type="text"
                  name="bankAgency"
                  value={formData.bankAgency}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Conta</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">⚙️ Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="mr-2"
                  id="active"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Motorista ativo</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="blacklisted"
                  checked={formData.blacklisted}
                  onChange={handleChange}
                  className="mr-2"
                  id="blacklisted"
                />
                <label htmlFor="blacklisted" className="text-sm font-medium text-gray-700 dark:text-gray-300">Motorista bloqueado</label>
              </div>
              {formData.blacklisted && (
                <div>
                  <label className="label">Motivo do bloqueio</label>
                  <textarea
                    name="blacklistReason"
                    value={formData.blacklistReason}
                    onChange={handleChange}
                    className="input"
                    rows={3}
                    placeholder="Descreva o motivo do bloqueio..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <Link to="/motoristas" className="btn-secondary">
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
                  ? '💾 Atualizar Motorista' 
                  : '✅ Cadastrar Motorista'}
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
                  return message || 'Erro ao salvar motorista';
                }
                return 'Erro ao salvar motorista';
              })()}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
