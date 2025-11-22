import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegistrarKmDto {
  @IsInt()
  @Min(0)
  kmAtual: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
