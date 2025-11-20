import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';

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
}
