import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';
import { AuditAction } from '@prisma/client';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  entity: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsObject()
  @IsOptional()
  changes?: Record<string, unknown>;
}
