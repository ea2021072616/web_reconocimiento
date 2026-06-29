import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
export function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'capacidades' | 'casos' | 'proceso'>('capacidades');

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
          <div className="text-headline-md font-headline-md text-primary tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C96442] via-[#0F172A] to-[#C96442] brand-text-animated">
              #YoCuidoMiFamilia
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-gutter">
            <button onClick={() => handleScrollTo('#que-hace')} className="font-Inter text-label-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none">
              Capacidades
            </button>
            <button onClick={() => handleScrollTo('#seguridad')} className="font-Inter text-label-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none">
              Confianza
            </button>
            <button onClick={() => handleScrollTo('#casos')} className="font-Inter text-label-md text-on-surface-variant hover:text-secondary transition-colors cursor-pointer bg-transparent border-none">
              Situaciones
            </button>
          </nav>
          <button onClick={() => navigate('/auth')} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md hover:bg-primary/90 transition-all active:scale-95 border-none cursor-pointer">
            Unirme al Movimiento
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative min-h-[800px] flex items-center bg-background overflow-hidden pt-20"
          style={{ perspective: 2000 }}
        >
          {/* Animated Background Orbs (Light Mode) */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"
          />

          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-headline-xl text-[56px] lg:text-[64px] leading-[1.1] font-bold tracking-tight text-primary mb-6 flex flex-wrap gap-x-4">
                {"Protege a quienes más quieres".split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1, type: "spring", stiffness: 100 }}
                    style={{ originY: 1 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <p className="font-body-lg text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                El primer movimiento ciudadano que garantiza que tus seres queridos sean identificados, atendidos y tú notificado en segundos durante cualquier emergencia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-secondary to-[#ea580c] text-white px-8 py-4 rounded-2xl font-label-md text-lg hover:shadow-[0_0_25px_rgba(201,100,66,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 border-none cursor-pointer">
                  Empezar Red Familiar
                  <span className="material-symbols-outlined text-white">arrow_forward</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative lg:ml-8 mt-12 lg:mt-0"
            >
              {/* Dynamic Aura */}
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute inset-0 m-auto w-[120%] h-[120%] rounded-full blur-[60px] -z-10"
                style={{ background: 'conic-gradient(from 0deg, transparent, rgba(234,88,12,0.3), transparent, rgba(34,197,94,0.3), transparent)' }}
              />

              {/* Phone Mockup */}
               <div 
                 className="relative mx-auto w-full max-w-[340px] h-[680px] bg-[#0F172A] rounded-[3rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col"
                 style={{ transform: "translateZ(50px)" }}
               >
                 {/* Status Bar */}
                 <div className="flex justify-between items-center px-6 pt-4 pb-2 text-white/90 text-[11px] font-medium">
                   <span>2:57</span>
                   <div className="flex gap-1.5 items-center">
                      <span className="material-symbols-outlined text-[13px]">signal_cellular_4_bar</span>
                      <span className="material-symbols-outlined text-[13px]">wifi</span>
                      <span className="material-symbols-outlined text-[13px]">battery_full</span>
                   </div>
                 </div>

                 {/* Header */}
                 <div className="flex items-center gap-4 px-4 py-3 text-white">
                   <span className="material-symbols-outlined cursor-pointer text-lg">arrow_back_ios_new</span>
                   <h3 className="font-headline-sm font-bold text-lg m-0 flex-1 text-center pr-6">Resultados Biométricos</h3>
                 </div>

                 {/* Success Banner */}
                 <div className="flex flex-col items-center pt-2 pb-6 text-white px-4 text-center">
                   <div className="w-14 h-14 bg-success-accent rounded-full flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                     <span className="material-symbols-outlined text-white text-3xl font-bold">check</span>
                   </div>
                   <h2 className="font-bold text-xl mb-1">¡Identificación Completada!</h2>
                   <p className="text-white/70 text-xs">Se encontró 5 coincidencia(s) en la base de datos.</p>
                 </div>

                 {/* Content area (White background) */}
                 <div className="flex-1 bg-white w-full rounded-t-3xl p-4 overflow-hidden flex flex-col gap-4 relative">
                   {/* Scrollable container */}
                   <div className="absolute inset-0 overflow-y-auto p-4 pb-20 flex flex-col gap-4 scrollbar-hide">
                     {/* Biometric Card 1 */}
                     <div className="bg-white border border-outline-variant/40 rounded-2xl p-3 shadow-sm flex flex-col gap-3">
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
                            <div className="text-[10px] text-on-surface-variant leading-[1.3] flex flex-col">
                               <p className="m-0"><span className="font-bold text-primary/80">Apellidos:</span> LEYVA SARDON</p>
                               <p className="m-0"><span className="font-bold text-primary/80">Nombres:</span> ELVIS RONALD</p>
                               <p className="m-0"><span className="font-bold text-primary/80">F. Nac:</span> 28/01/2000 (26 años)</p>
                               <p className="m-0"><span className="font-bold text-primary/80">Género:</span> MASCULINO</p>
                               <p className="m-0"><span className="font-bold text-primary/80">Dpto:</span> TACNA</p>
                            </div>
                         </div>
                       </div>
                       <div className="bg-surface-container/60 rounded-md p-2 flex gap-1.5 items-start border border-outline-variant/30">
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">info</span>
                          <p className="text-[9px] text-on-surface-variant m-0 leading-tight">
                            <span className="font-bold">Estado:</span> Coincidencia biométrica exacta. Red familiar notificada de inmediato.
                          </p>
                       </div>
                     </div>
                     
                     {/* Biometric Card 2 (Cut off) */}
                     <div className="bg-white border border-outline-variant/40 rounded-2xl p-3 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                        <div className="flex gap-3">
                         <div className="w-20 h-24 bg-surface-container rounded-lg border border-outline-variant/50 flex flex-col items-center justify-end shrink-0 overflow-hidden relative">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 absolute -bottom-2">person</span>
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1.5">
                               <span className="font-bold text-primary text-sm">48105566</span>
                               <span className="flex items-center gap-1 bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span> MODERADA
                               </span>
                            </div>
                            <div className="text-[10px] text-on-surface-variant leading-[1.3] flex flex-col">
                               <p className="m-0"><span className="font-bold text-primary/80">Apellidos:</span> No disponible</p>
                               <p className="m-0"><span className="font-bold text-primary/80">Nombres:</span> No disponible</p>
                            </div>
                         </div>
                       </div>
                       {/* Fade out gradient to simulate scrolling */}
                       <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
                     </div>
                   </div>

                   {/* Fixed Bottom Action Bar */}
                   <div className="absolute bottom-4 left-4 right-4 bg-[#0F172A] rounded-2xl py-3 flex justify-center items-center gap-2 text-white shadow-lg z-10 cursor-pointer">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      <span className="font-bold text-sm tracking-wide">FINALIZAR</span>
                   </div>
                 </div>

                 {/* Phone Bottom indicator line */}
                 <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-20 pointer-events-none"></div>
               </div>
            </motion.div>
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
                <button
                  onClick={() => setActiveTab('proceso')}
                  className={`relative z-10 px-8 py-3 rounded-full font-label-md transition-all cursor-pointer border-none ${activeTab === 'proceso' ? 'bg-primary text-white shadow-md scale-105' : 'bg-transparent text-on-surface-variant hover:text-primary hover:bg-black/5'}`}
                >
                  Cómo Funciona
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

              {/* SLIDE 3: Proceso */}
              {activeTab === 'proceso' && (
                <motion.div
                  key="proceso"
                  initial={{ opacity: 0, y: 30, filter: "blur(15px)", scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -30, filter: "blur(15px)", scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full relative"
                >
                  <div className="text-center mb-16">
                    <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1.5 rounded-full font-label-md text-sm mb-4">
                      Cómo funciona
                    </span>
                    <h2 className="font-headline-lg text-4xl font-bold text-primary mb-4">Un proceso diseñado para la calma</h2>
                    <p className="font-body-md text-on-surface-variant text-lg">Simple, seguro y efectivo en tres pasos.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

                    {/* Step 1 */}
                    <div className="relative group hover-lift">
                      <div className="text-9xl font-bold text-primary/5 absolute -top-8 -left-4 select-none transition-colors group-hover:text-secondary/10 pointer-events-none">01</div>
                      <div className="relative z-10 flex flex-col p-8 bg-white border border-outline-variant/40 rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all duration-300 h-full">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 group-hover:bg-secondary transition-colors duration-300">
                          <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white transition-colors">app_registration</span>
                        </div>
                        <h4 className="font-headline-md text-xl font-bold text-primary mb-3">Registra</h4>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed m-0">
                          Crea un perfil detallado con fotos, condiciones médicas, contactos de emergencia y señas particulares.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative group hover-lift">
                      <div className="text-9xl font-bold text-primary/5 absolute -top-8 -left-4 select-none transition-colors group-hover:text-secondary/10 pointer-events-none">02</div>
                      <div className="relative z-10 flex flex-col p-8 bg-white border border-outline-variant/40 rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all duration-300 h-full">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 group-hover:bg-secondary transition-colors duration-300">
                          <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white transition-colors">search</span>
                        </div>
                        <h4 className="font-headline-md text-xl font-bold text-primary mb-3">Identifica</h4>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed m-0">
                          Los rescatistas utilizan nuestra red segura para cotejar datos biométricos en situaciones de riesgo.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative group hover-lift">
                      <div className="text-9xl font-bold text-primary/5 absolute -top-8 -left-4 select-none transition-colors group-hover:text-secondary/10 pointer-events-none">03</div>
                      <div className="relative z-10 flex flex-col p-8 bg-white border border-outline-variant/40 rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all duration-300 h-full">
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 group-hover:bg-secondary transition-colors duration-300">
                          <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white transition-colors">groups</span>
                        </div>
                        <h4 className="font-headline-md text-xl font-bold text-primary mb-3">Reconecta</h4>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed m-0">
                          Recibe una notificación inmediata con la ubicación exacta y el estado de tu familiar para un reencuentro seguro.
                        </p>
                      </div>
                    </div>

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

      {/* Footer */}
      <footer className="w-full py-16 bg-primary text-slate-300">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-[#ea580c] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                  <span className="material-symbols-outlined text-white font-bold text-xl">favorite</span>
                </div>
                <div className="text-headline-md font-extrabold text-2xl tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-orange-400 to-[#FBBF24]">
                    #YoCuidoMiFamilia
                  </span>
                </div>
              </div>
              <p className="font-Inter text-body-sm max-w-sm m-0">
                Dando voz a los que más quieres cuando no pueden hablar. Tecnología al servicio del amor y la seguridad.
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-white/10 mb-8"></div>
          <p className="font-Inter text-body-sm text-center md:text-left opacity-60 m-0">
            © 2024 #YoCuidoMiFamilia. Impulsado éticamente por tecnología SIRE.
          </p>
        </div>
      </footer>
    </div>
  );
}
