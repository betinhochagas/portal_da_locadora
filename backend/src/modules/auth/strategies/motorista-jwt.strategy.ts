import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MotoristaJwtStrategy extends PassportStrategy(
  Strategy,
  'motorista-jwt',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: { type: string; motoristaId: string }) {
    // Verifica se é token de motorista
    if (payload.type !== 'motorista') {
      throw new UnauthorizedException('Token inválido');
    }

    // Busca motorista no banco
    const motorista = await this.prisma.motorista.findUnique({
      where: { id: payload.motoristaId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        active: true,
        blacklisted: true,
        passwordReset: true,
      },
    });

    if (!motorista) {
      throw new UnauthorizedException('Motorista não encontrado');
    }

    if (!motorista.active) {
      throw new UnauthorizedException('Motorista inativo');
    }

    if (motorista.blacklisted) {
      throw new UnauthorizedException('Motorista bloqueado');
    }

    return motorista;
  }
}
