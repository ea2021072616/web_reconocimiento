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
            <span className="font-bold text-[#b34b28] text-xl">
              #YoCuidoMiFamilia
            </span>
          </div>
          <nav className="flex items-center gap-3 lg:gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 max-w-[40%] md:max-w-none">
            <button onClick={() => handleScrollTo('#como-funciona')} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-[#b34b28] transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Cómo Funciona
            </button>
            <button onClick={() => { setActiveTab('capacidades'); handleScrollTo('#caracteristicas'); }} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-[#b34b28] transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Características
            </button>
            <button onClick={() => { setActiveTab('casos'); handleScrollTo('#caracteristicas'); }} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-[#b34b28] transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Casos de Uso
            </button>
            <button onClick={() => handleScrollTo('#seguridad')} className="font-Inter font-medium text-[11px] lg:text-sm text-on-surface-variant hover:text-[#b34b28] transition-colors cursor-pointer bg-transparent border-none shrink-0">
              Seguridad
            </button>
          </nav>
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => navigate('/auth')} className="text-[#b34b28] px-3 py-2 lg:px-5 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm border border-[#b34b28] hover:bg-[#b34b28]/5 transition-all cursor-pointer bg-transparent">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/auth', { state: { view: 'register' } })} className="bg-[#b34b28] text-white px-3 py-2 lg:px-6 lg:py-2.5 rounded-full font-semibold text-xs lg:text-sm hover:bg-[#9a3d1e] transition-all cursor-pointer border-none shadow-sm">
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
          className="relative min-h-[750px] flex items-center bg-[#F8FAFC] overflow-hidden"
          style={{ perspective: 2000 }}
        >
          {/* Peachy/Orange Gradient Background */}
          <div className="absolute top-0 left-0 w-[60%] h-full bg-gradient-to-br from-[#FFE5D9]/80 via-[#F8FAFC] to-[#F8FAFC] pointer-events-none" />
          
          <div className="max-w-container-max mx-auto px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-16">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start max-w-xl"
            >
              <h1 className="font-headline-xl text-[48px] lg:text-[64px] leading-[1.15] font-bold tracking-tight text-[#1E293B] mb-6">
                Protege a quienes<br/>
                más <span className="text-[#b34b28]">quieres</span>
              </h1>
              <p className="font-body-lg text-lg text-slate-500 mb-10 max-w-md leading-relaxed">
                El primer movimiento ciudadano que garantiza que tus seres queridos sean identificados y atendidos en segundos durante cualquier emergencia.
              </p>
              
              <button onClick={() => navigate('/auth', { state: { view: 'register' } })} className="bg-[#b34b28] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#9a3d1e] transition-all flex items-center gap-3 border-none cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Empezar Red Familiar
                <span className="material-symbols-outlined text-white text-xl">arrow_forward</span>
              </button>
              
              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-full h-full object-cover"/></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-full h-full object-cover"/></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" className="w-full h-full object-cover"/></div>
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-700 m-0 leading-tight">Únete a +10,000</p>
                  <p className="text-slate-500 m-0 leading-tight">familias protegidas</p>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[450px] lg:h-[550px] w-full mt-10 lg:mt-0"
            >
              {/* Family Image */}
              <img 
                src="https://images.unsplash.com/photo-1542044896530-05d85be9b11a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Familia protegida" 
                className="w-full h-full object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/40">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium m-0 leading-tight mb-0.5">Respuesta en</p>
                  <p className="text-sm text-[#b34b28] font-bold m-0 leading-tight">Segundos</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Cómo Funciona Section */}
        <section className="py-24 bg-white border-t border-outline-variant/30 overflow-hidden" id="como-funciona">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16 reveal">
              <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full font-label-md text-sm mb-4">
                Cómo funciona
              </span>
              <h2 className="font-headline-lg text-4xl lg:text-5xl font-bold text-primary mb-4">Un proceso diseñado para la calma</h2>
              <p className="font-body-md text-on-surface-variant text-lg max-w-2xl mx-auto">Simple, seguro y efectivo en tres pasos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Steps (Left Side) */}
              <div className="flex flex-col gap-6 reveal">
                {/* Step 1 */}
                <div 
                  onMouseEnter={() => setActiveProcessStep(0)}
                  className={`relative group flex gap-6 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 0 ? 'bg-gradient-to-br from-amber-50 to-white shadow-lg border-amber-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-amber-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div 
                    initial={false}
                    animate={{ width: activeProcessStep === 0 ? 6 : 0, opacity: activeProcessStep === 0 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-amber-500 rounded-r-full"
                  />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 0 ? 'bg-amber-500 border-amber-600 shadow-md scale-110' : 'bg-amber-50 border-amber-100 group-hover:bg-amber-100'}`}>
                    <span className={`material-symbols-outlined text-3xl transition-colors ${activeProcessStep === 0 ? 'text-white' : 'text-amber-500'}`}>app_registration</span>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-xl font-bold mb-2 flex items-center gap-3 transition-colors ${activeProcessStep === 0 ? 'text-amber-700' : 'text-primary'}`}>
                      <span className={`font-bold text-lg transition-colors ${activeProcessStep === 0 ? 'text-amber-400' : 'text-primary/30'}`}>01.</span> Registra
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-base">
                      Crea un perfil detallado con fotos, condiciones médicas, contactos de emergencia y señas particulares.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div 
                  onMouseEnter={() => setActiveProcessStep(1)}
                  className={`relative group flex gap-6 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 1 ? 'bg-gradient-to-br from-blue-50 to-white shadow-lg border-blue-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-blue-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div 
                    initial={false}
                    animate={{ width: activeProcessStep === 1 ? 6 : 0, opacity: activeProcessStep === 1 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-blue-500 rounded-r-full"
                  />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 1 ? 'bg-blue-500 border-blue-600 shadow-md scale-110' : 'bg-blue-50 border-blue-100 group-hover:bg-blue-100'}`}>
                    <span className={`material-symbols-outlined text-3xl transition-colors ${activeProcessStep === 1 ? 'text-white' : 'text-blue-500'}`}>search</span>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-xl font-bold mb-2 flex items-center gap-3 transition-colors ${activeProcessStep === 1 ? 'text-blue-700' : 'text-primary'}`}>
                      <span className={`font-bold text-lg transition-colors ${activeProcessStep === 1 ? 'text-blue-400' : 'text-primary/30'}`}>02.</span> Identifica
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-base">
                      Los rescatistas utilizan nuestra red segura para cotejar datos biométricos en situaciones de riesgo.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div 
                  onMouseEnter={() => setActiveProcessStep(2)}
                  className={`relative group flex gap-6 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${activeProcessStep === 2 ? 'bg-gradient-to-br from-green-50 to-white shadow-lg border-green-200 scale-[1.02] z-10' : 'bg-surface-container/30 border-outline-variant/40 hover:bg-white hover:border-green-100'}`}
                >
                  {/* Animated Left Indicator */}
                  <motion.div 
                    initial={false}
                    animate={{ width: activeProcessStep === 2 ? 6 : 0, opacity: activeProcessStep === 2 ? 1 : 0 }}
                    className="absolute left-0 top-6 bottom-6 bg-green-500 rounded-r-full"
                  />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 ${activeProcessStep === 2 ? 'bg-green-500 border-green-600 shadow-md scale-110' : 'bg-green-50 border-green-100 group-hover:bg-green-100'}`}>
                    <span className={`material-symbols-outlined text-3xl transition-colors ${activeProcessStep === 2 ? 'text-white' : 'text-green-500'}`}>groups</span>
                  </div>
                  <div>
                    <h4 className={`font-headline-md text-xl font-bold mb-2 flex items-center gap-3 transition-colors ${activeProcessStep === 2 ? 'text-green-700' : 'text-primary'}`}>
                      <span className={`font-bold text-lg transition-colors ${activeProcessStep === 2 ? 'text-green-400' : 'text-primary/30'}`}>03.</span> Reconecta
                    </h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed m-0 text-base">
                      Recibe una notificación inmediata con la ubicación exacta y el estado de tu familiar para un reencuentro seguro.
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
                   className="relative mx-auto w-full max-w-[340px] h-[680px] bg-[#0F172A] rounded-[3rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col"
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
                          <motion.div key="step0" initial={{opacity:0, x: 30}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -30}} transition={{duration:0.4, type: "spring", bounce: 0.2}} className="flex-1 bg-slate-50 flex flex-col relative w-full h-full">
                            {/* Header */}
                            <div className="pt-12 pb-4 px-6 bg-white border-b border-slate-200 shadow-sm z-10">
                              <h3 className="font-bold text-lg text-slate-800 m-0 text-center">Perfil de Familiar</h3>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-5 overflow-y-auto scrollbar-hide flex flex-col gap-5">
                              {/* Photo Upload */}
                              <div className="flex flex-col items-center gap-2 mt-2">
                                <div className="w-28 h-28 rounded-full bg-slate-100 border-[3px] border-dashed border-amber-300 flex items-center justify-center text-amber-400 relative overflow-hidden shadow-inner bg-amber-50/50">
                                  <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                  <motion.div 
                                    animate={{ y: ["100%", "-100%"] }} 
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent"
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Añadir foto facial</span>
                              </div>
                              
                              {/* Form Fields */}
                              <div className="flex flex-col gap-3 mt-4">
                                <div className="h-12 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm hover:border-amber-300 transition-colors">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                   <div className="h-3 w-32 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="h-12 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm hover:border-amber-300 transition-colors">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                                   <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="h-12 bg-white rounded-xl border border-slate-200 px-3 flex items-center gap-3 shadow-sm hover:border-amber-300 transition-colors">
                                   <span className="material-symbols-outlined text-slate-400 text-sm">cake</span>
                                   <div className="h-3 w-28 bg-slate-200 rounded-full"></div>
                                </div>
                              </div>
                              
                              {/* Medical Info */}
                              <div className="mt-4">
                                <span className="text-[10px] font-bold text-slate-500 mb-3 block uppercase tracking-wider">Condiciones Médicas</span>
                                <div className="flex flex-wrap gap-2">
                                  <div className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">Hipertensión</div>
                                  <div className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">Alergia Penicilina</div>
                                  <div className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">Alzheimer</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bottom Button */}
                            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
                              <div className="w-full py-3.5 bg-amber-500 rounded-xl text-white text-center font-bold text-sm shadow-[0_4px_15px_rgba(245,158,11,0.3)] cursor-pointer hover:bg-amber-600 transition-colors">
                                Guardar Perfil
                              </div>
                            </div>
                          </motion.div>
                      )}
                      
                      {activeProcessStep === 1 && (
                          <motion.div key="step1" initial={{opacity:0, x: 30}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -30}} transition={{duration:0.4, type: "spring", bounce: 0.2}} className="flex-1 bg-[#1a1a1a] flex flex-col relative w-full h-full overflow-hidden">
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
                                  <div className="absolute inset-0 bg-gradient-to-b from-[#e56846] via-[#d45634] to-[#7b2c16]"></div>
                                  {/* Placeholder person face silhouette */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                                      <span className="material-symbols-outlined text-black text-[220px] -mt-10">face</span>
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
                                  className="w-20 h-20 rounded-full bg-[#4285F4] flex items-center justify-center shadow-[0_0_35px_rgba(66,133,244,0.6)] cursor-pointer border-[3px] border-white/20 hover:bg-blue-500 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-white text-4xl ml-1" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
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
                          <motion.div key="step2" initial={{opacity:0, x: 30}} animate={{opacity:1, x: 0}} exit={{opacity:0, x: -30}} transition={{duration:0.4, type: "spring", bounce: 0.2}} className="flex-1 bg-[#0F172A] flex flex-col relative w-full h-full pt-10">
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
                                 <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} transition={{delay: 0.4}} className="bg-white border border-outline-variant/40 rounded-2xl p-3 shadow-sm flex flex-col gap-3">
                                   <div className="flex gap-3">
                                     <div className="w-20 h-24 bg-surface-container rounded-lg border border-outline-variant/50 flex flex-col items-center justify-end shrink-0 overflow-hidden relative">
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 absolute -bottom-2">person</span>
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
                                        <span className="font-bold">Notificación Automática:</span> Red familiar alertada con ubicación exacta GPS en tiempo real.
                                      </p>
                                   </div>
                                 </motion.div>
                                 
                               </div>

                               {/* Fixed Bottom Action Bar */}
                               <div className="absolute bottom-4 left-4 right-4 bg-green-600 rounded-2xl py-3.5 flex justify-center items-center gap-2 text-white shadow-[0_8px_20px_rgba(22,163,74,0.3)] cursor-pointer hover:bg-green-700 transition-colors">
                                  <span className="material-symbols-outlined text-lg">support_agent</span>
                                  <span className="font-bold text-sm tracking-wide">CONTACTAR FAMILIAR</span>
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
                  className={`relative z-10 px-8 py-3 rounded-full font-label-md transition-all cursor-pointer border-none ${activeTab === 'capacidades' ? 'bg-primary text-white shadow-md scale-105' : 'bg-transparent text-on-surface-variant hover:text-primary hover:bg-black/5'}`}
                >
                  Capacidades
                </button>
                <button
                  onClick={() => setActiveTab('casos')}
                  className={`relative z-10 px-8 py-3 rounded-full font-label-md transition-all cursor-pointer border-none ${activeTab === 'casos' ? 'bg-primary text-white shadow-md scale-105' : 'bg-transparent text-on-surface-variant hover:text-primary hover:bg-black/5'}`}
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
                    <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto text-lg">En el momento que más se necesita, los rescatistas pueden acceder a la información vital que tú has decidido compartir, en cuestión de milisegundos.</p>
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

                    {/* Card 3 */}
                    <div className="bg-white border border-outline-variant/60 rounded-[2rem] p-10 group hover-lift relative overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-error-accent/5 rounded-full blur-[60px] group-hover:bg-error-accent/10 transition-all duration-700 pointer-events-none"></div>
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 border border-red-100 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-error-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                      </div>
                      <h4 className="font-headline-md text-2xl mb-4 text-primary font-bold relative z-10">Cuidado Médico Vital</h4>
                      <p className="text-body-lg text-on-surface-variant leading-relaxed m-0 relative z-10">
                        Alergias severas, tipo de sangre, medicamentos y condiciones cognitivas importantes se vuelven visibles para los paramédicos de forma inmediata para una atención compasiva.
                      </p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white border border-outline-variant/60 rounded-[2rem] p-10 group hover-lift relative overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-success-accent/5 rounded-full blur-[60px] group-hover:bg-success-accent/10 transition-all duration-700 pointer-events-none"></div>
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                        <span className="material-symbols-outlined text-success-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      </div>
                      <h4 className="font-headline-md text-2xl mb-4 text-primary font-bold relative z-10">Reunificación Inteligente</h4>
                      <p className="text-body-lg text-on-surface-variant leading-relaxed m-0 relative z-10">
                        Geolocalización segura del punto de emergencia. Recibirás un mapa exacto para saber dónde está tu ser querido y cómo llegar lo antes posible.
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
                    El movimiento #YoCuidoMiFamilia se basa en el respeto. Tú decides qué información compartir y quiénes son tus contactos de emergencia.
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
              Un acto de amor preventivo por la seguridad de tus seres queridos. El registro en la comunidad es totalmente gratuito.
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#b34b28]/30 to-transparent blur-[100px] rounded-full" />
        </div>

        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column (takes up 5 cols on large screens) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-gradient-to-br from-[#b34b28] to-[#ea580c] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(179,75,40,0.3)]">
                   <span className="material-symbols-outlined text-white font-bold text-2xl">family_restroom</span>
                 </div>
                 <div className="text-headline-md font-extrabold text-2xl tracking-tight">
                   <span className="text-white">
                     #YoCuido<span className="text-[#b34b28]">MiFamilia</span>
                   </span>
                 </div>
              </div>
              <p className="font-Inter text-body-md text-slate-400 max-w-sm leading-relaxed m-0">
                Dando voz a los que más quieres cuando no pueden hablar. Transformamos la tecnología en un escudo protector para cada familia, asegurando que nadie se enfrente a una emergencia en soledad.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4 mt-2">
                {[
                  { icon: 'public', link: '#' },
                  { icon: 'photo_camera', link: '#' },
                  { icon: 'play_arrow', link: '#' }
                ].map((social, i) => (
                  <a key={i} href={social.link} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#b34b28] hover:border-[#b34b28] hover:shadow-[0_0_15px_rgba(179,75,40,0.5)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
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
                    <a href="#" className="text-slate-400 hover:text-[#b34b28] hover:translate-x-1 inline-block transition-all text-sm font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 md:col-span-1">
              <h4 className="text-white font-bold mb-6 font-headline-sm tracking-wide text-sm uppercase">Recursos</h4>
              <ul className="flex flex-col gap-4 p-0 m-0 list-none">
                {['Blog de Seguridad', 'Guía de Emergencias', 'Preguntas Frecuentes', 'Soporte 24/7'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-[#b34b28] hover:translate-x-1 inline-block transition-all text-sm font-medium">{item}</a>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#b34b28] focus:bg-white/10 transition-all"
                />
                <button className="w-full sm:w-auto bg-[#b34b28] hover:bg-[#9a3d1e] text-white p-3 rounded-xl transition-colors cursor-pointer border-none flex items-center justify-center shrink-0 shadow-lg">
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
