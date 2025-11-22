import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ChangeVehicleDto } from './dto/change-vehicle.dto';

@Injectable()
export class ContratosService {
  constructor(private prisma: PrismaService) {}

  async create(createContratoDto: CreateContratoDto) {
    // Validação 1: Verificar se número do contrato já existe
    const existingContract = await this.prisma.contrato.findUnique({
      where: { contractNumber: createContratoDto.contractNumber },
    });

    if (existingContract) {
      throw new ConflictException(
        'Número do contrato já existe. Por favor, use outro número.',
      );
    }

    // Validação 2: Verificar se o motorista existe e está ativo
    const motorista = await this.prisma.motorista.findUnique({
      where: { id: createContratoDto.motoristaId },
    });

    if (!motorista) {
      throw new NotFoundException('Motorista não encontrado');
    }

    if (!motorista.active) {
      throw new BadRequestException('Motorista está inativo');
    }

    if (motorista.blacklisted) {
      throw new BadRequestException(
        `Motorista está na blacklist: ${motorista.blacklistReason || 'Motivo não informado'}`,
      );
    }

    // Validação 3: Verificar se o veículo existe e está disponível
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: createContratoDto.veiculoId },
    });

    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (veiculo.status !== 'DISPONIVEL') {
      throw new BadRequestException(
        `Veículo não está disponível. Status atual: ${veiculo.status}`,
      );
    }

    // Validação 4: Verificar se o plano existe e está ativo
    const plano = await this.prisma.plano.findUnique({
      where: { id: createContratoDto.planoId },
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!plano.active) {
      throw new BadRequestException('Plano está inativo');
    }

    // Validação 5: Verificar se a categoria do veículo é permitida no plano
    if (!plano.allowedCategories.includes(veiculo.category)) {
      throw new BadRequestException(
        `Veículo da categoria ${veiculo.category} não é permitido neste plano. Categorias aceitas: ${plano.allowedCategories.join(', ')}`,
      );
    }

    // Validação 6: Verificar se a filial existe
    const filial = await this.prisma.filial.findUnique({
      where: { id: createContratoDto.filialId },
    });

    if (!filial) {
      throw new NotFoundException('Filial não encontrada');
    }

    // Validação 7: Verificar datas
    const startDate = new Date(createContratoDto.startDate);
    const endDate = new Date(createContratoDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Data de término deve ser posterior à data de início',
      );
    }

    // Validação 8: Verificar se o veículo já tem contrato ativo
    const activeContract = await this.prisma.contrato.findFirst({
      where: {
        veiculoId: createContratoDto.veiculoId,
        status: 'ATIVO',
      },
    });

    if (activeContract) {
      throw new ConflictException(
        'Veículo já possui um contrato ativo. Finalize ou cancele o contrato anterior.',
      );
    }

    // Criar contrato
    const contrato = await this.prisma.contrato.create({
      data: {
        ...createContratoDto,
        monthlyAmount: createContratoDto.monthlyAmount.toString(),
        deposit: createContratoDto.deposit?.toString(),
        status: 'RASCUNHO', // Sempre começa como rascunho
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return contrato;
  }

  async findAll() {
    const contratos = await this.prisma.contrato.findMany({
      include: {
        motorista: {
          select: {
            id: true,
            name: true,
            cpf: true,
            cnpj: true,
            phone: true,
          },
        },
        veiculo: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            category: true,
          },
        },
        plano: {
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
          },
        },
        filial: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contratos;
  }

  async findOne(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    if (!contrato) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contrato;
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    const contrato = await this.findOne(id);

    // Se está mudando o veículo, validar disponibilidade
    if (
      updateContratoDto.veiculoId &&
      updateContratoDto.veiculoId !== contrato.veiculoId
    ) {
      const veiculo = await this.prisma.veiculo.findUnique({
        where: { id: updateContratoDto.veiculoId },
      });

      if (!veiculo || veiculo.status !== 'DISPONIVEL') {
        throw new BadRequestException('Veículo não está disponível');
      }
    }

    // Se está mudando o plano, validar compatibilidade
    if (
      updateContratoDto.planoId &&
      updateContratoDto.planoId !== contrato.planoId
    ) {
      const plano = await this.prisma.plano.findUnique({
        where: { id: updateContratoDto.planoId },
      });

      if (!plano || !plano.active) {
        throw new BadRequestException('Plano não está ativo');
      }
    }

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        ...updateContratoDto,
        monthlyAmount: updateContratoDto.monthlyAmount?.toString(),
        deposit: updateContratoDto.deposit?.toString(),
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  async remove(id: string) {
    const contrato = await this.findOne(id);

    // Não permitir exclusão de contratos ativos
    if (contrato.status === 'ATIVO') {
      throw new BadRequestException(
        'Não é possível excluir um contrato ativo. Cancele-o primeiro.',
      );
    }

    await this.prisma.contrato.delete({
      where: { id },
    });

    return { message: 'Contrato removido com sucesso' };
  }

  // Ativar contrato (de RASCUNHO → ATIVO)
  async activateContract(id: string) {
    const contrato = await this.findOne(id);

    if (contrato.status !== 'RASCUNHO') {
      throw new BadRequestException(
        'Apenas contratos em rascunho podem ser ativados',
      );
    }

    // Atualizar status do veículo para LOCADO
    await this.prisma.veiculo.update({
      where: { id: contrato.veiculoId },
      data: { status: 'LOCADO' },
    });

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        status: 'ATIVO',
        signedAt: new Date(),
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  // Suspender contrato
  async suspendContract(id: string, reason: string) {
    const contrato = await this.findOne(id);

    if (contrato.status !== 'ATIVO') {
      throw new BadRequestException(
        'Apenas contratos ativos podem ser suspensos',
      );
    }

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        status: 'SUSPENSO',
        notes: `${contrato.notes || ''}\n[${new Date().toISOString()}] SUSPENSO: ${reason}`,
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  // Reativar contrato suspenso
  async reactivateContract(id: string) {
    const contrato = await this.findOne(id);

    if (contrato.status !== 'SUSPENSO') {
      throw new BadRequestException(
        'Apenas contratos suspensos podem ser reativados',
      );
    }

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        status: 'ATIVO',
        notes: `${contrato.notes || ''}\n[${new Date().toISOString()}] REATIVADO`,
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  // Cancelar contrato
  async cancelContract(id: string, reason: string) {
    const contrato = await this.findOne(id);

    if (!['ATIVO', 'SUSPENSO', 'RASCUNHO'].includes(contrato.status)) {
      throw new BadRequestException(
        'Apenas contratos ativos, suspensos ou em rascunho podem ser cancelados',
      );
    }

    // Se estava ativo, liberar o veículo
    if (contrato.status === 'ATIVO') {
      await this.prisma.veiculo.update({
        where: { id: contrato.veiculoId },
        data: { status: 'DISPONIVEL' },
      });
    }

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        canceledAt: new Date(),
        cancelReason: reason,
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  // Concluir contrato
  async completeContract(id: string) {
    const contrato = await this.findOne(id);

    if (contrato.status !== 'ATIVO') {
      throw new BadRequestException(
        'Apenas contratos ativos podem ser concluídos',
      );
    }

    // Liberar o veículo
    await this.prisma.veiculo.update({
      where: { id: contrato.veiculoId },
      data: { status: 'DISPONIVEL' },
    });

    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        status: 'CONCLUIDO',
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }

  // Trocar veículo dentro do mesmo contrato
  async changeVehicle(id: string, changeVehicleDto: ChangeVehicleDto) {
    const contrato = await this.findOne(id);

    if (contrato.status !== 'ATIVO') {
      throw new BadRequestException(
        'Apenas contratos ativos podem ter troca de veículo',
      );
    }

    // Validar novo veículo
    const newVeiculo = await this.prisma.veiculo.findUnique({
      where: { id: changeVehicleDto.newVeiculoId },
    });

    if (!newVeiculo) {
      throw new NotFoundException('Novo veículo não encontrado');
    }

    if (newVeiculo.status !== 'DISPONIVEL') {
      throw new BadRequestException('Novo veículo não está disponível');
    }

    // Verificar compatibilidade com o plano
    const plano = await this.prisma.plano.findUnique({
      where: { id: contrato.planoId },
    });

    if (!plano) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!plano.allowedCategories.includes(newVeiculo.category)) {
      throw new BadRequestException(
        `Novo veículo da categoria ${newVeiculo.category} não é compatível com o plano`,
      );
    }

    // Liberar veículo antigo
    await this.prisma.veiculo.update({
      where: { id: contrato.veiculoId },
      data: { status: 'DISPONIVEL' },
    });

    // Alocar novo veículo
    await this.prisma.veiculo.update({
      where: { id: changeVehicleDto.newVeiculoId },
      data: { status: 'LOCADO' },
    });

    // Atualizar contrato
    const updated = await this.prisma.contrato.update({
      where: { id },
      data: {
        veiculoId: changeVehicleDto.newVeiculoId,
        notes: `${contrato.notes || ''}\n[${new Date().toISOString()}] TROCA DE VEÍCULO: ${changeVehicleDto.reason}`,
      },
      include: {
        motorista: true,
        veiculo: true,
        plano: true,
        filial: true,
      },
    });

    return updated;
  }
}
