import { IsString, MinLength, Matches } from 'class-validator';

export class MotoristaLoginDto {
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos',
  })
  cpf: string;

  @IsString()
  @MinLength(6, {
    message: 'Senha deve ter no mínimo 6 caracteres',
  })
  password: string;
}

export class MotoristaPrimeiroAcessoDto {
  @IsString()
  @MinLength(6)
  senhaAtual: string;

  @IsString()
  @MinLength(8, {
    message: 'Nova senha deve ter no mínimo 8 caracteres',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Nova senha deve conter letras e números',
  })
  novaSenha: string;
}

export class MotoristaEsqueciSenhaDto {
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos',
  })
  cpf: string;

  @IsString()
  email: string;
}

export class MotoristaResetSenhaDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Senha deve conter letras e números',
  })
  novaSenha: string;
}
