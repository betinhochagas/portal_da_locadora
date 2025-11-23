import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MotoristaContratosService {
  constructor(private prisma: PrismaService) {}

  async getContratos(motoristaId: string) {
    const contratos = await this.prisma.contrato.findMany({
      where: { motoristaId },
      include: {
        veiculo: {
          select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            year: true,
          },
        },
        plano: {
          select: {
            id: true,
            name: true,
            weeklyPrice: true,
          },
        },
        filial: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contratos.map((contrato) => ({
      id: contrato.id,
      contractNumber: contrato.contractNumber,
      status: contrato.status,
      startDate: contrato.startDate,
      endDate: contrato.endDate,
      veiculo: {
        brand: contrato.veiculo.brand,
        model: contrato.veiculo.model,
        plate: contrato.veiculo.plate,
        year: contrato.veiculo.year,
      },
      plano: {
        name: contrato.plano.name,
        weeklyValue: Number(contrato.plano.weeklyPrice || 0),
      },
      filial: {
        name: contrato.filial.name,
        phone: contrato.filial.phone,
        address: contrato.filial.address,
      },
    }));
  }

  async getContrato(motoristaId: string, contratoId: string) {
    const contrato = await this.prisma.contrato.findFirst({
      where: {
        id: contratoId,
        motoristaId,
      },
      include: {
        veiculo: true,
        plano: true,
        filial: true,
        cobrancas: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!contrato) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return {
      ...contrato,
      veiculo: {
        ...contrato.veiculo,
      },
      plano: {
        ...contrato.plano,
        weeklyValue: Number(contrato.plano.weeklyPrice || 0),
        dailyPrice: Number(contrato.plano.dailyPrice),
        monthlyPrice: Number(contrato.plano.monthlyPrice),
      },
      cobrancas: contrato.cobrancas.map((c) => ({
        ...c,
        amount: Number(c.amount),
      })),
    };
  }
}
