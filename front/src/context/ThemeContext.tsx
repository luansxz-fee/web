import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Modo = 'normal' | 'idoso';

interface ThemeContextType {
  theme: Theme;
  modo: Modo;
  toggleTheme: () => void;
  toggleModo: () => void;
  modoIdoso: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  modo: 'normal',
  toggleTheme: () => {},
  toggleModo: () => {},
  modoIdoso: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('medsync_theme') as Theme) || 'light';
  });

  const [modo, setModo] = useState<Modo>(() => {
    return (localStorage.getItem('medsync_modo') as Modo) || 'normal';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medsync_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-modo', modo);
    localStorage.setItem('medsync_modo', modo);
  }, [modo]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const toggleModo = () => setModo(m => m === 'normal' ? 'idoso' : 'normal');

  return (
    <ThemeContext.Provider value={{ theme, modo, toggleTheme, toggleModo, modoIdoso: modo === 'idoso' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
