import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMotoristaAuth } from '../../hooks/useMotoristaAuth';
import { Eye, EyeOff, Car, AlertCircle } from 'lucide-react';

export const MotoristaLoginPage = () => {
  const navigate = useNavigate();
  const { login, needsPasswordReset } = useMotoristaAuth();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formatar CPF enquanto digita
  const formatCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação básica
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido. Digite 11 dígitos.');
      return;
    }

    if (!senha || senha.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await login({ cpf: cpfNumbers, password: senha });

      // Se precisa resetar senha, será redirecionado pelo PrivateRoute
      if (needsPasswordReset) {
        navigate('/motorista/primeiro-acesso');
      } else {
        navigate('/motorista/dashboard');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      
      // Mensagens de erro amigáveis
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } };
        if (error.response?.status === 401) {
          setError('CPF ou senha incorretos.');
        } else if (error.response?.status === 403) {
          setError(error.response?.data?.message || 'Acesso bloqueado. Entre em contato com a locadora.');
        } else if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Car className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal do Motorista</h1>
          <p className="text-blue-100 text-sm">Acesse seus contratos e pagamentos</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Campo CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                id="cpf"
                type="tel"
                inputMode="numeric"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                required
                autoComplete="off"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Link Esqueci Senha */}
            <div className="text-right">
              <Link
                to="/motorista/esqueci-senha"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Aviso Primeiro Acesso */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <strong>Primeiro acesso?</strong> Use o CPF e a senha enviada pela locadora. 
              Você será solicitado a criar uma nova senha no primeiro login.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-xs mt-6">
          © 2025 Portal da Locadora. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
