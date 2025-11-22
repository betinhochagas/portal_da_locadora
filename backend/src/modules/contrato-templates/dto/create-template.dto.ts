import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Título deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Conteúdo deve ter no mínimo 50 caracteres' })
  conteudo: string;
}
