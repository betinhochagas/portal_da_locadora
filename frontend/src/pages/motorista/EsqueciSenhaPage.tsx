import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoristaAuth } from '../../contexts/MotoristaAuthContext';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const EsqueciSenhaPage = () => {
  const { esqueciSenha } = useMotoristaAuth();

  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido. Digite 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      await esqueciSenha({ cpf: cpfNumbers });
      setSuccess(true);
      setCpf('');
    } catch (err) {
      console.error('Erro ao solicitar reset:', err);
      
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao solicitar nova senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Esqueci Minha Senha</h1>
          <p className="text-blue-100 text-sm">Digite seu CPF para receber uma nova senha</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {success ? (
            // Mensagem de Sucesso
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Email Enviado!</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Se o CPF estiver cadastrado, você receberá um email com instruções para criar uma nova senha.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Não recebeu o email?</strong><br />
                  Verifique sua caixa de spam ou entre em contato com a locadora.
                </p>
              </div>

              <Link
                to="/motorista/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            // Formulário
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
                <p className="text-sm text-blue-800 leading-relaxed">
                  Digite seu CPF cadastrado. Enviaremos instruções para criar uma nova senha no email cadastrado.
                </p>
              </div>

              {/* Campo CPF */}
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  required
                  autoFocus
                />
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Email'
                  )}
                </button>

                <Link
                  to="/motorista/login"
                  className="block text-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors py-2"
                >
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-xs mt-6">
          Problemas? Entre em contato com a locadora.
        </p>
      </div>
    </div>
  );
};
