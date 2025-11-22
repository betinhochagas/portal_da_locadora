import { PartialType } from '@nestjs/mapped-types';
import { CreateCobrancaDto, PaymentStatus } from './create-cobranca.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class UpdateCobrancaDto extends PartialType(CreateCobrancaDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  daysLate?: number;

  @IsOptional()
  @IsNumber()
  lateFee?: number;
}
