import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';
import { AuditAction } from '../enums';

/**
 * Interceptor para registrar automaticamente ações de auditoria
 * Usage: @UseInterceptors(AuditInterceptor)
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    // Detectar a ação baseada no método HTTP
    let action: AuditAction | null = null;
    const urlString = String(url);
    if (method === 'POST' && !urlString.includes('/login')) {
      action = AuditAction.CREATE;
    } else if (method === 'PATCH' || method === 'PUT') {
      action = AuditAction.UPDATE;
    } else if (method === 'DELETE') {
      action = AuditAction.DELETE;
    }

    // Se não for uma ação auditável, prosseguir sem registrar
    if (!action) {
      return next.handle();
    }

    // Extrair informações da entidade da URL
    const entityMatch = urlString.match(/\/api\/v1\/([^/]+)/);
    const entity = entityMatch?.[1] || 'unknown';

    // Extrair ID da entidade da URL (para UPDATE e DELETE)
    const idMatch = urlString.match(/\/([a-f0-9-]{36})(\/|$|\?)/);
    const bodyId = body && typeof body.id === 'string' ? body.id : undefined;
    const entityId = idMatch?.[1] || bodyId || 'unknown';

    return next.handle().pipe(
      tap((response: unknown) => {
        // Registrar auditoria após sucesso da operação
        const userId = String(user?.sub || user?.id || 'system');
        const userName = String(user?.name || 'Sistema');

        // Para CREATE, usar o ID do objeto criado
        const responseId =
          typeof response === 'object' && response !== null && 'id' in response
            ? String((response as { id: unknown }).id)
            : undefined;
        const finalEntityId =
          action === AuditAction.CREATE && responseId ? responseId : entityId;

        this.auditLogService
          .log(
            String(entity),
            String(finalEntityId),
            action,
            userId,
            userName,
            (body as Record<string, unknown>) || {},
          )
          .catch((err: unknown) => {
            // Log error mas não falhar a request
            console.error('Failed to create audit log:', err);
          });
      }),
    );
  }
}
