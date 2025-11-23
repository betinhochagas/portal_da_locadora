import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('👮 [ROLES GUARD] Verificando permissões...');
    
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('👮 Roles necessárias:', requiredRoles || 'nenhuma (endpoint público)');

    if (!requiredRoles) {
      console.log('✅ [ROLES GUARD] Sem restrição de roles, acesso permitido');
      return true; // Sem restrição de roles
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      console.error('❌ [ROLES GUARD] Usuário não encontrado no request!');
      throw new ForbiddenException('Usuário não autenticado');
    }

    console.log('👮 Role do usuário:', user.role);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hasRole = requiredRoles.includes(user.role as string);

    if (!hasRole) {
      console.error(`❌ [ROLES GUARD] Acesso negado! Role '${user.role}' não está em [${requiredRoles.join(', ')}]`);
      throw new ForbiddenException(
        `Acesso negado. Roles necessárias: ${requiredRoles.join(', ')}`,
      );
    }

    console.log('✅ [ROLES GUARD] Permissão concedida');
    return true;
  }
}
