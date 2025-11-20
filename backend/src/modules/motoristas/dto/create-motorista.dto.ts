import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  Length,
  Matches,
} from 'class-validator';

enum CnhCategoria {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  AB = 'AB',
  AC = 'AC',
  AD = 'AD',
  AE = 'AE',
}

export class CreateMotoristaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve ter 11 dígitos',
  })
  cpf?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, {
    message: 'CNPJ deve ter 14 dígitos',
  })
  cnpj?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  rg?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/, {
    message: 'Telefone deve ter 10 ou 11 dígitos',
  })
  phone: string;

  // CNH
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  cnh: string;

  @IsEnum(CnhCategoria)
  @IsNotEmpty()
  cnhCategory: CnhCategoria;

  @IsDateString()
  @IsNotEmpty()
  cnhExpiry: string;

  // Endereço
  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, {
    message: 'CEP deve ter 8 dígitos',
  })
  zipCode?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  state?: string;

  // Dados bancários
  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAgency?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  // Documentos
  @IsString()
  @IsOptional()
  cnhPhoto?: string;

  @IsString()
  @IsOptional()
  rgPhoto?: string;

  @IsString()
  @IsOptional()
  compResidencia?: string;

  // Status
  @IsBoolean()
  @IsOptional()
  blacklisted?: boolean;

  @IsString()
  @IsOptional()
  blacklistReason?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
