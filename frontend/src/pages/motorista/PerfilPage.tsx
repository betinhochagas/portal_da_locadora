import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { useMotoristaAuth } from '../../contexts/MotoristaAuthContext';
import { User, Mail, Phone, CreditCard, Shield, Key, Calendar, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export const MotoristaPerfilPage = () => {
  const { motorista } = useMotoristaAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatCPF = (cpf?: string | null) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (novaSenha.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(novaSenha)) {
      setError('A nova senha deve conter letras e números');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('motorista_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const response = await fetch(`${API_URL}/auth/motorista/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao alterar senha');
      }

      setSuccess(true);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotoristaLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Meu Perfil</h2>
          <p className="text-blue-100 text-sm">Seus dados pessoais e configurações</p>
        </div>

        <div className="space-y-4">
          {/* Card de Informações Pessoais */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {motorista?.name || motorista?.nome}
                </h3>
                <p className="text-sm text-gray-600">Motorista</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* CPF */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">CPF</p>
                  <p className="text-sm font-medium text-gray-900">{formatCPF(motorista?.cpf)}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">E-mail</p>
                  <p className="text-sm font-medium text-gray-900">
                    {motorista?.email || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Telefone */}
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPhone(motorista?.phone)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status da Conta</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Ativa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Ações */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Configurações</h4>
            
            <div className="space-y-3">
              {/* Alterar Senha */}
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Alterar Senha</p>
                  <p className="text-xs text-gray-600">Mantenha sua conta segura</p>
                </div>
              </button>

              {/* Histórico */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Membro desde</p>
                  <p className="text-xs text-gray-600">
                    {motorista?.createdAt 
                      ? new Date(motorista.createdAt).toLocaleDateString('pt-BR')
                      : 'Data não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>💡 Dica:</strong> Mantenha seus dados sempre atualizados. 
              Entre em contato com a locadora para atualizar informações pessoais.
            </p>
          </div>
        </div>

        {/* Modal de Alterar Senha */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Alterar Senha</h3>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError('');
                    setSenhaAtual('');
                    setNovaSenha('');
                    setConfirmarSenha('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      Senha alterada com sucesso!
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Senha Atual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deve conter pelo menos 8 caracteres, letras e números
                  </p>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      placeholder="Digite a nova senha novamente"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setError('');
                      setSenhaAtual('');
                      setNovaSenha('');
                      setConfirmarSenha('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MotoristaLayout>
  );
};
