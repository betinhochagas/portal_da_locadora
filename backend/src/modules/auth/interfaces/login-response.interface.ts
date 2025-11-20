export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    filialId?: string;
    filial?: {
      id: string;
      name: string;
      cnpj: string;
      city: string;
      state: string;
    };
  };
}
