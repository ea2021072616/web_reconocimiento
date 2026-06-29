import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

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
        <section className="relative min-h-[800px] flex items-center hero-gradient overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 reveal">
            <div className="z-10">
              <span className="inline-block bg-primary-fixed text-on-primary-fixed px-4 py-1 rounded-full font-label-md text-sm mb-6">
                Movimiento Ciudadano
              </span>
              <h1 className="font-headline-xl text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-headline-lg text-primary mb-6">
                Protege a quienes más quieres. <span className="text-secondary">Tranquilidad</span> para ti y los tuyos.
              </h1>
              <p className="font-body-lg text-lg text-on-surface-variant mb-10 max-w-lg">
                Únete a #YoCuidoMiFamilia. Mediante tecnología compasiva y segura (impulsada por SIRE),
                permitimos que en momentos de necesidad tus seres queridos sean atendidos y tú seas notificado
                de inmediato.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth')} className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md text-lg hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cta-pulse border-none cursor-pointer">
                  Registrar a mi Familia
                  <span className="material-symbols-outlined">favorite</span>
                </button>
                <button onClick={() => handleScrollTo('#que-hace')} className="border-2 border-outline-variant text-primary px-8 py-4 rounded-xl font-label-md text-lg hover:bg-white transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer">
                  Conoce la Tecnología
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-fixed rounded-full blur-3xl opacity-20"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-outline-variant">
                <img alt="Personal de emergencia utilizando tecnología de reconocimiento facial de forma profesional y empática" className="w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA98gW70ds3aAY30GtpXjyUUFnHJjMpbAGwdd1IHrx9mxuhZfM8vg3PLBPQP4MQmZzXt59J8kFBCFCRv6I2CxIf_PDxAGlBX8gNnrPDrzfZ7DEqqjj5V4DqCf6SGXXBTk7WaLhlCNhAcZFJMNo8zy1tiMWoiqC2NbZQTff64WVOpNyzfTWnOe2nulx82OI4mBbfI7FebL2D9G0k7tvhLlHlvb38C2AfcllcafWuqDKpDunspRgXm-m2n7wK8DQXY1gPQ7ZFoaPHhnOh" />
              </div>
              {/* Trust Badge */}
              <div className="absolute bottom-8 -left-8 z-20 glass-card p-6 rounded-2xl shadow-xl max-w-[240px] float-animation">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                  <span className="font-headline-md text-sm text-primary font-bold">Cuidado Empático</span>
                </div>
                <p className="text-body-sm text-on-surface-variant m-0">Conectando familias en momentos vulnerables con total privacidad.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Qué hace exactamente SIRE */}
        <section className="py-24 bg-white" id="que-hace">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-20 reveal">
              <h2 className="font-headline-lg text-3xl font-bold text-primary mb-4">¿Cómo protege el movimiento a tu familia?</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">En el momento que más se necesita, los rescatistas (utilizando la tecnología de SIRE) pueden acceder a la información vital que tú has decidido compartir.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter reveal">
              <div className="bg-white p-8 rounded-3xl border border-outline-variant hover:border-success-accent/40 transition-all text-center group shadow-sm hover-lift">
                <div className="w-16 h-16 bg-success-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-success-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                </div>
                <h4 className="font-headline-md text-lg mb-2 text-primary font-bold">Identidad Segura</h4>
                <p className="text-body-sm text-on-surface-variant m-0">Nombre y datos básicos para asegurar que reciban la atención correcta.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-outline-variant hover:border-secondary/40 transition-all text-center group shadow-sm hover-lift">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-3xl">emergency_share</span>
                </div>
                <h4 className="font-headline-md text-lg mb-2 text-primary font-bold">Contacto Familiar</h4>
                <p className="text-body-sm text-on-surface-variant m-0">Llamada inmediata a ti y a los contactos de confianza que hayas designado.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-outline-variant hover:border-error-accent/40 transition-all text-center group shadow-sm hover-lift">
                <div className="w-16 h-16 bg-error-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-error-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                </div>
                <h4 className="font-headline-md text-lg mb-2 text-primary font-bold">Cuidado Médico</h4>
                <p className="text-body-sm text-on-surface-variant m-0">Alergias, medicamentos y condiciones importantes para una atención compasiva.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-outline-variant hover:border-success-accent/40 transition-all text-center group shadow-sm hover-lift">
                <div className="w-16 h-16 bg-success-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-success-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <h4 className="font-headline-md text-lg mb-2 text-primary font-bold">Reunificación</h4>
                <p className="text-body-sm text-on-surface-variant m-0">Geolocalización segura para que sepas dónde está tu ser querido.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className="py-32 bg-surface-container" id="casos">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="mb-16 reveal">
              <h2 className="font-headline-lg text-3xl font-bold text-primary mb-2">Protección en cada situación</h2>
              <p className="font-body-md text-on-surface-variant">Nuestra tecnología se adapta para brindar la respuesta correcta cuando más se necesita.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal">
              {[
                { icon: 'car_crash', color: 'primary', title: 'Accidentes de Tránsito', desc: 'Identificación inmediata y contacto con familiares cuando cada segundo cuenta en la vía.' },
                { icon: 'medical_services', color: 'error-accent', title: 'Emergencias Médicas', desc: 'Acceso instantáneo a alergias y condiciones críticas para una atención médica precisa y segura.' },
                { icon: 'elderly', color: 'secondary', title: 'Personas Desorientadas', desc: 'Ayuda humanitaria para adultos mayores o personas con condiciones cognitivas que necesitan volver a casa.' },
                { icon: 'child_care', color: 'secondary', title: 'Niños Perdidos', desc: 'Reunificación familiar acelerada en espacios públicos mediante protocolos de seguridad validados.' },
                { icon: 'volcano', color: 'primary', title: 'Desastres Naturales', desc: 'Localización y estado de salud de seres queridos cuando las redes de comunicación tradicionales fallan.' }
              ].map((caso, i) => (
                <div key={i} className={`p-8 bg-white border border-outline-variant rounded-2xl hover-lift group ${caso.color === 'error-accent' ? 'border-l-4 border-l-error-accent' : caso.color === 'secondary' && i === 3 ? 'border-l-4 border-l-secondary' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${caso.color === 'error-accent' ? 'bg-error-accent/10 text-error-accent' : caso.color === 'secondary' && i === 3 ? 'bg-secondary/10 text-secondary' : 'bg-primary/5 group-hover:bg-primary group-hover:text-white'}`}>
                    <span className="material-symbols-outlined text-3xl">{caso.icon}</span>
                  </div>
                  <h4 className="font-headline-md text-lg font-bold text-primary mb-2">{caso.title}</h4>
                  <p className="text-body-sm text-on-surface-variant m-0">{caso.desc}</p>
                </div>
              ))}
              <div className="p-8 bg-primary text-on-primary rounded-2xl flex flex-col justify-center items-center text-center hover-lift relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent pointer-events-none"></div>
                <p className="font-headline-md text-lg font-bold mb-6 px-4 relative z-10">¿Representas a una comunidad u ONG?</p>
                <button className="bg-secondary text-white border-none cursor-pointer px-8 py-3 rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 relative z-10">
                  Impulsar el Movimiento
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Un proceso diseñado para la calma */}
        <section className="py-32 bg-surface-container overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-24 reveal">
              <h2 className="font-headline-lg text-3xl font-bold text-primary mb-4">Un proceso diseñado para la calma</h2>
              <p className="font-body-md text-on-surface-variant">Simple, seguro y efectivo en tres pasos.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              <div className="relative group reveal hover-lift step-connector">
                <div className="text-9xl font-bold text-primary/5 absolute -top-16 -left-6 select-none transition-colors group-hover:text-secondary/10">01</div>
                <div className="relative z-10 flex flex-col items-center md:items-start p-2">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 border border-outline-variant group-hover:border-secondary transition-all group-hover:bg-secondary group-hover:text-white group-hover:scale-105">
                    <span className="material-symbols-outlined text-4xl group-hover:animate-pulse text-primary">app_registration</span>
                  </div>
                  <h4 className="font-headline-md text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors">Registra</h4>
                  <p className="text-body-sm text-on-surface-variant text-center md:text-left leading-relaxed m-0">
                    Crea un perfil detallado con fotos, condiciones médicas, contactos de emergencia y señas particulares.
                  </p>
                </div>
              </div>
              <div className="relative group reveal hover-lift step-connector">
                <div className="text-9xl font-bold text-primary/5 absolute -top-16 -left-6 select-none transition-colors group-hover:text-secondary/10">02</div>
                <div className="relative z-10 flex flex-col items-center md:items-start p-2">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 border border-outline-variant group-hover:border-secondary transition-all group-hover:bg-secondary group-hover:text-white group-hover:scale-105">
                    <span className="material-symbols-outlined text-4xl group-hover:animate-pulse text-primary">search</span>
                  </div>
                  <h4 className="font-headline-md text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors">Identifica</h4>
                  <p className="text-body-sm text-on-surface-variant text-center md:text-left leading-relaxed m-0">
                    Los rescatistas utilizan nuestra red segura para cotejar datos biométricos en situaciones de riesgo.
                  </p>
                </div>
              </div>
              <div className="relative group reveal hover-lift">
                <div className="text-9xl font-bold text-primary/5 absolute -top-16 -left-6 select-none transition-colors group-hover:text-secondary/10">03</div>
                <div className="relative z-10 flex flex-col items-center md:items-start p-2">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 border border-outline-variant group-hover:border-secondary transition-all group-hover:bg-secondary group-hover:text-white group-hover:scale-105">
                    <span className="material-symbols-outlined text-4xl group-hover:animate-pulse text-primary">groups</span>
                  </div>
                  <h4 className="font-headline-md text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors">Reconecta</h4>
                  <p className="text-body-sm text-on-surface-variant text-center md:text-left leading-relaxed m-0">
                    Recibe una notificación inmediata con la ubicación exacta y el estado de tu familiar para un reencuentro seguro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid for Confidence & Transparency */}
        <section className="py-32 bg-white" id="seguridad">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16 reveal">
              <h2 className="font-headline-lg text-3xl font-bold text-primary mb-4">Confianza y Transparencia</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Tecnología SIRE: diseñada exclusivamente para ayudar, con límites éticos inquebrantables.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 reveal">
              {/* Main Hero Card in Bento */}
              <div className="md:col-span-4 lg:col-span-3 bg-primary text-on-primary p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between hover-lift shadow-2xl">
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
              <div className="md:col-span-2 lg:col-span-3 bg-surface-container border border-outline-variant p-8 rounded-[2.5rem] hover-lift flex flex-col justify-between group">
                <div>
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
              <div className="md:col-span-2 lg:col-span-2 bg-white border border-outline-variant p-8 rounded-[2.5rem] hover-lift shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 bg-primary/5 w-12 h-12 flex items-center justify-center rounded-xl">security</span>
                <h4 className="font-headline-md text-lg font-bold text-primary mb-2">Solo Emergencias</h4>
                <p className="text-body-sm text-on-surface-variant m-0">El sistema es estrictamente consultivo y solo se activa en situaciones de riesgo validadas.</p>
              </div>
              <div className="md:col-span-2 lg:col-span-2 bg-white border border-outline-variant p-8 rounded-[2.5rem] hover-lift shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 bg-primary/5 w-12 h-12 flex items-center justify-center rounded-xl">database</span>
                <h4 className="font-headline-md text-lg font-bold text-primary mb-2">Almacenamiento Seguro</h4>
                <p className="text-body-sm text-on-surface-variant m-0">Infraestructura de grado institucional con los más altos estándares de protección de datos.</p>
              </div>
              <div className="md:col-span-4 lg:col-span-2 bg-secondary/5 border border-secondary/20 p-8 rounded-[2.5rem] hover-lift flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                  </div>
                  <span className="font-bold text-primary">Propósito Noble</span>
                </div>
                <p className="text-body-sm text-on-surface-variant m-0">Nuestra misión es unir familias, no vigilar. Cada línea de código está escrita con empatía.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-32 relative overflow-hidden bg-white">
          <div className="max-w-container-max mx-auto px-margin-desktop text-center relative z-10 reveal">
            <h2 className="font-headline-xl text-[48px] font-bold text-primary mb-8 leading-tight">
              Protege lo que más amas.<br />Súmate a #YoCuidoMiFamilia.
            </h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
              Un acto de amor preventivo por la seguridad de tus seres queridos. El registro en la comunidad es totalmente gratuito.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={() => navigate('/auth')} className="bg-secondary text-on-secondary px-12 py-5 rounded-2xl font-label-md text-xl font-bold hover:opacity-95 hover:scale-105 transition-all shadow-2xl shadow-secondary/30 cta-pulse border-none cursor-pointer">
                Registrar a mi Familia Ahora
              </button>
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
              <div className="text-headline-md font-bold text-white text-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-white">#YoCuidoMiFamilia</span>
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
