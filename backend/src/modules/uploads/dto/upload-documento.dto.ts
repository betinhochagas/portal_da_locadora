import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class UploadDocumentoDto {
  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;

  @IsOptional()
  @IsUUID()
  motoristaId?: string;

  @IsOptional()
  @IsUUID()
  veiculoId?: string;

  @IsOptional()
  @IsUUID()
  contratoId?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
