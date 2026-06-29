import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { verificarDniExiste, crearCuenta, iniciarSesion } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

type Step = 'dni' | 'password' | 'contacto' | 'terminos';

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [step, setStep] = useState<Step>('dni');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validaciones
  const dniValido = /^\d{8}$/.test(dni);
  const passwordValida = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  const passwordsCoinciden = password === confirmPassword;
  const tieneContacto = celular.trim().length >= 9;

  const handleVerificarDni = async () => {
    setError('');
    setLoading(true);
    try {
      const existe = await verificarDniExiste(dni);
      if (existe) {
        setError('Este DNI ya tiene una cuenta.');
      } else {
        setStep('password');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCuenta = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await crearCuenta({
        dni,
        password,
        celular: celular.trim() || undefined,
        correo: correo.trim() || undefined,
      });

      if (result.success) {
        // Login automático
        const loginResult = await iniciarSesion(dni, password);
        if (loginResult.success && loginResult.cuenta) {
          login(loginResult.cuenta);
          navigate('/panel');
        }
      } else {
        setError(result.error || 'Error al crear cuenta.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = step === 'dni' ? 1 : step === 'password' ? 2 : step === 'contacto' ? 3 : 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-secondary text-3xl">person_add</span>
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-primary mb-1">Crear Cuenta</h2>
        <p className="text-on-surface-variant text-sm">Paso {stepNumber} de 4</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${n <= stepNumber ? 'bg-secondary' : 'bg-outline-variant'}`}
          />
        ))}
      </div>

      {error && (
        <div className="bg-error-accent/10 text-error-accent text-sm p-3 rounded-lg text-center font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
          {error.includes('ya tiene') && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="underline font-bold cursor-pointer bg-transparent border-none text-error-accent"
            >
              Ir a login
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'dni' && (
          <motion.div key="dni" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">N° DNI</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => { setDni(e.target.value.replace(/\D/g, '').slice(0, 8)); setError(''); }}
                placeholder="Ingresa tu número de DNI (8 dígitos)"
                maxLength={8}
                className="input-field"
              />
              {dni.length > 0 && !dniValido && (
                <p className="text-xs text-on-surface-variant">El DNI debe tener 8 dígitos</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleVerificarDni}
              disabled={!dniValido || loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> Verificando...</> : 'Continuar'}
            </button>
          </motion.div>
        )}

        {step === 'password' && (
          <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Crear contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="input-field"
              />
              <div className="flex flex-col gap-1 text-xs">
                <span className={password.length >= 8 ? 'text-success-accent' : 'text-on-surface-variant'}>
                  {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                </span>
                <span className={/[A-Z]/.test(password) ? 'text-success-accent' : 'text-on-surface-variant'}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Al menos 1 mayúscula
                </span>
                <span className={/\d/.test(password) ? 'text-success-accent' : 'text-on-surface-variant'}>
                  {/\d/.test(password) ? '✓' : '○'} Al menos 1 número
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="input-field"
              />
              {confirmPassword && !passwordsCoinciden && (
                <p className="text-xs text-error-accent">Las contraseñas no coinciden</p>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('dni')} className="btn-secondary flex-1 justify-center">Atrás</button>
              <button
                type="button"
                onClick={() => setStep('contacto')}
                disabled={!passwordValida || !passwordsCoinciden}
                className="btn-primary flex-[2] justify-center"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'contacto' && (
          <motion.div key="contacto" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant text-center bg-surface-container p-3 rounded-lg">
              Necesitamos tu número de celular obligatoriamente para poder contactarte o contactar a tu familia en caso de emergencia.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Celular (Obligatorio)</label>
              <input
                type="tel"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="Ej. 987654321"
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Correo electrónico (opcional)</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Ej. juan@correo.com"
                className="input-field"
              />
            </div>
            {!tieneContacto && celular.length > 0 && (
              <p className="text-xs text-error-accent text-center">Debes ingresar un número de celular válido</p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('password')} className="btn-secondary flex-1 justify-center">Atrás</button>
              <button
                type="button"
                onClick={() => setStep('terminos')}
                disabled={!tieneContacto}
                className="btn-primary flex-[2] justify-center"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'terminos' && (
          <motion.div key="terminos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div className="bg-surface-container border border-outline-variant rounded-xl p-4 text-sm text-on-surface-variant leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-semibold text-on-surface mb-2">Términos y Condiciones</p>
              <p>Al crear tu cuenta en la plataforma #YoCuidoMiFamilia (impulsada por SIRE), aceptas que:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Tus datos personales serán almacenados de forma segura y encriptada.</li>
                <li>La información registrada será utilizada exclusivamente para fines de emergencia y prevención.</li>
                <li>Solo instituciones autorizadas (bomberos, hospitales, policía, defensa civil) podrán acceder a tus datos en caso de emergencia real.</li>
                <li>Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.</li>
                <li>Las fotos de rostro son utilizadas únicamente para reconocimiento en situaciones de emergencia.</li>
                <li>Tus datos nunca serán vendidos ni compartidos con fines comerciales o publicitarios.</li>
              </ul>
            </div>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-success-accent cursor-pointer"
              />
              <span className="text-sm text-on-surface">
                He leído y acepto los <span className="text-secondary font-semibold">términos y condiciones</span> del uso de la plataforma.
              </span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('contacto')} className="btn-secondary flex-1 justify-center">Atrás</button>
              <button
                type="button"
                onClick={handleCrearCuenta}
                disabled={!aceptoTerminos || loading}
                className="btn-primary flex-[2] justify-center"
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> Creando cuenta...</> : (
                  <>
                    <span className="material-symbols-outlined text-lg">how_to_reg</span>
                    Crear Cuenta
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-secondary font-semibold hover:underline cursor-pointer bg-transparent border-none"
        >
          Iniciar sesión
        </button>
      </div>
    </motion.div>
  );
};
