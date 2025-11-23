import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MotoristaPagamentosService {
  constructor(private prisma: PrismaService) {}

  async getPagamentos(motoristaId: string) {
    // Buscar todos os contratos do motorista
    const contratos = await this.prisma.contrato.findMany({
      where: { motoristaId },
      select: { id: true },
    });

    const contratoIds = contratos.map((c) => c.id);

    // Buscar todas as cobranças dos contratos
    const cobrancas = await this.prisma.cobranca.findMany({
      where: {
        contratoId: { in: contratoIds },
      },
      include: {
        contrato: {
          include: {
            veiculo: {
              select: {
                brand: true,
                model: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return cobrancas.map((cobranca) => ({
      id: cobranca.id,
      amount: Number(cobranca.amount),
      dueDate: cobranca.dueDate,
      status: cobranca.status,
      paymentMethod: cobranca.paymentMethod,
      contratoId: cobranca.contratoId,
      contrato: {
        contractNumber: cobranca.contrato.contractNumber,
        veiculo: cobranca.contrato.veiculo,
      },
    }));
  }
}
