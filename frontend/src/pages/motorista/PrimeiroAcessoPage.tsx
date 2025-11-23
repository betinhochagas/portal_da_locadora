import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMotoristaAuth } from '../../contexts/MotoristaAuthContext';
import { Eye, EyeOff, Key, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const PrimeiroAcessoPage = () => {
  const navigate = useNavigate();
  const { primeiroAcesso, motorista, logout } = useMotoristaAuth();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validações de senha
  const validations = {
    minLength: novaSenha.length >= 8,
    hasLetter: /[a-zA-Z]/.test(novaSenha),
    hasNumber: /\d/.test(novaSenha),
    match: novaSenha === confirmarSenha && novaSenha !== '',
  };

  const allValid = Object.values(validations).every((v) => v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allValid) {
      setError('Por favor, atenda todos os requisitos de senha.');
      return;
    }

    setLoading(true);

    try {
      await primeiroAcesso({
        senhaAtual,
        novaSenha,
      });

      navigate('/motorista/dashboard');
    } catch (err: any) {
      console.error('Erro no primeiro acesso:', err);
      
      if (err.response?.status === 401) {
        setError('Senha atual incorreta.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao trocar senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    logout();
    navigate('/motorista/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Key className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Primeiro Acesso</h1>
          <p className="text-blue-100 text-sm">Crie uma nova senha segura</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Olá, {motorista?.nome}!</strong><br />
                Por segurança, você precisa criar uma nova senha no primeiro acesso.
              </p>
            </div>

            {/* Senha Atual */}
            <div>
              <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual (enviada pela locadora)
              </label>
              <div className="relative">
                <input
                  id="senhaAtual"
                  type={showSenhaAtual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => {
                    setSenhaAtual(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite a senha recebida"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  id="novaSenha"
                  type={showNovaSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setError('');
                  }}
                  placeholder="Crie uma senha segura"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite a senha novamente"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Requisitos de Senha */}
            {novaSenha && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-3">Requisitos da senha:</p>
                
                <ValidationItem valid={validations.minLength} text="Mínimo 8 caracteres" />
                <ValidationItem valid={validations.hasLetter} text="Pelo menos uma letra" />
                <ValidationItem valid={validations.hasNumber} text="Pelo menos um número" />
                {confirmarSenha && (
                  <ValidationItem valid={validations.match} text="Senhas coincidem" />
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition-all text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !allValid}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </span>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar validações
const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
  <div className="flex items-center gap-2">
    {valid ? (
      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
    ) : (
      <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
    )}
    <span className={`text-xs ${valid ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
      {text}
    </span>
  </div>
);
