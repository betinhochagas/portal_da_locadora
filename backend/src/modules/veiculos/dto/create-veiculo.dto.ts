import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsBoolean,
  Matches,
  Length,
} from 'class-validator';

// Enums alinhados com o schema Prisma
enum VehicleCategory {
  HATCH = 'HATCH',
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  PICAPE = 'PICAPE',
  VAN = 'VAN',
}

enum FuelType {
  FLEX = 'FLEX',
  GASOLINA = 'GASOLINA',
  DIESEL = 'DIESEL',
  ELETRICO = 'ELETRICO',
  HIBRIDO = 'HIBRIDO',
}

enum Transmission {
  MANUAL = 'MANUAL',
  AUTOMATICO = 'AUTOMATICO',
  AUTOMATIZADO = 'AUTOMATIZADO',
}

enum VehicleStatus {
  DISPONIVEL = 'DISPONIVEL',
  LOCADO = 'LOCADO',
  MANUTENCAO = 'MANUTENCAO',
  VISTORIA = 'VISTORIA',
  INATIVO = 'INATIVO',
}

export class CreateVeiculoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/, {
    message: 'Placa deve estar no formato válido (ABC1234, ABC-1234 ou ABC1D23)',
  })
  plate: string;

  @IsString()
  @IsOptional()
  @Length(11, 11)
  renavam?: string;

  @IsString()
  @IsOptional()
  @Length(17, 17)
  chassi?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsEnum(VehicleCategory)
  @IsNotEmpty()
  category: VehicleCategory;

  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType: FuelType;

  @IsEnum(Transmission)
  @IsNotEmpty()
  transmission: Transmission;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  km?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fipeValue?: number;

  @IsString()
  @IsOptional()
  nextMaintenanceKm?: string;

  @IsString()
  @IsOptional()
  lastMaintenanceDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  filialId?: string;
}
