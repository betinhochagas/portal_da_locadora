import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Estatísticas de contratos
    const totalContratos = await this.prisma.contrato.count();
    const contratosAtivos = await this.prisma.contrato.count({
      where: { status: 'ATIVO' },
    });
    const contratosSuspensos = await this.prisma.contrato.count({
      where: { status: 'SUSPENSO' },
    });

    // Estatísticas de veículos
    const totalVeiculos = await this.prisma.veiculo.count();
    const veiculosDisponiveis = await this.prisma.veiculo.count({
      where: { status: 'DISPONIVEL' },
    });
    const veiculosLocados = await this.prisma.veiculo.count({
      where: { status: 'LOCADO' },
    });
    const veiculosManutencao = await this.prisma.veiculo.count({
      where: { status: 'MANUTENCAO' },
    });

    // Taxa de ocupação
    const taxaOcupacao =
      totalVeiculos > 0 ? (veiculosLocados / totalVeiculos) * 100 : 0;

    // Estatísticas de motoristas
    const totalMotoristas = await this.prisma.motorista.count();
    const motoristasAtivos = await this.prisma.motorista.count({
      where: { active: true },
    });
    const motoristasBlacklist = await this.prisma.motorista.count({
      where: { blacklisted: true },
    });

    // Receita mensal estimada (soma dos contratos ativos)
    const receitaMensal = await this.prisma.contrato.aggregate({
      where: { status: 'ATIVO' },
      _sum: {
        monthlyAmount: true,
      },
    });

    // Contratos vencendo nos próximos 30 dias
    const hoje = new Date();
    const daquiA30Dias = new Date();
    daquiA30Dias.setDate(hoje.getDate() + 30);

    const contratosVencendo = await this.prisma.contrato.count({
      where: {
        status: 'ATIVO',
        endDate: {
          gte: hoje,
          lte: daquiA30Dias,
        },
      },
    });

    return {
      contratos: {
        total: totalContratos,
        ativos: contratosAtivos,
        suspensos: contratosSuspensos,
        vencendo30dias: contratosVencendo,
      },
      veiculos: {
        total: totalVeiculos,
        disponiveis: veiculosDisponiveis,
        locados: veiculosLocados,
        manutencao: veiculosManutencao,
        taxaOcupacao: Math.round(taxaOcupacao * 100) / 100,
      },
      motoristas: {
        total: totalMotoristas,
        ativos: motoristasAtivos,
        blacklist: motoristasBlacklist,
      },
      receita: {
        mensalEstimada: Number(receitaMensal._sum.monthlyAmount || 0),
      },
    };
  }

  async getContratosVencendo(dias: number = 30) {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    const contratos = await this.prisma.contrato.findMany({
      where: {
        status: 'ATIVO',
        endDate: {
          gte: hoje,
          lte: dataLimite,
        },
      },
      include: {
        motorista: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
          },
        },
        plano: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    return contratos;
  }

  async getReceitaMensal(meses: number = 6) {
    const hoje = new Date();
    const dataInicio = new Date();
    dataInicio.setMonth(hoje.getMonth() - meses);

    // Buscar todos os contratos ativos no período
    const contratos = await this.prisma.contrato.findMany({
      where: {
        OR: [
          { status: 'ATIVO' },
          {
            status: 'CONCLUIDO',
            updatedAt: {
              gte: dataInicio,
            },
          },
        ],
      },
      select: {
        monthlyAmount: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    // Agrupar por mês
    const receitaPorMes: Record<string, number> = {};

    for (let i = 0; i < meses; i++) {
      const data = new Date();
      data.setMonth(hoje.getMonth() - i);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      receitaPorMes[mesAno] = 0;
    }

    // Calcular receita por mês
    contratos.forEach((contrato) => {
      const inicio = new Date(contrato.startDate);
      const fim = new Date(contrato.endDate);

      for (let i = 0; i < meses; i++) {
        const data = new Date();
        data.setMonth(hoje.getMonth() - i);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

        // Verificar se o contrato estava ativo neste mês
        const primeiroDiaMes = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDiaMes = new Date(
          data.getFullYear(),
          data.getMonth() + 1,
          0,
        );

        if (inicio <= ultimoDiaMes && fim >= primeiroDiaMes) {
          receitaPorMes[mesAno] += Number(contrato.monthlyAmount);
        }
      }
    });

    // Converter para array ordenado
    return Object.entries(receitaPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, receita]) => ({
        mes,
        receita: Math.round(receita * 100) / 100,
      }));
  }

  async getDistribuicaoFrota() {
    const veiculosPorCategoria = await this.prisma.veiculo.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const veiculosPorStatus = await this.prisma.veiculo.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      porCategoria: veiculosPorCategoria.map((item) => ({
        categoria: item.category,
        quantidade: item._count.category,
      })),
      porStatus: veiculosPorStatus.map((item) => ({
        status: item.status,
        quantidade: item._count.status,
      })),
    };
  }
}
