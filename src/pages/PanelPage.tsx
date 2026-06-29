import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { actualizarCuenta } from '../services/authService';
import { obtenerPersona, obtenerFamiliares, eliminarVinculoFamiliar, type PersonaData, type FamiliarData } from '../services/personaService';
import { obtenerContactos, eliminarContacto, type ContactoEmergencia } from '../services/contactoService';
import { RegistroPropio } from '../components/panel/RegistroPropio';
import { RegistroFamiliar } from '../components/panel/RegistroFamiliar';
import { ContactoEmergenciaForm } from '../components/panel/ContactoEmergencia';
import { FamiliarCard } from '../components/panel/FamiliarCard';
import { ContactoCard } from '../components/panel/ContactoCard';

type PanelView =
  | 'loading'
  | 'elegir-tipo'
  | 'registro-propio'
  | 'agregar-familiar'
  | 'editar-propio'
  | 'editar-familiar'
  | 'contacto-emergencia'
  | 'editar-contacto'
  | 'dashboard'
  | 'dashboard-add-more';

export function PanelPage() {
  const { usuario, isLoggedIn, logout, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<PanelView>('loading');
  const [titular, setTitular] = useState<PersonaData | null>(null);
  const [familiares, setFamiliares] = useState<FamiliarData[]>([]);
  const [contactos, setContactos] = useState<ContactoEmergencia[]>([]);
  const [familiarEditando, setFamiliarEditando] = useState<FamiliarData | null>(null);
  const [contactoEditando, setContactoEditando] = useState<ContactoEmergencia | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteContacto, setShowDeleteContacto] = useState<string | null>(null);

  // Redirect si no está logueado
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
    }
  }, [isLoggedIn, navigate]);

  const cargarDatos = useCallback(async () => {
    if (!usuario) return;
    setView('loading');

    const [titularData, familiaresData, contactosData] = await Promise.all([
      obtenerPersona(usuario.dni),
      obtenerFamiliares(usuario.dni),
      obtenerContactos(usuario.dni),
    ]);

    setTitular(titularData);
    setFamiliares(familiaresData);
    setContactos(contactosData);

    if (!titularData) {
      // Primera vez: no tiene registro propio
      if (usuario.tipoRegistro) {
        setView('registro-propio');
      } else {
        setView('elegir-tipo');
      }
    } else if (!usuario.registroCompletado && contactosData.length === 0) {
      // Tiene registro propio pero no ha completado contactos
      if (usuario.tipoRegistro === 'familia' && familiaresData.length === 0) {
        setView('agregar-familiar');
      } else {
        setView('contacto-emergencia');
      }
    } else {
      setView('dashboard');
    }
  }, [usuario]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleElegirTipo = async (tipo: 'solo' | 'familia') => {
    if (!usuario) return;
    await actualizarCuenta(usuario.dni, { tipoRegistro: tipo });
    actualizarUsuario({ tipoRegistro: tipo });
    setView('registro-propio');
  };

  const handleRegistroPropioComplete = async () => {
    if (!usuario) return;
    if (usuario.tipoRegistro === 'familia') {
      setView('agregar-familiar');
    } else {
      setView('contacto-emergencia');
    }
    // Refrescar datos
    const titularData = await obtenerPersona(usuario.dni);
    setTitular(titularData);
  };

  const handleFamiliarComplete = async () => {
    if (!usuario) return;
    const familiaresData = await obtenerFamiliares(usuario.dni);
    setFamiliares(familiaresData);
    setFamiliarEditando(null);
    // Si estaba en flujo inicial, preguntar si quiere agregar más
    if (!usuario.registroCompletado) {
      setView('dashboard-add-more');
    } else {
      setView('dashboard');
    }
  };

  const handleVolverElegirTipo = async () => {
    if (!usuario) return;
    await actualizarCuenta(usuario.dni, { tipoRegistro: null });
    actualizarUsuario({ tipoRegistro: null });
    setView('elegir-tipo');
  };

  const handleContactoComplete = async () => {
    if (!usuario) return;
    const contactosData = await obtenerContactos(usuario.dni);
    setContactos(contactosData);
    setContactoEditando(null);
    // Marcar registro como completado
    if (!usuario.registroCompletado) {
      await actualizarCuenta(usuario.dni, { registroCompletado: true });
      actualizarUsuario({ registroCompletado: true });
    }
    setView('dashboard');
  };

  const handleDeleteFamiliar = async (vinculoId: string) => {
    await eliminarVinculoFamiliar(vinculoId);
    setFamiliares(prev => prev.filter(f => f.vinculoId !== vinculoId));
    setShowDeleteConfirm(null);
  };

  const handleDeleteContacto = async (id: string) => {
    if (!usuario) return;
    await eliminarContacto(usuario.dni, id);
    setContactos(prev => prev.filter(c => c.id !== id));
    setShowDeleteContacto(null);
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-white/90 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1280px] mx-auto h-16">
          <span className="text-lg font-bold font-headline-lg bg-clip-text text-transparent bg-gradient-to-r from-[#C96442] via-[#0F172A] to-[#C96442] brand-text-animated">
            #YoCuidoMiFamilia
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant hidden sm:block">
              DNI: <span className="font-semibold text-on-surface">{usuario.dni}</span>
            </span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-on-surface-variant hover:text-error-accent cursor-pointer bg-transparent border-none flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {view === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-on-surface-variant text-sm">Cargando tu información...</p>
              </div>
            </motion.div>
          )}

          {/* Elegir tipo */}
          {view === 'elegir-tipo' && (
            <motion.div key="elegir" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-secondary text-4xl">waving_hand</span>
                </div>
                <h1 className="font-headline-lg text-3xl font-bold text-primary mb-3">¡Bienvenido!</h1>
                <p className="text-on-surface-variant text-lg">¿Qué deseas registrar hoy?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => handleElegirTipo('solo')}
                  className="bg-white border-2 border-outline-variant hover:border-primary rounded-3xl p-8 text-left cursor-pointer transition-all hover-lift group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-6 transition-all">
                    <span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">person</span>
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-primary mb-2">Solo a mí</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed m-0">Quiero registrar únicamente mis datos personales para mi propia protección.</p>
                </button>
                <button
                  onClick={() => handleElegirTipo('familia')}
                  className="bg-white border-2 border-outline-variant hover:border-secondary rounded-3xl p-8 text-left cursor-pointer transition-all hover-lift group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/5 group-hover:bg-secondary group-hover:text-white flex items-center justify-center mb-6 transition-all">
                    <span className="material-symbols-outlined text-secondary group-hover:text-white text-3xl">family_restroom</span>
                  </div>
                  <h3 className="font-headline-md text-lg font-bold text-primary mb-2">A mí y mi familia</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed m-0">Quiero registrar mis datos y los de mis seres queridos para protegernos a todos.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Registro Propio */}
          {(view === 'registro-propio' || view === 'editar-propio') && (
            <motion.div key="reg-propio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-8">
              <RegistroPropio
                dniTitular={usuario.dni}
                datosExistentes={view === 'editar-propio' ? titular : null}
                onComplete={view === 'editar-propio' ? () => cargarDatos() : handleRegistroPropioComplete}
                onBack={!usuario.registroCompletado && view === 'registro-propio' ? handleVolverElegirTipo : undefined}
              />
            </motion.div>
          )}

          {/* Agregar / Editar Familiar */}
          {(view === 'agregar-familiar' || view === 'editar-familiar') && (
            <motion.div key="reg-familiar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-8">
              <RegistroFamiliar
                cuentaTitularDni={usuario.dni}
                datosExistentes={view === 'editar-familiar' ? familiarEditando : null}
                onComplete={handleFamiliarComplete}
                onCancel={() => {
                  setFamiliarEditando(null);
                  if (usuario.registroCompletado) {
                    setView('dashboard');
                  } else {
                    setView('contacto-emergencia');
                  }
                }}
              />
            </motion.div>
          )}

          {/* Contacto de Emergencia */}
          {(view === 'contacto-emergencia' || view === 'editar-contacto') && (
            <motion.div key="contacto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-8">
              <ContactoEmergenciaForm
                cuentaDni={usuario.dni}
                datosExistentes={view === 'editar-contacto' ? contactoEditando : null}
                onComplete={handleContactoComplete}
                onCancel={() => {
                  setContactoEditando(null);
                  if (usuario.registroCompletado) {
                    setView('dashboard');
                  } else if (contactos.length > 0) {
                    handleContactoComplete();
                  }
                }}
              />
            </motion.div>
          )}

          {/* Dashboard: agregar más familiares? */}
          {view === 'dashboard-add-more' && (
            <motion.div key="add-more" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-success-accent text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">¡Familiar registrado!</h2>
              <p className="text-on-surface-variant mb-8">¿Deseas agregar otro familiar o continuar?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setView('agregar-familiar')}
                  className="btn-secondary justify-center"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Agregar otro familiar
                </button>
                <button
                  onClick={() => setView('contacto-emergencia')}
                  className="btn-primary justify-center"
                >
                  Continuar
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Dashboard principal */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="font-headline-lg text-2xl font-bold text-primary mb-1">Mi Panel</h1>
                  <p className="text-on-surface-variant text-sm">Gestiona tu información y la de tu familia</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setView('agregar-familiar')}
                    className="btn-secondary text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Agregar Familiar
                  </button>
                  <button
                    onClick={() => setView('contacto-emergencia')}
                    className="btn-secondary text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">contact_phone</span>
                    Agregar Contacto
                  </button>
                </div>
              </div>

              {/* Sección: Mi perfil + Familiares */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Telaraña Familiar */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">account_tree</span>
                      Red Familiar
                    </h3>
                  </div>
                  
                  {titular ? (
                    <div className="relative">
                      {/* Nodo Raíz: Titular */}
                      <div className="relative z-10">
                        <FamiliarCard
                          persona={titular}
                          onEdit={() => { setView('editar-propio'); }}
                          onDelete={() => { /* No se puede eliminar titular */ }}
                        />
                      </div>

                      {/* Ramas: Familiares */}
                      {familiares.length > 0 && (
                        <div className="relative mt-4 ml-6 md:ml-12 border-l-2 border-outline-variant/60 space-y-4 pb-4">
                          {familiares.map((f) => (
                            <div key={f.vinculoId} className="relative pl-8">
                              {/* Línea conectora horizontal */}
                              <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-outline-variant/60 -translate-y-1/2"></div>
                              <FamiliarCard
                                persona={f}
                                onEdit={() => { setFamiliarEditando(f); setView('editar-familiar'); }}
                                onDelete={() => setShowDeleteConfirm(f.vinculoId)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-on-surface-variant py-8 text-sm">No hay red familiar registrada.</p>
                  )}
                </div>

                {/* Columna Derecha: Contactos de Emergencia */}
                <div className="lg:col-span-1">
                  <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/30">
                    <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">emergency</span>
                      Contactos
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                      {contactos.map(c => (
                        <ContactoCard
                          key={c.id}
                          contacto={c}
                          onEdit={() => { setContactoEditando(c); setView('editar-contacto'); }}
                          onDelete={() => setShowDeleteContacto(c.id!)}
                        />
                      ))}
                      
                      {contactos.length === 0 && (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                            <span className="material-symbols-outlined text-secondary text-2xl">contact_phone</span>
                          </div>
                          <p className="text-on-surface-variant text-sm mb-4">No hay contactos de emergencia.</p>
                          <button
                            onClick={() => setView('contacto-emergencia')}
                            className="text-secondary text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Agregar Contacto
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación: Eliminar familiar */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-full bg-error-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-error-accent text-3xl">warning</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-2">¿Eliminar este familiar de tu red?</h3>
              <p className="text-sm text-on-surface-variant mb-6">Esta acción eliminará el vínculo contigo. Sus datos personales no se borrarán del sistema general.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button
                  onClick={() => handleDeleteFamiliar(showDeleteConfirm)}
                  className="flex-1 bg-error-accent text-white py-3 px-6 rounded-lg font-semibold border-none cursor-pointer hover:bg-error-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de confirmación: Eliminar contacto */}
        {showDeleteContacto && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-full bg-error-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-error-accent text-3xl">warning</span>
              </div>
              <h3 className="font-headline-md text-lg font-bold text-primary mb-2">¿Eliminar este contacto?</h3>
              <p className="text-sm text-on-surface-variant mb-6">Se eliminará este contacto de emergencia.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteContacto(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button
                  onClick={() => handleDeleteContacto(showDeleteContacto)}
                  className="flex-1 bg-error-accent text-white py-3 px-6 rounded-lg font-semibold border-none cursor-pointer hover:bg-error-accent/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
