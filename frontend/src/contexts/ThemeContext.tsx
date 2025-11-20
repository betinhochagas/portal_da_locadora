/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Aplicar tema inicial ANTES do React renderizar
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) {
    // Aplicar imediatamente ao HTML
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return stored;
  }
  
  // Detectar preferência do sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
    return 'dark';
  }
  
  document.documentElement.classList.remove('dark');
  return 'light';
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Forçar atualização removendo e adicionando classes
    root.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    localStorage.setItem('theme', theme);
    
    // Força re-render do CSS
    document.body.style.display = 'none';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

