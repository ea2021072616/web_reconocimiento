import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { iniciarSesion } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToRecover: () => void;
}

export const LoginForm = ({ onSwitchToRegister, onSwitchToRecover }: LoginFormProps) => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await iniciarSesion(dni, password);
      if (result.success && result.cuenta) {
        login(result.cuenta);
        navigate('/panel');
      } else {
        setError(result.error || 'Error al iniciar sesión.');
      }
    } catch {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">login</span>
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-primary mb-1">Bienvenido de vuelta</h2>
        <p className="text-on-surface-variant text-sm">Ingresa con tu DNI y contraseña</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">N° DNI</label>
        <input
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="Ej. 12345678"
          maxLength={8}
          className="input-field"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          className="input-field"
          required
        />
      </div>

      {error && (
        <div className="bg-error-accent/10 text-error-accent text-sm p-3 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || dni.length !== 8 || !password}
        className="btn-primary w-full justify-center"
      >
        {loading ? (
          <><Loader2 size={20} className="animate-spin" /> Verificando...</>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">login</span>
            Iniciar Sesión
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onSwitchToRecover}
        className="text-sm text-secondary hover:underline cursor-pointer bg-transparent border-none text-center"
      >
        ¿Olvidaste tu contraseña?
      </button>

      <div className="text-center text-sm text-on-surface-variant">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-secondary font-semibold hover:underline cursor-pointer bg-transparent border-none"
        >
          Crear cuenta
        </button>
      </div>
    </motion.form>
  );
};
