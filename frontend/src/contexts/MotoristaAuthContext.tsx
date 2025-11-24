import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motoristaAuthService } from '../services/motorista-auth.service';
import type {
  Motorista,
  MotoristaLoginDto,
  PrimeiroAcessoDto,
  EsqueciSenhaDto,
  ResetSenhaDto,
} from '../types/motorista';

export interface MotoristaAuthContextData {
  motorista: Motorista | null;
  loading: boolean;
  isAuthenticated: boolean;
  needsPasswordReset: boolean;
  login: (dto: MotoristaLoginDto) => Promise<void>;
  primeiroAcesso: (dto: PrimeiroAcessoDto) => Promise<void>;
  esqueciSenha: (dto: EsqueciSenhaDto) => Promise<{ message: string }>;
  resetSenha: (dto: ResetSenhaDto) => Promise<{ message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const MotoristaAuthContext = createContext<MotoristaAuthContextData>({} as MotoristaAuthContextData);

interface MotoristaAuthProviderProps {
  children: ReactNode;
}

export const MotoristaAuthProvider: React.FC<MotoristaAuthProviderProps> = ({ children }) => {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = motoristaAuthService.getToken();
        const savedMotorista = motoristaAuthService.getMotorista();

        if (token && savedMotorista) {
          setMotorista(savedMotorista);
          setNeedsPasswordReset(savedMotorista.passwordReset || false);
          // Não validar token na inicialização para evitar erro 404
          // A validação será feita quando o usuário tentar acessar rotas protegidas
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Limpar dados inválidos
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (dto: MotoristaLoginDto): Promise<void> => {
    try {
      const response = await motoristaAuthService.login(dto);
      
      motoristaAuthService.saveToken(response.access_token);
      motoristaAuthService.saveMotorista(response.motorista);
      
      setMotorista(response.motorista);
      setNeedsPasswordReset(response.motorista.passwordReset || false);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const primeiroAcesso = async (dto: PrimeiroAcessoDto): Promise<void> => {
    try {
      const response = await motoristaAuthService.primeiroAcesso(dto);
      
      motoristaAuthService.saveToken(response.access_token);
      motoristaAuthService.saveMotorista(response.motorista);
      
      setMotorista(response.motorista);
      setNeedsPasswordReset(false); // Senha resetada
    } catch (error) {
      console.error('Erro no primeiro acesso:', error);
      throw error;
    }
  };

  const esqueciSenha = async (dto: EsqueciSenhaDto): Promise<{ message: string }> => {
    try {
      const response = await motoristaAuthService.esqueciSenha(dto);
      return response;
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      throw error;
    }
  };

  const resetSenha = async (dto: ResetSenhaDto): Promise<{ message: string }> => {
    try {
      const response = await motoristaAuthService.resetSenha(dto);
      return response;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const updatedMotorista = await motoristaAuthService.getProfile();
      motoristaAuthService.saveMotorista(updatedMotorista);
      setMotorista(updatedMotorista);
      setNeedsPasswordReset(updatedMotorista.passwordReset || false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const logout = (): void => {
    motoristaAuthService.clearAll();
    setMotorista(null);
    setNeedsPasswordReset(false);
  };

  return (
    <MotoristaAuthContext.Provider
      value={{
        motorista,
        loading,
        isAuthenticated: !!motorista,
        needsPasswordReset,
        login,
        primeiroAcesso,
        esqueciSenha,
        resetSenha,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </MotoristaAuthContext.Provider>
  );
};
