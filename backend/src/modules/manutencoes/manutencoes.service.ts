import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { MaintenanceStatus } from '../../common/enums';

@Injectable()
export class ManutencoesService {
  constructor(private prisma: PrismaService) {}

  async create(createManutencaoDto: CreateManutencaoDto) {
    // Validar se o veículo existe
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: createManutencaoDto.veiculoId },
    });

    if (!veiculo) {
      throw new NotFoundException(
        `Veículo com ID ${createManutencaoDto.veiculoId} não encontrado`,
      );
    }

    // Criar manutenção com status padrão AGENDADA se não fornecido
    const manutencao = await this.prisma['manutencao'].create({
      data: {
        ...createManutencaoDto,
        status: createManutencaoDto.status || MaintenanceStatus.AGENDADA,
        date: new Date(createManutencaoDto.date),
      },
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
          },
        },
      },
    });

    return manutencao;
  }

  async findAll(veiculoId?: string, status?: MaintenanceStatus) {
    const where: { veiculoId?: string; status?: MaintenanceStatus } = {};

    if (veiculoId) {
      where.veiculoId = veiculoId;
    }

    if (status) {
      where.status = status;
    }

    const manutencoes = await this.prisma['manutencao'].findMany({
      where,
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return manutencoes;
  }

  async findOne(id: string) {
    const manutencao = await this.prisma['manutencao'].findUnique({
      where: { id },
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
            status: true,
          },
        },
      },
    });

    if (!manutencao) {
      throw new NotFoundException(`Manutenção com ID ${id} não encontrada`);
    }

    return manutencao;
  }

  async update(id: string, updateManutencaoDto: UpdateManutencaoDto) {
    // Verificar se a manutenção existe
    const manutencaoExistente = await this.findOne(id);

    // Cast para ter acesso às propriedades opcionais do PartialType
    const dto = updateManutencaoDto as Partial<CreateManutencaoDto>;

    // Se mudou o veiculoId, validar se o novo veículo existe
    if (dto.veiculoId) {
      const veiculo = await this.prisma.veiculo.findUnique({
        where: { id: dto.veiculoId },
      });

      if (!veiculo) {
        throw new NotFoundException(
          `Veículo com ID ${dto.veiculoId} não encontrado`,
        );
      }
    }

    const dataToUpdate: Record<string, unknown> = { ...updateManutencaoDto };
    if (dto.date) {
      dataToUpdate.date = new Date(dto.date);
    }

    const manutencao = await this.prisma['manutencao'].update({
      where: { id },
      data: dataToUpdate,
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
          },
        },
      },
    });

    // Se a manutenção foi CONCLUIDA e é PREVENTIVA, atualizar nextMaintenanceKm do veículo
    const statusAtualizado = dto.status || manutencaoExistente.status;
    const tipoAtualizado = dto.type || manutencaoExistente.type;
    const quilometragemAtualizada = dto.mileage ?? manutencaoExistente.mileage;

    if (statusAtualizado === 'CONCLUIDA' && tipoAtualizado === 'PREVENTIVA') {
      const intervaloKm = 10000;
      const proximaManutencaoKm = quilometragemAtualizada + intervaloKm;

      const updateData: Record<string, unknown> = {
        lastMaintenance: manutencao.date,
        nextMaintenanceKm: proximaManutencaoKm,
      };

      await this.prisma.veiculo.update({
        where: { id: manutencao.veiculoId },
        data: updateData,
      });
    }

    return manutencao;
  }

  async remove(id: string) {
    // Verificar se a manutenção existe
    await this.findOne(id);

    const manutencao = await this.prisma['manutencao'].delete({
      where: { id },
    });

    return manutencao;
  }

  async getHistoricoByVeiculo(veiculoId: string) {
    // Verificar se o veículo existe
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: veiculoId },
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    const historico = await this.prisma['manutencao'].findMany({
      where: { veiculoId },
      orderBy: {
        date: 'desc',
      },
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
          },
        },
      },
    });

    // Calcular estatísticas
    const totalCost = historico.reduce((sum, m) => sum + Number(m.cost), 0);
    const totalManutencoes = historico.length;
    const byType = historico.reduce(
      (acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      veiculo: {
        id: veiculo.id,
        plate: veiculo.plate,
        brand: veiculo.brand,
        model: veiculo.model,
        mileage: veiculo.km,
      },
      stats: {
        totalCost,
        totalManutencoes,
        byType,
      },
      historico,
    };
  }

  async getVeiculosComManutencaoPendente() {
    const manutencoesPendentes = await this.prisma['manutencao'].findMany({
      where: {
        status: {
          in: [MaintenanceStatus.AGENDADA, MaintenanceStatus.EM_ANDAMENTO],
        },
      },
      include: {
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
            km: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por veículo
    const veiculosMap = new Map<
      string,
      {
        veiculo: {
          id: string;
          plate: string;
          brand: string;
          model: string;
          year: number;
          category: string;
          km: number;
          status: string;
        };
        manutencoesPendentes: Array<{
          id: string;
          type: string;
          description: string;
          date: Date;
          status: string;
          cost: number;
          provider: string;
        }>;
      }
    >();

    for (const manutencao of manutencoesPendentes) {
      const veiculoId = manutencao.veiculoId;

      if (!veiculosMap.has(veiculoId)) {
        veiculosMap.set(veiculoId, {
          veiculo: manutencao.veiculo,
          manutencoesPendentes: [],
        });
      }

      const veiculoData = veiculosMap.get(veiculoId);
      if (veiculoData) {
        veiculoData.manutencoesPendentes.push({
          id: manutencao.id,
          type: manutencao.type,
          description: manutencao.description,
          date: manutencao.date,
          status: manutencao.status,
          cost: Number(manutencao.cost),
          provider: manutencao.provider,
        });
      }
    }

    return Array.from(veiculosMap.values());
  }

  async calcularProximaManutencaoPreventiva(veiculoId: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: veiculoId },
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${veiculoId} não encontrado`);
    }

    // Buscar última manutenção preventiva
    const ultimaPreventiva = await this.prisma['manutencao'].findFirst({
      where: {
        veiculoId,
        type: 'PREVENTIVA',
        status: 'CONCLUIDA',
      },
      orderBy: {
        mileage: 'desc',
      },
    });

    // Intervalo padrão de 10.000 km para manutenção preventiva
    const intervaloKm = 10000;
    const quilometragemAtual = veiculo.km;

    let proximaManutencaoKm: number;
    let kmRestantes: number;

    if (ultimaPreventiva) {
      proximaManutencaoKm = ultimaPreventiva.mileage + intervaloKm;
      kmRestantes = proximaManutencaoKm - quilometragemAtual;
    } else {
      // Se nunca teve preventiva, calcular baseado na km atual
      proximaManutencaoKm =
        Math.ceil(quilometragemAtual / intervaloKm) * intervaloKm;
      kmRestantes = proximaManutencaoKm - quilometragemAtual;
    }

    const necessitaManutencao = kmRestantes <= 1000; // Alerta se faltam menos de 1000 km

    return {
      veiculo: {
        id: veiculo.id,
        plate: veiculo.plate,
        brand: veiculo.brand,
        model: veiculo.model,
        quilometragemAtual,
      },
      ultimaPreventiva: ultimaPreventiva
        ? {
            date: ultimaPreventiva.date,
            mileage: ultimaPreventiva.mileage,
          }
        : null,
      proximaManutencaoKm,
      kmRestantes,
      necessitaManutencao,
    };
  }
}
