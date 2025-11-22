import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos os planos
   */
  async findAll() {
    return this.prisma.plano.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { contratos: true },
        },
      },
    });
  }

  /**
   * Busca um plano por ID
   */
  async findOne(id: string) {
    const plano = await this.prisma.plano.findUnique({
      where: { id },
      include: {
        contratos: {
          include: {
            motorista: {
              select: { id: true, name: true, cpf: true, cnpj: true },
            },
            veiculo: {
              select: { id: true, plate: true, brand: true, model: true },
            },
          },
        },
      },
    });

    if (!plano) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado`);
    }

    return plano;
  }

  /**
   * Cria um novo plano
   */
  async create(createPlanoDto: CreatePlanoDto) {
    // Validar se já existe plano com mesmo nome
    const existingPlano = await this.prisma.plano.findFirst({
      where: { name: createPlanoDto.name },
    });

    if (existingPlano) {
      throw new ConflictException(
        `Já existe um plano com o nome "${createPlanoDto.name}"`,
      );
    }

    // Validar lógica de preços (mensal deve ser menor que 30x diária)
    const dailyPriceNumber = Number(createPlanoDto.dailyPrice);
    const monthlyPriceNumber = Number(createPlanoDto.monthlyPrice);

    if (monthlyPriceNumber >= dailyPriceNumber * 30) {
      throw new BadRequestException(
        'Preço mensal deve ser mais vantajoso que 30 diárias',
      );
    }

    // Validar weeklyPrice se informado
    if (createPlanoDto.weeklyPrice) {
      const weeklyPriceNumber = Number(createPlanoDto.weeklyPrice);
      if (weeklyPriceNumber >= dailyPriceNumber * 7) {
        throw new BadRequestException(
          'Preço semanal deve ser mais vantajoso que 7 diárias',
        );
      }
    }

    // Validar kmExtraPrice se kmIncluded foi informado
    if (
      createPlanoDto.kmIncluded !== null &&
      createPlanoDto.kmIncluded !== undefined &&
      !createPlanoDto.kmExtraPrice
    ) {
      throw new BadRequestException(
        'Informe o valor por KM excedente quando houver limite de KM',
      );
    }

    return this.prisma.plano.create({
      data: {
        ...createPlanoDto,
      },
    });
  }

  /**
   * Atualiza um plano
   */
  async update(id: string, updatePlanoDto: UpdatePlanoDto) {
    // Verificar se plano existe
    await this.findOne(id);

    // Validar se nome está sendo alterado e se já existe outro plano com mesmo nome
    if (updatePlanoDto.name) {
      const existingPlano = await this.prisma.plano.findFirst({
        where: {
          name: updatePlanoDto.name,
          NOT: { id },
        },
      });

      if (existingPlano) {
        throw new ConflictException(
          `Já existe outro plano com o nome "${updatePlanoDto.name}"`,
        );
      }
    }

    // Validar lógica de preços se algum preço foi alterado
    const planoAtual = await this.prisma.plano.findUnique({ where: { id } });

    const dailyPrice = Number(
      updatePlanoDto.dailyPrice ?? planoAtual?.dailyPrice,
    );
    const monthlyPrice = Number(
      updatePlanoDto.monthlyPrice ?? planoAtual?.monthlyPrice,
    );

    if (monthlyPrice >= dailyPrice * 30) {
      throw new BadRequestException(
        'Preço mensal deve ser mais vantajoso que 30 diárias',
      );
    }

    if (updatePlanoDto.weeklyPrice !== undefined) {
      const weeklyPrice = Number(updatePlanoDto.weeklyPrice);
      if (weeklyPrice && weeklyPrice >= dailyPrice * 7) {
        throw new BadRequestException(
          'Preço semanal deve ser mais vantajoso que 7 diárias',
        );
      }
    }

    return this.prisma.plano.update({
      where: { id },
      data: updatePlanoDto,
    });
  }

  /**
   * Remove um plano (soft delete - apenas marca como inativo)
   */
  async remove(id: string) {
    // Verificar se plano existe
    await this.findOne(id);

    // Verificar se há contratos ATIVOS vinculados
    const contratosAtivos = await this.prisma.contrato.count({
      where: {
        planoId: id,
        status: 'ATIVO',
      },
    });

    if (contratosAtivos > 0) {
      throw new BadRequestException(
        `Não é possível excluir este plano pois existem ${contratosAtivos} contrato(s) ativo(s) vinculado(s)`,
      );
    }

    // Soft delete - apenas marca como inativo
    return this.prisma.plano.update({
      where: { id },
      data: { active: false },
    });
  }
}
