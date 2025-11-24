import { MotoristaLayout } from '../../components/layout/MotoristaLayout';
import { useMotoristaAuth } from '../../hooks/useMotoristaAuth';
import { User, Mail, Phone, CreditCard, Shield, Key, Calendar } from 'lucide-react';

export const MotoristaPerfilPage = () => {
  const { motorista } = useMotoristaAuth();

  const formatCPF = (cpf?: string | null) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
              <button className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
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
      </div>
    </MotoristaLayout>
  );
};
