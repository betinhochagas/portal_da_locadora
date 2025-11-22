import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';

@Injectable()
export class MotoristasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.motorista.findMany({
      include: {
        contratos: {
          select: {
            id: true,
            contractNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const motorista = await this.prisma.motorista.findUnique({
      where: { id },
      include: {
        contratos: {
          include: {
            veiculo: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
                km: true,
              },
            },
            plano: {
              select: {
                id: true,
                name: true,
              },
            },
            cobrancas: {
              select: {
                id: true,
                dueDate: true,
                status: true,
              },
              orderBy: {
                dueDate: 'asc',
              },
            },
          },
        },
      },
    });

    if (!motorista) {
      throw new NotFoundException(`Motorista com ID ${id} não encontrado`);
    }

    return motorista;
  }

  async create(createMotoristaDto: CreateMotoristaDto) {
    // Verificar se CPF/CNPJ já existe
    if (createMotoristaDto.cpf) {
      const existingByCpf = await this.prisma.motorista.findUnique({
        where: { cpf: createMotoristaDto.cpf },
      });
      if (existingByCpf) {
        throw new ConflictException(
          `Motorista com CPF ${createMotoristaDto.cpf} já cadastrado`,
        );
      }
    }

    if (createMotoristaDto.cnpj) {
      const existingByCnpj = await this.prisma.motorista.findUnique({
        where: { cnpj: createMotoristaDto.cnpj },
      });
      if (existingByCnpj) {
        throw new ConflictException(
          `Motorista com CNPJ ${createMotoristaDto.cnpj} já cadastrado`,
        );
      }
    }

    return this.prisma.motorista.create({
      data: createMotoristaDto,
    });
  }

  async update(id: string, updateMotoristaDto: UpdateMotoristaDto) {
    // Verificar se o motorista existe
    await this.findOne(id);

    // Se está atualizando CPF, verificar se não existe outro motorista com esse CPF
    if (updateMotoristaDto.cpf) {
      const existingMotorista = await this.prisma.motorista.findFirst({
        where: {
          cpf: updateMotoristaDto.cpf,
          id: { not: id },
        },
      });

      if (existingMotorista) {
        throw new ConflictException(
          `Outro motorista já possui o CPF ${updateMotoristaDto.cpf}`,
        );
      }
    }

    // Se está atualizando CNPJ, verificar se não existe outro motorista com esse CNPJ
    if (updateMotoristaDto.cnpj) {
      const existingMotorista = await this.prisma.motorista.findFirst({
        where: {
          cnpj: updateMotoristaDto.cnpj,
          id: { not: id },
        },
      });

      if (existingMotorista) {
        throw new ConflictException(
          `Outro motorista já possui o CNPJ ${updateMotoristaDto.cnpj}`,
        );
      }
    }

    return this.prisma.motorista.update({
      where: { id },
      data: updateMotoristaDto,
    });
  }

  async remove(id: string) {
    // Verificar se o motorista existe
    await this.findOne(id);

    // Verificar se tem contratos ativos
    const contratosAtivos = await this.prisma.contrato.count({
      where: {
        motoristaId: id,
        status: 'ATIVO',
      },
    });

    if (contratosAtivos > 0) {
      throw new BadRequestException(
        `Não é possível excluir motorista com contratos ativos`,
      );
    }

    return this.prisma.motorista.delete({
      where: { id },
    });
  }
}
