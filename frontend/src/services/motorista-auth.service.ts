import axios from 'axios';
import type {
  MotoristaLoginDto,
  PrimeiroAcessoDto,
  EsqueciSenhaDto,
  ResetSenhaDto,
  MotoristaAuthResponse,
  Motorista,
} from '../types/motorista';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('motorista_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta - NÃO redirecionar automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não fazer redirecionamento automático aqui
    // Deixar o componente/context lidar com erros 401
    return Promise.reject(error);
  }
);

export const motoristaAuthService = {
  async login(dto: MotoristaLoginDto): Promise<MotoristaAuthResponse> {
    const response = await api.post<MotoristaAuthResponse>('/auth/motorista/login', dto);
    return response.data;
  },

  async primeiroAcesso(dto: PrimeiroAcessoDto): Promise<MotoristaAuthResponse> {
    const response = await api.post<MotoristaAuthResponse>('/auth/motorista/primeiro-acesso', dto);
    return response.data;
  },

  async esqueciSenha(dto: EsqueciSenhaDto): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/motorista/esqueci-senha', dto);
    return response.data;
  },

  async resetSenha(dto: ResetSenhaDto): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/motorista/reset-senha', dto);
    return response.data;
  },

  async getProfile(): Promise<Motorista> {
    const response = await api.get<Motorista>('/auth/motorista/profile');
    return response.data;
  },

  // Helpers para localStorage
  saveToken(token: string): void {
    localStorage.setItem('motorista_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('motorista_token');
  },

  removeToken(): void {
    localStorage.removeItem('motorista_token');
  },

  saveMotorista(motorista: Motorista): void {
    localStorage.setItem('motorista_data', JSON.stringify(motorista));
  },

  getMotorista(): Motorista | null {
    const data = localStorage.getItem('motorista_data');
    return data ? JSON.parse(data) : null;
  },

  removeMotorista(): void {
    localStorage.removeItem('motorista_data');
  },

  clearAll(): void {
    this.removeToken();
    this.removeMotorista();
  },
};
