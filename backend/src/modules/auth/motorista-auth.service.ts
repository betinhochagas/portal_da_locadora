import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MotoristaLoginDto,
  MotoristaPrimeiroAcessoDto,
  MotoristaEsqueciSenhaDto,
  MotoristaResetSenhaDto,
} from './dto/motorista-auth.dto';

@Injectable()
export class MotoristaAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: MotoristaLoginDto) {
    // Remove pontuação do CPF (aceita com ou sem)
    const cpfLimpo = dto.cpf.replace(/\D/g, '');

    // Busca motorista por CPF
    const motorista = await this.prisma.motorista.findUnique({
      where: { cpf: cpfLimpo },
    });

    if (!motorista) {
      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    // Verifica se está ativo
    if (!motorista.active) {
      throw new UnauthorizedException('Motorista inativo');
    }

    // Verifica se está bloqueado
    if (motorista.blacklisted) {
      throw new UnauthorizedException(
        'Motorista bloqueado. Entre em contato com a locadora.',
      );
    }

    // Verifica se está temporariamente bloqueado (brute force)
    if (motorista.lockedUntil && motorista.lockedUntil > new Date()) {
      const minutosRestantes = Math.ceil(
        (motorista.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Conta temporariamente bloqueada. Tente novamente em ${minutosRestantes} minuto(s).`,
      );
    }

    // Verifica se tem senha cadastrada
    if (!motorista.password) {
      throw new UnauthorizedException(
        'Senha não cadastrada. Entre em contato com a locadora.',
      );
    }

    // Valida senha
    const senhaValida = await bcrypt.compare(dto.password, motorista.password);

    if (!senhaValida) {
      // Incrementa tentativas falhas
      await this.prisma.motorista.update({
        where: { id: motorista.id },
        data: {
          loginAttempts: motorista.loginAttempts + 1,
          lockedUntil:
            motorista.loginAttempts >= 4
              ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
              : null,
        },
      });

      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    // Reset tentativas e atualiza último login
    await this.prisma.motorista.update({
      where: { id: motorista.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Gera token JWT
    const payload = {
      motoristaId: motorista.id,
      type: 'motorista',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      motorista: {
        id: motorista.id,
        name: motorista.name,
        email: motorista.email,
        cpf: motorista.cpf,
        phone: motorista.phone,
        passwordReset: motorista.passwordReset,
      },
    };
  }

  async primeiroAcesso(motoristaId: string, dto: MotoristaPrimeiroAcessoDto) {
    const motorista = await this.prisma.motorista.findUnique({
      where: { id: motoristaId },
    });

    if (!motorista) {
      throw new BadRequestException('Motorista não encontrado');
    }

    if (!motorista.password) {
      throw new BadRequestException('Senha inicial não configurada');
    }

    // Valida senha atual
    const senhaAtualValida = await bcrypt.compare(
      dto.senhaAtual,
      motorista.password,
    );

    if (!senhaAtualValida) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Verifica se nova senha é diferente da atual
    const novaSenhaIgual = await bcrypt.compare(
      dto.novaSenha,
      motorista.password,
    );

    if (novaSenhaIgual) {
      throw new BadRequestException(
        'Nova senha deve ser diferente da senha atual',
      );
    }

    // Hash da nova senha
    const novoHash = await bcrypt.hash(dto.novaSenha, 10);

    // Atualiza senha e marca passwordReset como false
    const motoristaAtualizado = await this.prisma.motorista.update({
      where: { id: motoristaId },
      data: {
        password: novoHash,
        passwordReset: false,
      },
    });

    // Gera novo token JWT
    const payload = {
      motoristaId: motoristaAtualizado.id,
      type: 'motorista',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      motorista: {
        id: motoristaAtualizado.id,
        name: motoristaAtualizado.name,
        email: motoristaAtualizado.email,
        cpf: motoristaAtualizado.cpf,
        phone: motoristaAtualizado.phone,
        passwordReset: motoristaAtualizado.passwordReset,
      },
    };
  }

  async esqueciSenha(dto: MotoristaEsqueciSenhaDto) {
    const cpfLimpo = dto.cpf.replace(/\D/g, '');

    const motorista = await this.prisma.motorista.findUnique({
      where: { cpf: cpfLimpo },
    });

    if (!motorista) {
      // Não revela se CPF existe (segurança)
      return {
        message:
          'Se o CPF e email estiverem corretos, você receberá instruções por email.',
      };
    }

    if (motorista.email !== dto.email) {
      // Não revela se email está errado (segurança)
      return {
        message:
          'Se o CPF e email estiverem corretos, você receberá instruções por email.',
      };
    }

    // TODO: Implementar envio de email com token de reset
    // Por enquanto, retorna mensagem genérica
    return {
      message:
        'Se o CPF e email estiverem corretos, você receberá instruções por email.',
    };
  }

  async resetSenha() {
    // TODO: Validar token e resetar senha
    throw new BadRequestException('Funcionalidade em desenvolvimento');
  }
}
