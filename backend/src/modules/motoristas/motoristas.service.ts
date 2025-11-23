import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class MotoristasService {
  constructor(private prisma: PrismaService) {}

  // Gera senha aleatória de 8 caracteres (letras e números)
  private gerarSenhaAleatoria(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return senha;
  }

  async findAll() {
    return this.prisma.motorista.findMany({
      include: {
        contratos: {
          where: {
            status: {
              in: [
                ContractStatus.ANALISE,
                ContractStatus.ATIVO,
                ContractStatus.SUSPENSO,
              ], // Não retorna contratos CONCLUIDOS ou CANCELADOS
            },
          },
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
          where: {
            status: {
              in: [
                ContractStatus.ANALISE,
                ContractStatus.ATIVO,
                ContractStatus.SUSPENSO,
              ], // Não retorna contratos CONCLUIDOS ou CANCELADOS
            },
          },
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

    // Gera senha aleatória
    const senhaGerada = this.gerarSenhaAleatoria();
    const passwordHash = await bcrypt.hash(senhaGerada, 10);

    const motorista = await this.prisma.motorista.create({
      data: {
        ...createMotoristaDto,
        password: passwordHash,
        passwordReset: true, // Força troca no primeiro login
      },
    });

    // TODO: Enviar email com credenciais
    // await this.mailService.enviarCredenciaisAcesso(
    //   motorista.email,
    //   motorista.name,
    //   motorista.cpf,
    //   senhaGerada,
    // );

    // Retorna motorista + senha gerada (para exibir ao admin)
    return {
      ...motorista,
      senhaGerada, // IMPORTANTE: Senha só é retornada nesta criação
    };
  }

  async resetPassword(id: string) {
    // Verificar se motorista existe
    await this.findOne(id);

    // Gera nova senha aleatória
    const novaSenhaGerada = this.gerarSenhaAleatoria();
    const passwordHash = await bcrypt.hash(novaSenhaGerada, 10);

    // Atualiza motorista
    await this.prisma.motorista.update({
      where: { id },
      data: {
        password: passwordHash,
        passwordReset: true, // Força troca no primeiro login
        loginAttempts: 0, // Reseta tentativas
        lockedUntil: null, // Remove bloqueio
      },
    });

    // TODO: Enviar email com nova senha
    // await this.mailService.enviarNovaCredencial(
    //   motorista.email,
    //   motorista.name,
    //   motorista.cpf,
    //   novaSenhaGerada,
    // );

    return {
      message: 'Nova senha gerada com sucesso',
      senhaGerada: novaSenhaGerada, // Retorna senha para admin visualizar
    };
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
