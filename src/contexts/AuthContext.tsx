import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type CuentaData } from '../services/authService';

interface AuthContextType {
  usuario: CuentaData | null;
  isLoggedIn: boolean;
  login: (cuenta: CuentaData) => void;
  logout: () => void;
  actualizarUsuario: (data: Partial<CuentaData>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const SESSION_KEY = 'sire_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<CuentaData | null>(() => {
    // Recuperar sesión del localStorage
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });

  const isLoggedIn = usuario !== null;

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [usuario]);

  const login = (cuenta: CuentaData) => {
    setUsuario(cuenta);
  };

  const logout = () => {
    setUsuario(null);
  };

  const actualizarUsuario = (data: Partial<CuentaData>) => {
    setUsuario(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoggedIn, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
