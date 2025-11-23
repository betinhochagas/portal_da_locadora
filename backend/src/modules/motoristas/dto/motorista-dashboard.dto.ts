export class MotoristaDashboardDto {
  contratos: {
    total: number;
    ativos: number;
    proxVencimento?: Date;
  };
  veiculo?: {
    id: string;
    modelo: string;
    placa: string;
    ano: number;
  };
  pagamentos: {
    total: number;
    pendentes: number;
    proximoPagamento?: {
      valor: number;
      vencimento: Date;
    };
  };
  estatisticas: {
    diasComoMotorista: number;
    totalPago: number;
  };
}
