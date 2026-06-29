import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { RecoverPasswordForm } from '../components/auth/RecoverPasswordForm';

type AuthView = 'login' | 'register' | 'recover';

export function AuthPage() {
  const location = useLocation();
  const [view, setView] = useState<AuthView>(location.state?.view || 'login');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/panel');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-outline-variant bg-white/90 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1280px] mx-auto h-16">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold font-headline-lg bg-clip-text text-transparent bg-gradient-to-r from-[#C96442] via-[#0F172A] to-[#C96442] brand-text-animated cursor-pointer bg-transparent border-none"
          >
            #YoCuidoMiFamilia
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-on-surface-variant hover:text-primary cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver al inicio
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-outline-variant rounded-3xl p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <LoginForm
                  key="login"
                  onSwitchToRegister={() => setView('register')}
                  onSwitchToRecover={() => setView('recover')}
                />
              )}
              {view === 'register' && (
                <RegisterForm
                  key="register"
                  onSwitchToLogin={() => setView('login')}
                />
              )}
              {view === 'recover' && (
                <RecoverPasswordForm
                  key="recover"
                  onSwitchToLogin={() => setView('login')}
                />
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6 opacity-60 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-xs">lock</span>
            Tus datos están protegidos · Impulsado por tecnología SIRE
          </p>
        </div>
      </div>
    </div>
  );
}
