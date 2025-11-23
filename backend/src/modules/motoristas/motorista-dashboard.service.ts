import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MotoristaDashboardDto } from './dto/motorista-dashboard.dto';

@Injectable()
export class MotoristaDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(motoristaId: string): Promise<MotoristaDashboardDto> {
    // Buscar motorista com relacionamentos
    const motorista = await this.prisma.motorista.findUnique({
      where: { id: motoristaId },
      include: {
        contratos: {
          include: {
            veiculo: true,
            plano: true,
            cobrancas: {
              orderBy: { dueDate: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!motorista) {
      throw new Error('Motorista não encontrado');
    }

    // Calcular estatísticas de contratos
    const totalContratos = motorista.contratos.length;
    const contratosAtivos = motorista.contratos.filter(
      (c) => c.status === 'ATIVO',
    ).length;

    // Pegar contrato ativo mais recente
    const contratoAtivo = motorista.contratos.find((c) => c.status === 'ATIVO');

    // Buscar informações do veículo atual
    let veiculoInfo: { id: string; modelo: string; placa: string; ano: number } | undefined;
    if (contratoAtivo && contratoAtivo.veiculo) {
      veiculoInfo = {
        id: contratoAtivo.veiculo.id,
        modelo: `${contratoAtivo.veiculo.brand} ${contratoAtivo.veiculo.model}`,
        placa: contratoAtivo.veiculo.plate,
        ano: contratoAtivo.veiculo.year,
      };
    }

    // Calcular estatísticas de pagamentos
    const todasCobrancas = motorista.contratos.flatMap((c) => c.cobrancas);
    const totalCobrancas = todasCobrancas.length;
    const cobrancasPendentes = todasCobrancas.filter(
      (c) => c.status === 'PENDENTE' || c.status === 'ATRASADA',
    ).length;

    // Próximo pagamento pendente
    const proximaCobranca = todasCobrancas
      .filter((c) => c.status === 'PENDENTE' || c.status === 'ATRASADA')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

    let proximoPagamento: { valor: number; vencimento: Date } | undefined;
    if (proximaCobranca) {
      proximoPagamento = {
        valor: Number(proximaCobranca.amount),
        vencimento: proximaCobranca.dueDate,
      };
    }

    // Calcular total pago
    const totalPago = todasCobrancas
      .filter((c) => c.status === 'PAGA')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // Calcular dias como motorista
    const diasComoMotorista = Math.floor(
      (Date.now() - motorista.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Próximo vencimento de contrato
    const proximoVencimento = contratoAtivo?.endDate;

    return {
      contratos: {
        total: totalContratos,
        ativos: contratosAtivos,
        proxVencimento: proximoVencimento,
      },
      veiculo: veiculoInfo,
      pagamentos: {
        total: totalCobrancas,
        pendentes: cobrancasPendentes,
        proximoPagamento,
      },
      estatisticas: {
        diasComoMotorista,
        totalPago,
      },
    };
  }
}
