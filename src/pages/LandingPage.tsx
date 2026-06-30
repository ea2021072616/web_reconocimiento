import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { CustomLogo } from '../components/CustomLogo';
export function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'capacidades' | 'casos'>('capacidades');
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Tilt and Magnetic state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 30 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Spotlight state for Bento Grid
  const bentoRef = useRef<HTMLDivElement>(null);
  const handleBentoMouseMove = (e: React.MouseEvent) => {
    if (!bentoRef.current) return;
    const rect = bentoRef.current.getBoundingClientRect();
    bentoRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    bentoRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // Magnetic Button CTA state
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [ctaPosition, setCtaPosition] = useState({ x: 0, y: 0 });

  const handleCtaMouseMove = (e: React.MouseEvent) => {
    if (!ctaRef.current) return;
    const { left, top, width, height } = ctaRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.3; // attraction factor
    const y = (e.clientY - (top + height / 2)) * 0.3;
    setCtaPosition({ x, y });
  };

  const handleCtaMouseLeave = () => {
    setCtaPosition({ x: 0, y: 0 });
  };
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/panel');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Intersection Observer for Entrance Animations
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });

    // Header transition on scroll
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('shadow-lg', 'h-16');
          header.classList.remove('h-20');
        } else {
          header.classList.remove('shadow-lg', 'h-16');
          header.classList.add('h-20');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const target = document.querySelector(id);
    if (target) {
      window.scrollTo({
        top: (target as HTMLElement).offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden w-full">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant h-20 transition-all duration-300">
        <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-3 text-headline-md font-headline-md text-primary tracking-tight">
            <CustomLogo className="w-12 h-12 shrink-0 drop-shadow-sm" />
            <span className="font-bold text-xl font-headline-lg text-primary tracking-tight">
              #YoCuido<span className="text-secondary">MiFamilia</span>
            </span>
          </div>
          <nav className="flex items-center gap-3 lg:gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 max-w-[40%] md:max-w-none">
            <button onClick={() => handleScrollTo('#como-funciona')} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Cómo Funciona
            </button>
            <button onClick={() => { setActiveTab('capacidades'); handleScrollTo('#caracteristicas'); }} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Características
            </button>
            <button onClick={() => { setActiveTab('casos'); handleScrollTo('#caracteristicas'); }} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Casos de Uso
            </button>
            <button onClick={() => handleScrollTo('#seguridad')} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Seguridad
            </button>
          </nav>
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => navigate('/auth')} className="text-secondary px-3 py-2 lg:px-5 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm border border-secondary hover:bg-secondary/5 transition-all cursor-pointer bg-transparent">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/auth', { state: { view: 'register' } })} className="bg-secondary text-white px-3 py-2 lg:px-6 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm hover:bg-secondary/90 transition-all cursor-pointer border-none shadow-sm">
              Empezar Red Familiar
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative min-h-[750px] flex items-center bg-background overflow-hidden"
          style={{ perspective: 2000 }}
        >
          {/* Peachy/Orange Gradient Background */}
          <div className="absolute top-0 left-0 w-[60%] h-full bg-gradient-to-br from-secondary/10 via-background to-background pointer-events-none" />

          <div className="max-w-container-max mx-auto px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-16">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start max-w-xl"
            >
              <h1 className="font-headline-xl text-[48px] lg:text-[64px] leading-[1.15] font-bold tracking-tight text-[#1E293B] mb-6">
                Protege a quienes<br />
                más <span className="text-secondary">quieres</span>
              </h1>
              <p className="font-body-lg text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
                El primer movimiento ciudadano que promueve la prevención y la seguridad de nuestros seres queridos, garantizando que siempre estén conectados contigo en caso de cualquier emergencia.
              </p>

              <button onClick={() => navigate('/auth', { state: { view: 'register' } })} className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-base hover:bg-secondary/90 transition-all flex items-center gap-3 border-none cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Empezar Red Familiar
                <span className="material-symbols-outlined text-white text-xl">arrow_forward</span>
              </button>

              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-5">
                  {/* Joven */}
                  <div className="w-14 h-14 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md z-30">
                    <img src="https://plus.unsplash.com/premium_photo-1682096252599-e8536cd97d2b?auto=format&fit=crop&q=80&w=120&h=120" alt="joven" className="w-full h-full object-cover" />
                  </div>
                  {/* Abuela */}
                  <div className="w-14 h-14 rounded-full border-2 border-white bg-slate-300 overflow-hidden shadow-md z-20">
                    <img src="https://images.unsplash.com/photo-1663429122432-c2769373768f?auto=format&fit=crop&q=80&w=120&h=120" alt="abuela" className="w-full h-full object-cover" />
                  </div>
                  {/* Niña / Hija */}
                  <div className="w-14 h-14 rounded-full border-2 border-white bg-slate-400 overflow-hidden shadow-sm z-10">
                    <img src="https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?auto=format&fit=crop&q=80&w=120&h=120" alt="niña" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-secondary font-extrabold text-3xl tracking-tight">+10,000</span>
                    <span className="font-bold text-lg text-primary tracking-tight">Familias</span>
                  </div>
                  <p className="text-slate-500 text-sm font-semibold m-0 leading-tight">Registradas y Protegidas</p>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <div className="relative h-[450px] lg:h-[550px] w-full mt-10 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl"
              >
                {/* Family Image */}
                <img
                  src={`${import.meta.env.BASE_URL}imagen_fondo.jpg`}
                  alt="Familia protegida"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 max-w-[220px] z-20">
                <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium m-0 leading-tight mb-0.5">Contacto familiar</p>
                  <p className="text-sm text-secondary font-bold m-0 leading-tight">Al instante</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Cómo Funciona Section */}
        <section className="py-24 bg-white border-t border-outline-variant/30 overflow-hidden" id="como-funciona">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full font-label-md text-sm mb-4">
                Cómo funciona
              </span>
              <h2 className="font-headline-lg text-4xl lg:text-5xl font-bold text-primary mb-4">Una red de información para emergencias</h2>
              <p className="font-body-md text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
                A través de la iniciativa <strong>#YoCuidoMiFamilia</strong>, registras voluntariamente a tu red de contactos. Esta información alimenta de forma segura a <strong>SIRE (Sistema Interinstitucional de Reconocimiento en Emergencias)</strong>, permitiendo conectar a las familias con las instituciones de auxilio en segundos ante un accidente.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Steps (Left Side) */}
              <div className="flex flex-col gap-6 reveal">
                {/* Step 1 */}
                <div
                  onMouseEnter={() => setActiveProcessStep(0)}
                  className={`relative group flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 0 ? 'bg-gradient-to-br from-amber-50 to-white shadow-lg border-amber-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-amber-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div
                    initial={false}
                    animate={{ width: activeProcessStep === 0 ? 6 : 0, opacity: activeProcessStep === 0 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-amber-500 rounded-r-full"
                  />
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 0 ? 'bg-amber-500 border-amber-600 shadow-md scale-110' : 'bg-amber-50 border-amber-100 group-hover:bg-amber-100'}`}>
                    <svg className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${activeProcessStep === 0 ? 'text-white' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-lg sm:text-xl font-bold mb-1.5 flex items-center gap-2.5 transition-colors ${activeProcessStep === 0 ? 'text-amber-700' : 'text-primary'}`}>
                      <span className={`font-bold text-base sm:text-lg transition-colors ${activeProcessStep === 0 ? 'text-amber-400' : 'text-primary/30'}`}>01.</span> Registra tu Red
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-sm sm:text-base">
                      Registra a tus seres queridos y a ti mismo en el portal web para formar parte de la red de información de emergencia de SIRE.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  onMouseEnter={() => setActiveProcessStep(1)}
                  className={`relative group flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 1 ? 'bg-gradient-to-br from-blue-50 to-white shadow-lg border-blue-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-blue-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div
                    initial={false}
                    animate={{ width: activeProcessStep === 1 ? 6 : 0, opacity: activeProcessStep === 1 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-blue-500 rounded-r-full"
                  />
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 1 ? 'bg-blue-500 border-blue-600 shadow-md scale-110' : 'bg-blue-50 border-blue-100 group-hover:bg-blue-100'}`}>
                    <svg className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${activeProcessStep === 1 ? 'text-white' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-lg sm:text-xl font-bold mb-1.5 flex items-center gap-2.5 transition-colors ${activeProcessStep === 1 ? 'text-blue-700' : 'text-primary'}`}>
                      <span className={`font-bold text-base sm:text-lg transition-colors ${activeProcessStep === 1 ? 'text-blue-400' : 'text-primary/30'}`}>02.</span> Reconocimiento en Emergencias
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-sm sm:text-base">
                      En caso de accidente, las instituciones de auxilio (Policía, Bomberos, Paramédicos) usan la app móvil <strong>SIRE</strong> para escanear y reconocer biométricamente a la persona.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  onMouseEnter={() => setActiveProcessStep(2)}
                  className={`relative group flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 2 ? 'bg-gradient-to-br from-green-50 to-white shadow-lg border-green-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-green-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div
                    initial={false}
                    animate={{ width: activeProcessStep === 2 ? 6 : 0, opacity: activeProcessStep === 2 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-green-500 rounded-r-full"
                  />
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 2 ? 'bg-green-500 border-green-600 shadow-md scale-110' : 'bg-green-50 border-green-100 group-hover:bg-green-100'}`}>
                    <svg className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${activeProcessStep === 2 ? 'text-white' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-lg sm:text-xl font-bold mb-1.5 flex items-center gap-2.5 transition-colors ${activeProcessStep === 2 ? 'text-green-700' : 'text-primary'}`}>
                      <span className={`font-bold text-base sm:text-lg transition-colors ${activeProcessStep === 2 ? 'text-green-400' : 'text-primary/30'}`}>03.</span> Notificación de Auxilio
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-sm sm:text-base">
                      La app móvil SIRE muestra de inmediato tus datos de contacto para que las autoridades te llamen de inmediato y te informen de la situación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Animation (Right Side) */}
              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 2000 }}
                className="relative lg:ml-8 mt-12 lg:mt-0 reveal"
              >
                {/* Dynamic Aura */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                  className="absolute inset-0 m-auto w-[120%] h-[120%] rounded-full blur-[60px] -z-10 transition-colors duration-700"
                  style={{ background: `conic-gradient(from 0deg, transparent, ${activeProcessStep === 0 ? 'rgba(245,158,11,0.2)' : activeProcessStep === 1 ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)'}, transparent, ${activeProcessStep === 0 ? 'rgba(245,158,11,0.1)' : activeProcessStep === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)'}, transparent)` }}
                />

                {/* Phone Mockup */}
                <div
                  className="relative mx-auto w-full max-w-[340px] h-[680px] bg-primary rounded-[3rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col"
                  style={{ transform: "translateZ(50px)" }}
                >
                  {/* Status Bar */}
                  <div className="absolute top-0 w-full flex justify-between items-center px-6 pt-4 pb-2 text-white/90 text-[11px] font-medium z-50 mix-blend-difference pointer-events-none">
                    <span>2:57</span>
                    <div className="flex gap-1.5 items-center">
                      <span className="material-symbols-outlined text-[13px]">signal_cellular_4_bar</span>
                      <span className="material-symbols-outlined text-[13px]">wifi</span>
                      <span className="material-symbols-outlined text-[13px]">battery_full</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeProcessStep === 0 && (
                          <motion.div key="step0" initial={{opacity:0, x: 30}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -30}} transition={{duration:0.4, type: "spring", bounce: 0.2}} className="flex-1 bg-slate-50 flex flex-col relative w-full h-full overflow-hidden">
                            {/* Header */}
                            <div className="pt-10 pb-3 px-6 bg-white border-b border-slate-200 shadow-sm z-10">
                              <h3 className="font-bold text-base text-slate-800 m-0 text-center">Perfil de Familiar</h3>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
                              {/* Photo Uploaded */}
                              <div className="flex flex-col items-center gap-1.5 mt-1">
                                <div className="w-20 h-20 rounded-full border-2 border-emerald-500 overflow-hidden shadow-md relative">
                                  <img 
                                    src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?auto=format&fit=crop&q=80&w=120&h=120" 
                                    alt="Familiar registrado" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px] font-bold">check_circle</span>
                                  Foto Guardada
                                </span>
                              </div>
                              
                              {/* Form Fields - Filled out */}
                              <div className="flex flex-col gap-2.5 mt-1">
                                <div className="h-10 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                   <span className="text-xs text-slate-700 font-medium">Elvis Ronald</span>
                                </div>
                                <div className="h-10 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                                   <span className="text-xs text-slate-700 font-medium">Leyva Sardon</span>
                                </div>
                                <div className="h-10 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">fingerprint</span>
                                   <span className="text-xs text-slate-700 font-medium">DNI: 73860728</span>
                                </div>
                              </div>
                              
                              {/* Medical Info */}
                              <div className="mt-1">
                                <span className="text-[9px] font-bold text-slate-500 mb-2 block uppercase tracking-wider">Condiciones Médicas</span>
                                <div className="flex flex-wrap gap-1.5">
                                  <div className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm">Hipertensión</div>
                                  <div className="bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm">Alergia Penicilina</div>
                                  <div className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm">Alzheimer</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bottom Button */}
                            <div className="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] z-10">
                              <div className="w-full py-3 bg-emerald-500 rounded-xl text-white text-center font-bold text-xs shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
                                ¡Guardado Exitosamente!
                              </div>
                            </div>
                          </motion.div>
                    )}

                    {activeProcessStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, type: "spring", bounce: 0.2 }} className="flex-1 bg-[#1a1a1a] flex flex-col relative w-full h-full overflow-hidden">
                        {/* Top Actions */}
                        <div className="absolute top-12 left-0 right-0 px-4 flex items-start gap-2 z-20">
                          <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center shrink-0 border border-white/10 cursor-pointer hover:bg-black/60 transition-colors">
                            <span className="material-symbols-outlined text-white text-lg">menu</span>
                          </div>
                          <div className="flex-1 bg-black/60 backdrop-blur-md rounded-3xl py-2.5 px-3 flex items-center gap-2 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                            <p className="text-white text-[11px] font-medium leading-snug m-0">Acomode la cámara y presione Iniciar</p>
                          </div>
                        </div>

                        {/* Camera View Oval */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pt-10">
                          {/* Big oval mask */}
                          <div className="w-[85%] h-[65%] rounded-[100%] overflow-hidden border-[3px] border-white/20 relative shadow-[0_0_60px_rgba(0,0,0,0.9)_inset]">
                            <div className="absolute inset-0 bg-slate-950">
                              <img
                                src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?auto=format&fit=crop&q=80&w=300&h=380"
                                alt="Face scan preview"
                                className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                              />
                              {/* Face Mesh Dots and Connections overlay */}
                              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Nodes */}
                                <circle cx="50" cy="30" r="1" fill="#10B981" className="animate-ping" />
                                <circle cx="50" cy="30" r="0.6" fill="#10B981" />

                                <circle cx="35" cy="35" r="0.6" fill="#10B981" />
                                <circle cx="65" cy="35" r="0.6" fill="#10B981" />

                                <circle cx="42" cy="42" r="0.6" fill="#10B981" />
                                <circle cx="58" cy="42" r="0.6" fill="#10B981" />

                                <circle cx="50" cy="50" r="0.6" fill="#10B981" />

                                <circle cx="38" cy="55" r="0.6" fill="#10B981" />
                                <circle cx="62" cy="55" r="0.6" fill="#10B981" />

                                <circle cx="50" cy="68" r="1" fill="#10B981" className="animate-ping" />
                                <circle cx="50" cy="68" r="0.6" fill="#10B981" />

                                <circle cx="32" cy="48" r="0.6" fill="#10B981" />
                                <circle cx="68" cy="48" r="0.6" fill="#10B981" />

                                {/* Connection Lines */}
                                <line x1="50" y1="30" x2="35" y2="35" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="50" y1="30" x2="65" y2="35" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="35" y1="35" x2="42" y2="42" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="65" y1="35" x2="58" y2="42" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="42" y1="42" x2="50" y2="50" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="58" y1="42" x2="50" y2="50" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="50" y1="50" x2="38" y2="55" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="50" y1="50" x2="62" y2="55" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="38" y1="55" x2="50" y2="68" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="62" y1="55" x2="50" y2="68" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="35" y1="35" x2="32" y2="48" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="65" y1="35" x2="68" y2="48" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="32" y1="48" x2="38" y2="55" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="68" y1="48" x2="62" y2="55" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="32" y1="48" x2="50" y2="68" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="68" y1="48" x2="50" y2="68" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                                <line x1="42" y1="42" x2="58" y2="42" stroke="rgba(16,185,129,0.4)" strokeWidth="0.3" />
                              </svg>
                            </div>
                            {/* Scanning effect */}
                            <motion.div
                              animate={{ y: ["-20%", "120%", "-20%"] }}
                              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)] z-10"
                            />
                          </div>

                          {/* Corner markers */}
                          <div className="absolute w-[80%] h-[60%] pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-[3px] border-t-[3px] border-white/40 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-[3px] border-t-[3px] border-white/40 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-[3px] border-b-[3px] border-white/40 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-[3px] border-b-[3px] border-white/40 rounded-br-xl"></div>
                          </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-6 z-20">
                          <div className="flex justify-between items-center w-full px-10">
                            {/* Voltear */}
                            <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                              <div className="w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <span className="material-symbols-outlined text-white text-[22px]">flip_camera_android</span>
                              </div>
                              <span className="text-white text-[10px] font-medium">Voltear</span>
                            </div>

                            {/* Play/Capture Button */}
                            <motion.div
                              whileTap={{ scale: 0.9 }}
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-20 h-20 rounded-full bg-brand-blue flex items-center justify-center shadow-[0_0_35px_rgba(30,64,175,0.6)] cursor-pointer border-[3px] border-white/20 hover:bg-brand-blue/90 transition-colors"
                            >
                              <span className="material-symbols-outlined text-white text-4xl ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </motion.div>

                            {/* Galeria */}
                            <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                              <div className="w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <span className="material-symbols-outlined text-white text-[22px]">photo_library</span>
                              </div>
                              <span className="text-white text-[10px] font-medium">Galería</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity mt-2">
                            <span className="material-symbols-outlined text-white text-sm">close</span>
                            <span className="text-white text-xs font-bold">Cancelar</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeProcessStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, type: "spring", bounce: 0.2 }} className="flex-1 bg-primary flex flex-col relative w-full h-full pt-10">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-4 py-3 text-white">
                          <span className="material-symbols-outlined cursor-pointer text-lg hover:text-white/80">arrow_back_ios_new</span>
                          <h3 className="font-headline-sm font-bold text-lg m-0 flex-1 text-center pr-6">Resultados Biométricos</h3>
                        </div>

                        {/* Success Banner */}
                        <div className="flex flex-col items-center pt-2 pb-6 text-white px-4 text-center">
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                            className="w-14 h-14 bg-success-accent rounded-full flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(34,197,94,0.4)] border-2 border-white/20"
                          >
                            <span className="material-symbols-outlined text-white text-3xl font-bold">check</span>
                          </motion.div>
                          <h2 className="font-bold text-xl mb-1 text-green-50">¡Identificación Completada!</h2>
                          <p className="text-white/70 text-xs">Se encontró 1 coincidencia en la base de datos.</p>
                        </div>

                        {/* Content area (White background) */}
                        <div className="flex-1 bg-white w-full rounded-t-3xl p-4 overflow-hidden flex flex-col gap-4 relative shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                          {/* Scrollable container */}
                          <div className="absolute inset-0 overflow-y-auto p-4 pb-20 flex flex-col gap-4 scrollbar-hide">
                            {/* Biometric Card 1 */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-outline-variant/40 rounded-2xl p-3 shadow-sm flex flex-col gap-3">
                              <div className="flex gap-3">
                                <div className="w-20 h-24 bg-surface-container rounded-lg border border-outline-variant/50 flex flex-col items-center justify-end shrink-0 overflow-hidden relative">
                                  <img
                                    src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?auto=format&fit=crop&q=80&w=120&h=140"
                                    alt="Elvis Ronald"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1.5">
                                    <span className="font-bold text-primary text-sm">73860728</span>
                                    <span className="flex items-center gap-1 bg-green-50 text-success-accent border border-green-200 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success-accent"></span> EXACTA
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-on-surface-variant leading-[1.3] flex flex-col gap-0.5 mt-2">
                                    <p className="m-0"><span className="font-bold text-primary/80">Apellidos:</span> LEYVA SARDON</p>
                                    <p className="m-0"><span className="font-bold text-primary/80">Nombres:</span> ELVIS RONALD</p>
                                    <p className="m-0"><span className="font-bold text-primary/80">F. Nac:</span> 28/01/2000 (26 años)</p>
                                    <p className="m-0"><span className="font-bold text-primary/80">Género:</span> MASCULINO</p>
                                    <p className="m-0"><span className="font-bold text-primary/80">Dpto:</span> TACNA</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-green-50 rounded-md p-2 flex gap-2 items-start border border-green-200 mt-1">
                                <span className="material-symbols-outlined text-[14px] text-success-accent mt-0.5">notifications_active</span>
                                <p className="text-[9px] text-success-accent m-0 leading-tight">
                                  <span className="font-bold">Contacto de Emergencia:</span> Llamada y alerta directa al familiar registrado para reportar el accidente.
                                </p>
                              </div>
                            </motion.div>

                          </div>

                          {/* Fixed Bottom Active Call Widget */}
                           <div className="absolute bottom-4 left-4 right-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col gap-2.5 shadow-md">
                             <div className="flex items-center gap-3">
                               {/* Pulsing Phone Icon */}
                               <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                 <span className="material-symbols-outlined text-base animate-bounce">call</span>
                                 <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping"></div>
                               </div>
                               <div className="flex-1">
                                 <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider m-0 leading-none mb-1">Llamando a contacto...</p>
                                 <p className="text-xs font-bold text-slate-800 m-0 leading-none">Erick (Padre)</p>
                               </div>
                               <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">00:03</span>
                             </div>
                             
                             <div className="flex gap-2">
                               <button type="button" className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer">
                                 <span className="material-symbols-outlined text-[13px]">call_end</span> Cancelar
                               </button>
                               <button type="button" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer">
                                 <span className="material-symbols-outlined text-[13px]">volume_up</span> Altavoz
                               </button>
                             </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phone Bottom indicator line */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 mix-blend-difference rounded-full z-50 pointer-events-none"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Features Carousel */}
        <section className="py-24 bg-background border-t border-outline-variant/30" id="caracteristicas">
          <div className="max-w-container-max mx-auto px-margin-desktop">

            {/* Tabs Navigation */}
            <div className="flex justify-center mb-16">
              <div className="inline-flex bg-surface-container p-2 rounded-full border border-outline-variant/50 shadow-sm relative overflow-hidden flex-col sm:flex-row gap-2 sm:gap-0">
                <button
                  onClick={() => setActiveTab('capacidades')}
                  className={`relative z-10 px-8 py-3 rounded-full font-label-md transition-all cursor-pointer ${activeTab === 'capacidades' ? 'bg-secondary/10 text-secondary border border-secondary/30 shadow-sm scale-105 font-bold' : 'border border-transparent bg-transparent text-on-surface-variant hover:text-secondary hover:bg-secondary/5 font-medium'}`}
                >
                  Capacidades
                </button>
                <button
                  onClick={() => setActiveTab('casos')}
                  className={`relative z-10 px-8 py-3 rounded-full font-label-md transition-all cursor-pointer ${activeTab === 'casos' ? 'bg-secondary/10 text-secondary border border-secondary/30 shadow-sm scale-105 font-bold' : 'border border-transparent bg-transparent text-on-surface-variant hover:text-secondary hover:bg-secondary/5 font-medium'}`}
                >
                  Casos de Uso
                </button>
              </div>
            </div>

            {/* Carousel Content */}
            <AnimatePresence mode="wait">

              {/* SLIDE 1: Capacidades */}
              {activeTab === 'capacidades' && (
                <motion.div
                  key="capacidades"
                  initial={{ opacity: 0, y: 30, filter: "blur(15px)", scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -30, filter: "blur(15px)", scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="text-center mb-16">
                    <h2 className="font-headline-lg text-4xl lg:text-5xl font-bold text-primary mb-6">¿Cómo protegemos a tu familia?</h2>
                    <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-lg">Durante un accidente, las instituciones de auxilio pueden acceder a tu contacto de emergencia en cuestión de milisegundos usando la app SIRE.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white border border-outline-variant/60 rounded-[2rem] p-10 group hover-lift relative overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] group-hover:bg-secondary/15 transition-all duration-700 pointer-events-none"></div>
                      <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-8 border border-outline-variant/50 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                      </div>
                      <h4 className="font-headline-md text-2xl mb-4 text-primary font-bold relative z-10">Identidad Segura e Inmediata</h4>
                      <p className="text-body-lg text-on-surface-variant leading-relaxed m-0 relative z-10">
                        Nuestro motor biométrico reconoce a tu ser querido incluso si está inconsciente o desorientado, proporcionando nombre y datos básicos para asegurar que reciban la atención correcta desde el primer segundo.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-outline-variant/60 rounded-[2rem] p-10 group hover-lift relative overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-all duration-700 pointer-events-none"></div>
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-blue-500 text-3xl">emergency_share</span>
                      </div>
                      <h4 className="font-headline-md text-2xl mb-4 text-primary font-bold relative z-10">Contacto Familiar al Instante</h4>
                      <p className="text-body-lg text-on-surface-variant leading-relaxed m-0 relative z-10">
                        Llamada y alerta inmediata a ti y a la red de cuidado. Si tú no puedes contestar, el sistema notifica automáticamente a los demás responsables de forma bidireccional.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2: Casos de Uso */}
              {activeTab === 'casos' && (
                <motion.div
                  key="casos"
                  initial={{ opacity: 0, y: 30, filter: "blur(15px)", scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -30, filter: "blur(15px)", scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full relative"
                >
                  <div className="mb-16 text-center md:text-left">
                    <h2 className="font-headline-lg text-4xl font-bold text-primary mb-4">Protección en cada situación</h2>
                    <p className="font-body-md text-on-surface-variant text-lg max-w-2xl">Nuestra tecnología se adapta para brindar la respuesta correcta cuando más se necesita, cubriendo todas las eventualidades.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: 'car_crash', bg: 'bg-[#F1F5F9]', iconColor: 'text-primary', title: 'Accidentes de Tránsito', desc: 'Identificación inmediata y contacto con familiares cuando cada segundo cuenta en la vía.' },
                      { icon: 'elderly', bg: 'bg-orange-50', iconColor: 'text-secondary', title: 'Personas Desorientadas', desc: 'Ayuda humanitaria para adultos mayores o personas con condiciones cognitivas que necesitan volver a casa.' },
                      { icon: 'volcano', bg: 'bg-[#F1F5F9]', iconColor: 'text-primary', title: 'Desastres Naturales', desc: 'Localización y estado de salud de seres queridos cuando las redes de comunicación tradicionales fallan.' }
                    ].map((caso, i) => (
                      <div
                        key={i}
                        className="p-8 bg-white border border-outline-variant/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-outline-variant/20 ${caso.bg} ${caso.iconColor} relative z-10`}>
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{caso.icon}</span>
                        </div>
                        <h4 className="font-headline-md text-xl font-bold text-primary mb-3 relative z-10">{caso.title}</h4>
                        <p className="text-body-sm text-on-surface-variant m-0 leading-relaxed relative z-10">{caso.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}



            </AnimatePresence>
          </div>
        </section>

        {/* Bento Grid for Confidence & Transparency */}
        <section className="py-32 bg-white" id="seguridad">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16 reveal">
              <h2 className="font-headline-lg text-3xl font-bold text-primary mb-4">Confianza y Transparencia</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Tecnología SIRE: diseñada exclusivamente para ayudar, con límites éticos inquebrantables.</p>
            </div>
            <div
              ref={bentoRef}
              onMouseMove={handleBentoMouseMove}
              className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 reveal relative group/bento"
            >
              {/* Main Hero Card in Bento */}
              <div className="md:col-span-4 lg:col-span-3 bg-primary text-on-primary p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between hover-lift shadow-2xl group">
                {/* Spotlight Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)' }} />
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-secondary text-3xl">verified_user</span>
                  </div>
                  <h3 className="font-headline-lg text-2xl font-bold text-white mb-6">Tú tienes el control total</h3>
                  <p className="text-slate-300 font-body-md leading-relaxed mb-8">
                    El movimiento #YoCuidoMiFamilia te permite registrar voluntariamente los datos de tu red. Tú decides a quién debe notificar la app SIRE en caso de incidentes.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-secondary font-bold text-sm bg-white/5 p-4 rounded-2xl border border-white/10 w-fit">
                  <span className="material-symbols-outlined">gavel</span>
                  ÉTICA POR DISEÑO
                </div>
              </div>
              {/* Side Card: Privacy */}
              <div className="md:col-span-2 lg:col-span-3 bg-surface-container border border-outline-variant p-8 rounded-[2.5rem] hover-lift flex flex-col justify-between group overflow-hidden relative">
                {/* Spotlight Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234,88,12,0.08), transparent 40%)' }} />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-6 group-hover:scale-110 transition-transform block">privacy_tip</span>
                  <h4 className="font-headline-md text-xl font-bold text-primary mb-4">Privacidad Absoluta</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed m-0">
                    Tus datos familiares son sagrados. Nunca se venderán ni se compartirán para fines publicitarios o comerciales. Solo para emergencias reales.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-success-accent font-bold text-xs uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-success-accent animate-pulse"></span>
                  Encriptación Activa
                </div>
              </div>
              {/* Bottom Bento Items */}
              <div className="md:col-span-2 lg:col-span-2 bg-white border border-outline-variant p-8 rounded-[2.5rem] hover-lift shadow-sm relative overflow-hidden group">
                {/* Spotlight Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234,88,12,0.05), transparent 40%)' }} />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-3xl mb-4 bg-primary/5 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">security</span>
                  <h4 className="font-headline-md text-lg font-bold text-primary mb-2">Solo Emergencias</h4>
                  <p className="text-body-sm text-on-surface-variant m-0">El sistema es estrictamente consultivo y solo se activa en situaciones de riesgo validadas.</p>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-2 bg-white border border-outline-variant p-8 rounded-[2.5rem] hover-lift shadow-sm relative overflow-hidden group">
                {/* Spotlight Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234,88,12,0.05), transparent 40%)' }} />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary text-3xl mb-4 bg-primary/5 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">database</span>
                  <h4 className="font-headline-md text-lg font-bold text-primary mb-2">Almacenamiento Seguro</h4>
                  <p className="text-body-sm text-on-surface-variant m-0">Infraestructura de grado institucional con los más altos estándares de protección de datos.</p>
                </div>
              </div>
              <div className="md:col-span-4 lg:col-span-2 bg-secondary/5 border border-secondary/20 p-8 rounded-[2.5rem] hover-lift flex flex-col justify-center relative overflow-hidden group">
                {/* Spotlight Overlay */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234,88,12,0.08), transparent 40%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                    </div>
                    <span className="font-bold text-primary">Propósito Noble</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant m-0">Nuestra misión es unir familias, no vigilar. Cada línea de código está escrita con empatía.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-32 relative overflow-hidden bg-white">
          <div className="max-w-container-max mx-auto px-margin-desktop text-center relative z-10 reveal">
            <h2 className="font-headline-xl text-[48px] font-bold text-primary mb-8 leading-tight">
              Protege lo que más amas.<br />
              Súmate a <motion.span
                animate={{ textShadow: ["0px 0px 0px rgba(234,88,12,0)", "0px 0px 30px rgba(234,88,12,0.8)", "0px 0px 0px rgba(234,88,12,0)"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-orange-500 to-[#FBBF24] inline-block"
              >
                #YoCuidoMiFamilia
              </motion.span>.
            </h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
              Un acto de amor preventivo para que las instituciones médicas y de rescate sepan a quién llamar si ocurre un accidente. El registro de tu familia es 100% gratuito.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                ref={ctaRef}
                onMouseMove={handleCtaMouseMove}
                onMouseLeave={handleCtaMouseLeave}
                animate={{ x: ctaPosition.x, y: ctaPosition.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                onClick={() => navigate('/auth')}
                className="bg-secondary text-on-secondary px-12 py-5 rounded-2xl font-label-md text-xl font-bold transition-shadow hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] shadow-2xl shadow-secondary/30 border-none cursor-pointer"
              >
                Registrar a mi Familia Ahora
              </motion.button>
            </div>
            <p className="mt-12 text-body-sm text-on-surface-variant flex items-center justify-center gap-2 opacity-70 m-0">
              <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              Una iniciativa ciudadana respaldada por tecnología segura (SIRE)
            </p>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="w-full relative bg-[#0B1120] text-slate-300 overflow-hidden border-t border-white/5 pt-20 pb-10 mt-auto">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent blur-[100px] rounded-full" />
        </div>

        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

            {/* Brand Column (takes up 5 cols on large screens) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(179,75,40,0.3)]">
                  <span className="material-symbols-outlined text-white font-bold text-2xl">family_restroom</span>
                </div>
                <div className="text-headline-md font-extrabold text-2xl tracking-tight">
                  <span className="text-white">
                    #YoCuido<span className="text-secondary">MiFamilia</span>
                  </span>
                </div>
              </div>
              <p className="font-Inter text-body-md text-slate-400 max-w-sm leading-relaxed m-0">
                El canal de enlace entre las familias y las instituciones de auxilio durante una emergencia. Registra a los tuyos y crea tu red de contacto ante accidentes.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4 mt-2">
                {[
                  { icon: 'public', link: '#' },
                  { icon: 'photo_camera', link: '#' },
                  { icon: 'play_arrow', link: '#' }
                ].map((social, i) => (
                  <a key={i} href={social.link} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary hover:shadow-[0_0_15px_rgba(179,75,40,0.5)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                    <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-white transition-colors">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-2 md:col-span-1">
              <h4 className="text-white font-bold mb-6 font-headline-sm tracking-wide text-sm uppercase">Explorar</h4>
              <ul className="flex flex-col gap-4 p-0 m-0 list-none">
                {['Cómo Funciona', 'Características', 'Casos de Uso', 'Planes'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-secondary hover:translate-x-1 inline-block transition-all text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 md:col-span-1">
              <h4 className="text-white font-bold mb-6 font-headline-sm tracking-wide text-sm uppercase">Recursos</h4>
              <ul className="flex flex-col gap-4 p-0 m-0 list-none">
                {['Blog de Seguridad', 'Guía de Emergencias', 'Preguntas Frecuentes', 'Soporte 24/7'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-secondary hover:translate-x-1 inline-block transition-all text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-3 md:col-span-2">
              <h4 className="text-white font-bold mb-6 font-headline-sm tracking-wide text-sm uppercase">Mantente Seguro</h4>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Únete para recibir consejos vitales sobre seguridad familiar y prevención de emergencias.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-secondary focus:bg-white/10 transition-all"
                />
                <button className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white p-3 rounded-xl transition-colors cursor-pointer border-none flex items-center justify-center shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

          {/* Bottom Footer Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-Inter text-xs sm:text-sm text-center md:text-left text-slate-500 m-0">
              © {new Date().getFullYear()} #YoCuidoMiFamilia. Impulsado éticamente por <span className="font-bold text-slate-300">Tecnología SIRE</span>.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos Legales</a>
              <a href="#" className="hover:text-white flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                Ética de Datos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
