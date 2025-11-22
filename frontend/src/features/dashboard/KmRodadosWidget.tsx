import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface Contrato {
  status: string;
}

interface Veiculo {
  id: string;
  plate: string;
  brand: string;
  model: string;
  contratos?: Contrato[];
}

interface KmSemanaData {
  veiculoId: string;
  placa: string;
  modelo: string;
  kmRodadoSemana: number;
  dataUltimoRegistro: string | null;
}

export function KmRodadosWidget() {
  const { data: kmData, isLoading } = useQuery({
    queryKey: ['km-rodados-semana'],
    queryFn: async () => {
      // Buscar todos os veículos com contrato ativo
      const veiculosResponse = await api.get('/veiculos');
      const veiculos = veiculosResponse.data;

      // Buscar KM da semana atual para cada veículo com contrato ativo
      const veiculosAtivos = veiculos.filter((v: Veiculo) => 
        v.contratos && v.contratos.some((c) => c.status === 'ATIVO')
      );

      const kmPromises = veiculosAtivos.map(async (veiculo: Veiculo) => {
        try {
          const kmResponse = await api.get(`/veiculos/${veiculo.id}/km-semana-atual`);
          return {
            veiculoId: veiculo.id,
            placa: veiculo.plate,
            modelo: `${veiculo.brand} ${veiculo.model}`,
            kmRodadoSemana: kmResponse.data.kmRodadoSemana || 0,
            dataUltimoRegistro: kmResponse.data.ultimoRegistro?.dataRegistro || null,
          };
        } catch {
          return {
            veiculoId: veiculo.id,
            placa: veiculo.plate,
            modelo: `${veiculo.brand} ${veiculo.model}`,
            kmRodadoSemana: 0,
            dataUltimoRegistro: null,
          };
        }
      });

      const resultados = await Promise.all(kmPromises);
      
      // Calcular total de KM rodados
      const totalKm = resultados.reduce((sum, item) => sum + item.kmRodadoSemana, 0);

      return {
        totalKm,
        veiculos: resultados.sort((a, b) => b.kmRodadoSemana - a.kmRodadoSemana).slice(0, 5), // Top 5
      };
    },
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  if (isLoading) {
    return (
      <div className="card bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-sm">KM Rodados</p>
            <p className="text-3xl font-bold">...</p>
            <p className="text-xs text-teal-100 mt-1">Carregando...</p>
          </div>
          <div className="text-5xl opacity-50">📊</div>
        </div>
      </div>
    );
  }

  const totalKm = kmData?.totalKm || 0;
  const veiculos = kmData?.veiculos || [];

  return (
    <div className="card bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 text-white hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="text-teal-100 text-sm font-medium">KM Rodados</p>
          <p className="text-3xl font-bold">
            {totalKm.toLocaleString('pt-BR')} km
          </p>
          <p className="text-xs text-teal-100 mt-1">Esta semana</p>
        </div>
        <div className="text-5xl opacity-50 group-hover:opacity-70 transition-opacity">📊</div>
      </div>

      {/* Top 5 veículos */}
      {veiculos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-teal-400/30">
          <p className="text-xs text-teal-100 font-semibold mb-2">Top 5 Veículos:</p>
          <div className="space-y-1">
            {veiculos.map((veiculo: KmSemanaData) => (
              <div key={veiculo.veiculoId} className="flex items-center justify-between text-xs">
                <span className="text-teal-50 truncate max-w-[180px]">
                  {veiculo.placa}
                </span>
                <span className="text-teal-100 font-bold">
                  {veiculo.kmRodadoSemana.toLocaleString('pt-BR')} km
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {veiculos.length === 0 && (
        <div className="mt-4 pt-4 border-t border-teal-400/30">
          <p className="text-xs text-teal-100">
            Nenhum registro de KM esta semana
          </p>
        </div>
      )}
    </div>
  );
}
