import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RegistrarPagamentoDto {
  @IsDateString()
  paymentDate: string;

  @IsString()
  paymentMethod: string; // PIX, TED, Dinheiro, Cartão, etc.

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFee?: number; // Multa por atraso

  @IsOptional()
  @IsString()
  observations?: string;
}
