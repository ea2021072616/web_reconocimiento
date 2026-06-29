import { motion } from 'framer-motion';

interface RecoverPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const RecoverPasswordForm = ({ onSwitchToLogin }: RecoverPasswordFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-full bg-outline-variant/30 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-on-surface-variant text-3xl">lock_reset</span>
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-primary mb-1">Recuperar Contraseña</h2>
        <p className="text-on-surface-variant text-sm">Restaura el acceso a tu cuenta</p>
      </div>

      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-secondary text-4xl mb-3 block">construction</span>
        <p className="font-semibold text-primary mb-2">Funcionalidad próximamente</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Estamos trabajando en un sistema seguro de recuperación de contraseña mediante
          código OTP (enviado a tu celular o correo) y verificación facial.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">N° DNI</label>
        <input
          type="text"
          placeholder="Ingresa tu número de DNI"
          maxLength={8}
          className="input-field opacity-50 cursor-not-allowed"
          disabled
        />
      </div>

      <button
        type="button"
        disabled
        className="btn-primary w-full justify-center opacity-50 cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-lg">send</span>
        Enviar código de recuperación
      </button>

      <div className="text-center text-sm text-on-surface-variant">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-secondary font-semibold hover:underline cursor-pointer bg-transparent border-none"
        >
          ← Volver a Iniciar Sesión
        </button>
      </div>
    </motion.div>
  );
};
