import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { RegistrarKmDto } from './dto/registrar-km.dto';

@Injectable()
export class VeiculosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.veiculo.findMany({
      include: {
        filial: {
          select: {
            id: true,
            name: true,
          },
        },
        contratos: {
          where: {
            status: 'ATIVO',
          },
          select: {
            id: true,
            contractNumber: true,
            status: true,
            motorista: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        plate: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: {
        filial: true,
        contratos: {
          include: {
            motorista: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
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
            startDate: 'desc',
          },
        },
      },
    });

    if (!veiculo) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return veiculo;
  }

  async findAlertasManutencao() {
    const limiarKm = 1000; // Alerta quando faltar 1000 km ou menos

    const veiculos = await this.prisma.veiculo.findMany({
      where: {
        active: true,
        nextMaintenanceKm: {
          not: null,
        },
      },
      include: {
        filial: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        nextMaintenanceKm: 'asc',
      },
    });

    // Filtrar veículos que precisam de manutenção em breve ou já passaram
    return veiculos
      .filter((v) => {
        if (!v.nextMaintenanceKm) return false;
        const kmRestantes = v.nextMaintenanceKm - v.km;
        return kmRestantes <= limiarKm;
      })
      .map((v) => ({
        ...v,
        kmRestantes: v.nextMaintenanceKm! - v.km,
        atrasado: v.km >= v.nextMaintenanceKm!,
      }));
  }

  async create(createVeiculoDto: CreateVeiculoDto) {
    // Verificar se placa já existe
    const existingPlate = await this.prisma.veiculo.findUnique({
      where: { plate: createVeiculoDto.plate },
    });

    if (existingPlate) {
      throw new ConflictException(
        `Veículo com placa ${createVeiculoDto.plate} já cadastrado`,
      );
    }

    // Verificar se renavam já existe (se fornecido)
    if (createVeiculoDto.renavam) {
      const existingRenavam = await this.prisma.veiculo.findUnique({
        where: { renavam: createVeiculoDto.renavam },
      });

      if (existingRenavam) {
        throw new ConflictException(
          `Veículo com Renavam ${createVeiculoDto.renavam} já cadastrado`,
        );
      }
    }

    // Verificar se chassi já existe (se fornecido)
    if (createVeiculoDto.chassi) {
      const existingChassi = await this.prisma.veiculo.findUnique({
        where: { chassi: createVeiculoDto.chassi },
      });

      if (existingChassi) {
        throw new ConflictException(
          `Veículo com chassi ${createVeiculoDto.chassi} já cadastrado`,
        );
      }
    }

    // Verificar se a filial existe
    if (createVeiculoDto.filialId) {
      const filial = await this.prisma.filial.findUnique({
        where: { id: createVeiculoDto.filialId },
      });

      if (!filial) {
        throw new BadRequestException(
          `Filial com ID ${createVeiculoDto.filialId} não encontrada`,
        );
      }
    }

    const { filialId, ...veiculoData } = createVeiculoDto;

    return this.prisma.veiculo.create({
      data: {
        ...veiculoData,
        filial: {
          connect: { id: filialId },
        },
      },
      include: {
        filial: true,
      },
    });
  }

  async update(id: string, updateVeiculoDto: UpdateVeiculoDto) {
    // Verificar se o veículo existe
    await this.findOne(id);

    // Se está atualizando placa, verificar se não existe outro veículo com essa placa
    if (updateVeiculoDto.plate) {
      const existingVeiculo = await this.prisma.veiculo.findFirst({
        where: {
          plate: updateVeiculoDto.plate,
          id: { not: id },
        },
      });

      if (existingVeiculo) {
        throw new ConflictException(
          `Outro veículo já possui a placa ${updateVeiculoDto.plate}`,
        );
      }
    }

    // Se está atualizando renavam, verificar unicidade
    if (updateVeiculoDto.renavam) {
      const existingVeiculo = await this.prisma.veiculo.findFirst({
        where: {
          renavam: updateVeiculoDto.renavam,
          id: { not: id },
        },
      });

      if (existingVeiculo) {
        throw new ConflictException(
          `Outro veículo já possui o Renavam ${updateVeiculoDto.renavam}`,
        );
      }
    }

    // Se está atualizando chassi, verificar unicidade
    if (updateVeiculoDto.chassi) {
      const existingVeiculo = await this.prisma.veiculo.findFirst({
        where: {
          chassi: updateVeiculoDto.chassi,
          id: { not: id },
        },
      });

      if (existingVeiculo) {
        throw new ConflictException(
          `Outro veículo já possui o chassi ${updateVeiculoDto.chassi}`,
        );
      }
    }

    // Verificar se filial existe (se fornecida)
    if (updateVeiculoDto.filialId) {
      const filial = await this.prisma.filial.findUnique({
        where: { id: updateVeiculoDto.filialId },
      });

      if (!filial) {
        throw new BadRequestException(
          `Filial com ID ${updateVeiculoDto.filialId} não encontrada`,
        );
      }
    }

    const { filialId, ...veiculoData } = updateVeiculoDto;

    return this.prisma.veiculo.update({
      where: { id },
      data: {
        ...veiculoData,
        ...(filialId && {
          filial: {
            connect: { id: filialId },
          },
        }),
      },
      include: {
        filial: true,
      },
    });
  }

  async remove(id: string) {
    // Verificar se o veículo existe
    await this.findOne(id);

    // Verificar se tem contratos ativos
    const contratosAtivos = await this.prisma.contrato.count({
      where: {
        veiculoId: id,
        status: 'ATIVO',
      },
    });

    if (contratosAtivos > 0) {
      throw new BadRequestException(
        `Não é possível excluir veículo com contratos ativos`,
      );
    }

    return this.prisma.veiculo.delete({
      where: { id },
    });
  }

  /**
   * Registrar KM semanal do veículo
   * Calcula automaticamente o KM rodado baseado no último registro
   */
  async registrarKm(
    veiculoId: string,
    registrarKmDto: RegistrarKmDto,
    userId?: string,
  ) {
    const { kmAtual, observacao } = registrarKmDto;

    // Verificar se veículo existe
    const veiculo = await this.findOne(veiculoId);

    // Buscar último registro de KM
    const ultimoRegistro = await this.prisma.historicoKm.findFirst({
      where: { veiculoId },
      orderBy: { dataRegistro: 'desc' },
    });

    // KM anterior: último registro OU KM inicial do contrato ativo OU KM atual do veículo
    let kmAnterior = veiculo.km;

    if (ultimoRegistro) {
      kmAnterior = ultimoRegistro.kmAtual;
    } else {
      // Se não tem histórico, verificar se tem contrato ativo
      const contratoAtivo = await this.prisma.contrato.findFirst({
        where: {
          veiculoId,
          status: 'ATIVO',
        },
        orderBy: {
          startDate: 'desc',
        },
      });

      if (contratoAtivo) {
        kmAnterior = contratoAtivo.kmStart;
      }
    }

    // Validar: KM atual não pode ser menor que anterior
    if (kmAtual < kmAnterior) {
      throw new BadRequestException(
        `KM atual (${kmAtual}) não pode ser menor que o KM anterior (${kmAnterior})`,
      );
    }

    const kmRodado = kmAtual - kmAnterior;

    // Buscar contrato ativo (se houver)
    const contratoAtivo = await this.prisma.contrato.findFirst({
      where: {
        veiculoId,
        status: 'ATIVO',
      },
    });

    // Criar registro no histórico
    const historico = await this.prisma.historicoKm.create({
      data: {
        veiculoId,
        contratoId: contratoAtivo?.id,
        kmAtual,
        kmAnterior,
        kmRodado,
        registradoPor: userId,
        observacao,
      },
      include: {
        veiculo: {
          select: {
            plate: true,
            brand: true,
            model: true,
          },
        },
        contrato: {
          select: {
            contractNumber: true,
            motorista: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Atualizar KM atual do veículo
    await this.prisma.veiculo.update({
      where: { id: veiculoId },
      data: { km: kmAtual },
    });

    return historico;
  }

  /**
   * Buscar histórico de KM de um veículo
   */
  async getHistoricoKm(veiculoId: string) {
    await this.findOne(veiculoId); // Verificar se existe

    return this.prisma.historicoKm.findMany({
      where: { veiculoId },
      include: {
        contrato: {
          select: {
            contractNumber: true,
            motorista: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataRegistro: 'desc',
      },
    });
  }

  /**
   * Obter KM rodado na última semana
   */
  async getKmSemanaAtual(veiculoId: string) {
    await this.findOne(veiculoId); // Verificar se existe

    const ultimoRegistro = await this.prisma.historicoKm.findFirst({
      where: { veiculoId },
      orderBy: { dataRegistro: 'desc' },
    });

    if (!ultimoRegistro) {
      return {
        kmRodadoSemana: 0,
        ultimoRegistro: null,
      };
    }

    return {
      kmRodadoSemana: ultimoRegistro.kmRodado,
      ultimoRegistro: {
        kmAtual: ultimoRegistro.kmAtual,
        kmAnterior: ultimoRegistro.kmAnterior,
        dataRegistro: ultimoRegistro.dataRegistro,
      },
    };
  }
}
