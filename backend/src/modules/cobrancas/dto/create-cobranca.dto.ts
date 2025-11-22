import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export enum PaymentStatus {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  ATRASADA = 'ATRASADA',
  CANCELADA = 'CANCELADA',
}

export class CreateCobrancaDto {
  @IsUUID()
  contratoId: string;

  @IsString()
  referenceMonth: string; // YYYY-MM

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
