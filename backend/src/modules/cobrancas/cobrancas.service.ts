import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class CobrancasService {
  constructor(private prisma: PrismaService) {}

  async create(createCobrancaDto: CreateCobrancaDto) {
    // Validar se o contrato existe e está ativo
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: createCobrancaDto.contratoId },
    });

    if (!contrato) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (contrato.status !== 'ATIVO') {
      throw new BadRequestException(
        'Apenas contratos ativos podem ter cobranças',
      );
    }

    // Verificar se já existe cobrança para este mês
    const existing = await this.prisma.cobranca.findUnique({
      where: {
        contratoId_referenceMonth: {
          contratoId: createCobrancaDto.contratoId,
          referenceMonth: createCobrancaDto.referenceMonth,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe uma cobrança para o mês ${createCobrancaDto.referenceMonth}`,
      );
    }

    return this.prisma.cobranca.create({
      data: {
        ...createCobrancaDto,
        amount: createCobrancaDto.amount,
      },
      include: {
        contrato: {
          include: {
            motorista: true,
            veiculo: true,
            plano: true,
          },
        },
      },
    });
  }

  async findAll(contratoId?: string, status?: string) {
    const where: {
      contratoId?: string;
      status?: PaymentStatus;
    } = {};

    if (contratoId) {
      where.contratoId = contratoId;
    }

    if (status) {
      where.status = status as PaymentStatus;
    }

    return this.prisma.cobranca.findMany({
      where,
      include: {
        contrato: {
          include: {
            motorista: {
              select: {
                id: true,
                name: true,
                phone: true,
                cpf: true,
                cnpj: true,
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
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const cobranca = await this.prisma.cobranca.findUnique({
      where: { id },
      include: {
        contrato: {
          include: {
            motorista: true,
            veiculo: true,
            plano: true,
            filial: true,
          },
        },
      },
    });

    if (!cobranca) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    return cobranca;
  }

  async update(id: string, updateCobrancaDto: UpdateCobrancaDto) {
    const cobranca = await this.findOne(id);

    // Não permitir editar cobranças pagas
    if (
      cobranca.status === 'PAGA' &&
      updateCobrancaDto.status !== undefined &&
      String(updateCobrancaDto.status) !== 'PAGA'
    ) {
      throw new BadRequestException(
        'Não é possível alterar uma cobrança já paga',
      );
    }

    return this.prisma.cobranca.update({
      where: { id },
      data: updateCobrancaDto,
      include: {
        contrato: {
          include: {
            motorista: true,
            veiculo: true,
            plano: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const cobranca = await this.findOne(id);

    // Não permitir excluir cobranças pagas
    if (cobranca.status === 'PAGA') {
      throw new BadRequestException(
        'Não é possível excluir uma cobrança já paga',
      );
    }

    return this.prisma.cobranca.delete({
      where: { id },
    });
  }

  async registrarPagamento(id: string, dto: RegistrarPagamentoDto) {
    const cobranca = await this.findOne(id);

    if (cobranca.status === 'PAGA') {
      throw new BadRequestException('Esta cobrança já foi paga');
    }

    if (cobranca.status === 'CANCELADA') {
      throw new BadRequestException(
        'Não é possível registrar pagamento de cobrança cancelada',
      );
    }

    // Calcular dias de atraso
    const paymentDate = new Date(dto.paymentDate);
    const dueDate = new Date(cobranca.dueDate);
    const daysLate = Math.max(
      0,
      Math.floor(
        (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    return this.prisma.cobranca.update({
      where: { id },
      data: {
        status: 'PAGA',
        paymentDate: dto.paymentDate,
        paymentMethod: dto.paymentMethod,
        daysLate,
        lateFee: dto.lateFee || 0,
        observations: dto.observations || cobranca.observations,
      },
      include: {
        contrato: {
          include: {
            motorista: true,
            veiculo: true,
            plano: true,
          },
        },
      },
    });
  }

  async gerarCobrancasMensais() {
    // Buscar todos os contratos ativos
    const contratosAtivos = await this.prisma.contrato.findMany({
      where: { status: 'ATIVO' },
      include: {
        motorista: true,
        plano: true,
      },
    });

    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const cobrancasCriadas: Array<{
      id: string;
      contratoId: string;
      referenceMonth: string;
      dueDate: Date;
      amount: number;
      status: string;
    }> = [];

    for (const contrato of contratosAtivos) {
      // Verificar se já existe cobrança para este mês
      const existing = await this.prisma.cobranca.findUnique({
        where: {
          contratoId_referenceMonth: {
            contratoId: contrato.id,
            referenceMonth: mesAtual,
          },
        },
      });

      if (!existing) {
        // Calcular data de vencimento (dia do vencimento do contrato)
        const dueDate = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          contrato.billingDay,
        );

        // Criar cobrança
        const cobranca = await this.prisma.cobranca.create({
          data: {
            contratoId: contrato.id,
            referenceMonth: mesAtual,
            dueDate,
            amount: contrato.monthlyAmount,
            status: 'PENDENTE',
          },
        });

        cobrancasCriadas.push({
          id: cobranca.id,
          contratoId: cobranca.contratoId,
          referenceMonth: cobranca.referenceMonth,
          dueDate: cobranca.dueDate,
          amount: Number(cobranca.amount),
          status: cobranca.status,
        });
      }
    }

    return {
      message: `${cobrancasCriadas.length} cobrança(s) gerada(s) para o mês ${mesAtual}`,
      cobrancas: cobrancasCriadas,
    };
  }

  async atualizarStatusAtrasadas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atrasadas = await this.prisma.cobranca.updateMany({
      where: {
        status: 'PENDENTE',
        dueDate: {
          lt: hoje,
        },
      },
      data: {
        status: 'ATRASADA',
      },
    });

    return {
      message: `${atrasadas.count} cobrança(s) marcada(s) como atrasada(s)`,
    };
  }

  async getInadimplentes() {
    return this.prisma.cobranca.findMany({
      where: {
        status: 'ATRASADA',
      },
      include: {
        contrato: {
          include: {
            motorista: {
              select: {
                id: true,
                name: true,
                phone: true,
                cpf: true,
                cnpj: true,
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
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
