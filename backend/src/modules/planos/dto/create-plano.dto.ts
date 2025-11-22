import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  MaxLength,
} from 'class-validator';
import { VehicleCategory } from '@prisma/client';

export class CreatePlanoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  // Valores
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Diária deve ser maior que zero' })
  dailyPrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Valor semanal deve ser maior que zero' })
  @IsOptional()
  weeklyPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Valor mensal deve ser maior que zero' })
  monthlyPrice: number;

  // KM inclusos (null = ilimitado)
  @IsNumber()
  @Min(0, { message: 'KM inclusos não pode ser negativo' })
  @IsOptional()
  kmIncluded?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Valor por KM excedente não pode ser negativo' })
  @IsOptional()
  kmExtraPrice?: number;

  // Benefícios
  @IsBoolean()
  @IsOptional()
  includesInsurance?: boolean;

  @IsBoolean()
  @IsOptional()
  includesMaintenance?: boolean;

  // Categorias aceitas neste plano
  @IsArray()
  @ArrayNotEmpty({ message: 'Selecione pelo menos uma categoria de veículo' })
  @IsEnum(VehicleCategory, {
    each: true,
    message: 'Categoria de veículo inválida',
  })
  allowedCategories: VehicleCategory[];

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
