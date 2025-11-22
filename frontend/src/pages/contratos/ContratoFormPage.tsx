import { Link } from 'react-router-dom';

export default function ContratoFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Novo Contrato
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Wizard de criação de contratos
            </p>
          </div>
          <Link to="/contratos" className="btn-secondary">
            Voltar
          </Link>
        </div>

        {/* Card de aviso */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Funcionalidade em Desenvolvimento
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O wizard multi-step de criação de contratos está em desenvolvimento
                devido à sua complexidade. Esta funcionalidade permitirá:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                <li>
                  <strong>Passo 1:</strong> Selecionar motorista ativo (verificar
                  blacklist)
                </li>
                <li>
                  <strong>Passo 2:</strong> Selecionar veículo disponível (filtrar por
                  status)
                </li>
                <li>
                  <strong>Passo 3:</strong> Escolher plano compatível (validar categoria
                  do veículo)
                </li>
                <li>
                  <strong>Passo 4:</strong> Configurar contrato (datas, valores,
                  quilometragem)
                </li>
                <li>
                  <strong>Passo 5:</strong> Revisar e confirmar (resumo completo)
                </li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ⚡ Funcionalidades já disponíveis:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                  <li>Visualização de todos os contratos</li>
                  <li>Detalhes completos de cada contrato</li>
                  <li>Ações de gestão (ativar, suspender, cancelar, concluir)</li>
                  <li>Troca de veículo dentro do contrato</li>
                  <li>Workflow completo de status</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🔧 Alternativa temporária:
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Para criar contratos enquanto o wizard não está pronto, você pode:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Usar ferramentas como Postman/Insomnia</li>
                  <li>
                    Fazer POST para{' '}
                    <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      http://localhost:3000/api/v1/contratos
                    </code>
                  </li>
                  <li>Ou utilizar os 3 contratos de exemplo já criados nos seeds</li>
                </ol>
              </div>

              <div className="flex gap-3 mt-6">
                <Link to="/contratos" className="btn-primary">
                  Ver Contratos Existentes
                </Link>
                <Link to="/dashboard" className="btn-secondary">
                  Voltar ao Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Card informativo adicional */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Estrutura do DTO de Criação
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Para referência técnica, estes são os campos necessários:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            {`{
  "contractNumber": "2025-004",
  "motoristaId": "uuid-do-motorista",
  "veiculoId": "uuid-do-veiculo",
  "planoId": "uuid-do-plano",
  "filialId": "uuid-da-filial",
  "startDate": "2025-11-22",
  "endDate": "2026-11-22",
  "billingDay": 5,
  "monthlyAmount": 1800.00,
  "deposit": 500.00,
  "kmStart": 50000,
  "notes": "Observações opcionais"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
