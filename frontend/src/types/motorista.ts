export interface Motorista {
  id: string;
  name: string;
  nome: string; // Alias para compatibilidade
  cpf?: string | null;
  cnpj?: string | null;
  email?: string | null;
  phone: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  active: boolean;
  blacklisted: boolean;
  passwordReset?: boolean; // Flag para primeiro acesso
  createdAt: string;
  updatedAt: string;
  contratos?: Array<{
    id: string;
    contractNumber: string;
    status: string;
  }>;
}

// DTOs para autenticação do motorista
export interface MotoristaLoginDto {
  cpf: string;
  password: string;
}

export interface PrimeiroAcessoDto {
  senhaAtual: string;
  novaSenha: string;
}

export interface EsqueciSenhaDto {
  cpf: string;
}

export interface ResetSenhaDto {
  cpf: string;
  novaSenha: string;
}

export interface MotoristaAuthResponse {
  access_token: string;
  motorista: Motorista;
}
