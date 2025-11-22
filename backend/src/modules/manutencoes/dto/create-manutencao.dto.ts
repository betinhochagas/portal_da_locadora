import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { MaintenanceType, MaintenanceStatus } from '../../../common/enums';

export class CreateManutencaoDto {
  @IsString()
  @IsNotEmpty()
  veiculoId: string;

  @IsEnum(MaintenanceType)
  @IsNotEmpty()
  type: MaintenanceType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  mileage: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  cost: number;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsOptional()
  observations?: string;
}
