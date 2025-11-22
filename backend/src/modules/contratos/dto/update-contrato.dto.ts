import { PartialType } from '@nestjs/mapped-types';
import { CreateContratoDto } from './create-contrato.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

// Enum de status do contrato (alinhado com Prisma)
export enum ContractStatus {
  RASCUNHO = 'RASCUNHO',
  ATIVO = 'ATIVO',
  SUSPENSO = 'SUSPENSO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

export class UpdateContratoDto extends PartialType(CreateContratoDto) {
  @IsOptional()
  @IsEnum(ContractStatus, { message: 'Status inválido' })
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

// Re-export para uso no controller
export { ContractStatus as ContratoStatus };
