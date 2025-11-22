import { useQuery } from '@tanstack/react-query';
import { veiculosService } from '../../services/veiculosService';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function AlertasManutencaoWidget() {
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas-manutencao'],
    queryFn: () => veiculosService.getAlertasManutencao(),
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚠️ Alertas de Manutenção
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  const total = alertas?.length || 0;
  const atrasados = alertas?.filter((a) => a.atrasado).length || 0;
  const urgentes = alertas?.filter((a) => !a.atrasado && a.kmRestantes <= 500).length || 0;
  const proximaManutencao = alertas?.filter((a) => !a.atrasado && a.kmRestantes > 500).length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertas de Manutenção
        </h3>
      </div>

      <div className="p-6">
        {total === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum veículo necessita manutenção no momento
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {atrasados}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">Atrasados</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {urgentes}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">Urgente</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {proximaManutencao}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Em breve</div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alertas?.map((alerta) => {
                const corStatus = alerta.atrasado
                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                  : alerta.kmRestantes <= 500
                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';

                const corTexto = alerta.atrasado
                  ? 'text-red-700 dark:text-red-300'
                  : alerta.kmRestantes <= 500
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-yellow-700 dark:text-yellow-300';

                return (
                  <Link
                    key={alerta.id}
                    to={`/veiculos/${alerta.id}`}
                    className={`block p-3 rounded border ${corStatus} hover:shadow transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className={`font-semibold ${corTexto}`}>
                          {alerta.plate}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {alerta.brand} {alerta.model}
                        </div>
                        {alerta.filial && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {alerta.filial.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {alerta.atrasado ? (
                          <div className="flex items-center gap-1 text-red-700 dark:text-red-300">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">Atrasado</span>
                          </div>
                        ) : (
                          <div className={`text-sm font-semibold ${corTexto}`}>
                            {alerta.kmRestantes} km
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Próxima: {alerta.nextMaintenanceKm?.toLocaleString() || '-'} km
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/manutencoes"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Ver todas as manutenções →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
