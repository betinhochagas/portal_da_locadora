import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('🔐 [JWT GUARD] Verificando autenticação...');
    console.log('🔐 Authorization header:', request.headers.authorization ? 'Presente' : 'AUSENTE');
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 [JWT GUARD] HandleRequest chamado');
    console.log('🔐 Erro:', err?.message || 'nenhum');
    console.log('🔐 User:', user ? 'autenticado' : 'NÃO autenticado');
    console.log('🔐 Info:', info?.message || info || 'nenhum');
    
    if (err || !user) {
      console.error('❌ [JWT GUARD] FALHA NA AUTENTICAÇÃO!');
      console.error('❌ Erro completo:', err);
      console.error('❌ Info completo:', info);
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    
    console.log('✅ [JWT GUARD] Autenticação bem-sucedida');
    return user;
  }
}
