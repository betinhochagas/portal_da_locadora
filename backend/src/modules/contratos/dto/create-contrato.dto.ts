import {
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsDecimal,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateContratoDto {
  @IsString()
  @MinLength(3, {
    message: 'Número do contrato deve ter no mínimo 3 caracteres',
  })
  contractNumber: string;

  @IsUUID('4', { message: 'ID do motorista inválido' })
  motoristaId: string;

  @IsUUID('4', { message: 'ID do veículo inválido' })
  veiculoId: string;

  @IsUUID('4', { message: 'ID do plano inválido' })
  planoId: string;

  @IsUUID('4', { message: 'ID da filial inválido' })
  filialId: string;

  @IsDateString({}, { message: 'Data de início inválida' })
  startDate: string;

  @IsDateString({}, { message: 'Data de término inválida' })
  endDate: string;

  @Min(1, { message: 'Dia de vencimento deve ser entre 1 e 31' })
  @Max(31, { message: 'Dia de vencimento deve ser entre 1 e 31' })
  @IsInt({ message: 'Dia de vencimento deve ser um número inteiro' })
  billingDay: number;

  @IsDecimal({ decimal_digits: '2' }, { message: 'Valor mensal inválido' })
  monthlyAmount: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' }, { message: 'Valor da caução inválido' })
  deposit?: number;

  @IsInt({ message: 'KM inicial deve ser um número inteiro' })
  @Min(0, { message: 'KM inicial não pode ser negativo' })
  kmStart: number;

  @IsOptional()
  @IsInt({ message: 'KM atual deve ser um número inteiro' })
  @Min(0, { message: 'KM atual não pode ser negativo' })
  kmCurrent?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
