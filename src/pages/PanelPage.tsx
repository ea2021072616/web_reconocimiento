import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { actualizarCuenta } from '../services/authService';
import { obtenerPersona, obtenerFamiliares, eliminarVinculoFamiliar, asegurarSincronizacionCompleta, type PersonaData, type FamiliarData } from '../services/personaService';
import { obtenerContactos, eliminarContacto, type ContactoEmergencia } from '../services/contactoService';
import { RegistroPropio } from '../components/panel/RegistroPropio';
import { RegistroFamiliar } from '../components/panel/RegistroFamiliar';
import { ContactoEmergenciaForm } from '../components/panel/ContactoEmergencia';
import { FamiliarCard } from '../components/panel/FamiliarCard';
import { FamiliarTreeCard } from '../components/panel/FamiliarTreeCard';
import { ContactoCard } from '../components/panel/ContactoCard';
import { Loader2 } from 'lucide-react';

type PanelView =
  | 'loading'
  | 'elegir-tipo'
  | 'registro-propio'
  | 'agregar-familiar'
  | 'editar-propio'
  | 'editar-familiar'
  | 'contacto-emergencia'
  | 'editar-contacto'
  | 'sincronizar-biometria'
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
  const [isTreeView, setIsTreeView] = useState(false);
  const [selectedFamiliarModal, setSelectedFamiliarModal] = useState<FamiliarData | PersonaData | null>(null);
  const [syncingDnis, setSyncingDnis] = useState<string[]>([]);
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});

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
      // Verificar si hay rostros sin sincronizar
      const tienePendientes = (titularData && !titularData.rostro_sincronizado) || 
        (usuario.tipoRegistro === 'familia' && familiaresData.some(f => !f.rostro_sincronizado));

      if (tienePendientes) {
        setView('sincronizar-biometria');
      } else if (usuario.tipoRegistro === 'familia' && familiaresData.length === 0) {
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
    // Refrescar datos
    const titularData = await obtenerPersona(usuario.dni);
    setTitular(titularData);

    if (usuario.tipoRegistro === 'familia') {
      setView('agregar-familiar');
    } else {
      if (titularData && !titularData.rostro_sincronizado) {
        setView('sincronizar-biometria');
      } else {
        setView('contacto-emergencia');
      }
    }
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

  const handleContinuarDespuesDeFamilia = async () => {
    if (!usuario) return;
    
    // Recargar datos
    const [titularData, familiaresData] = await Promise.all([
      obtenerPersona(usuario.dni),
      obtenerFamiliares(usuario.dni),
    ]);
    setTitular(titularData);
    setFamiliares(familiaresData);

    const tienePendientes = (titularData && !titularData.rostro_sincronizado) || 
      familiaresData.some(f => !f.rostro_sincronizado);

    if (tienePendientes) {
      setView('sincronizar-biometria');
    } else {
      setView('contacto-emergencia');
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

  const ancestros = familiares.filter(f => ['Padre', 'Madre', 'Padre/Madre', 'Abuelo/a', 'Tío/a', 'Suegro/a'].includes(f.relacion));
  const mismoNivel = familiares.filter(f => ['Pareja', 'Hermano/a', 'Primo/a', 'Cuñado/a', 'Otro'].includes(f.relacion));
  const descendientes = familiares.filter(f => ['Hijo/a', 'Nieto/a', 'Sobrino/a'].includes(f.relacion));

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
                  onClick={handleContinuarDespuesDeFamilia}
                  className="btn-primary justify-center"
                >
                  Continuar
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Sincronización Biométrica */}
          {view === 'sincronizar-biometria' && (
            <motion.div
              key="sincronizar-biometria"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto py-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-error-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-error-accent text-3xl">sync_problem</span>
                </div>
                <h2 className="font-headline-lg text-2xl font-bold text-primary mb-2">
                  Sincronización Biométrica Pendiente
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Por seguridad, todos los rostros registrados deben estar sincronizados en el motor de búsqueda facial para estar protegidos. Sincroniza los pendientes para continuar.
                </p>
              </div>

              <div className="flex flex-col gap-4 bg-white border border-outline-variant/55 rounded-3xl p-6 shadow-sm mb-8">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Personas pendientes
                </h3>
                
                <div className="flex flex-col gap-3">
                  {/* Titular si está pendiente */}
                  {titular && !titular.rostro_sincronizado && (
                    <div className="flex items-center justify-between p-4 bg-surface-container/30 border border-outline-variant/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant bg-surface flex-shrink-0">
                          {titular.fotoUrl ? (
                            <img src={titular.fotoUrl} alt={titular.nombres} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                              <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary leading-tight">
                            {titular.nombres} {titular.apellidos}
                          </p>
                          <p className="text-xs text-on-surface-variant">DNI: {titular.dni} • <span className="font-semibold text-secondary">Tú</span></p>
                          {syncErrors[titular.dni] && (
                            <p className="text-[11px] text-error-accent font-semibold mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">warning</span>
                              {syncErrors[titular.dni]}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setSyncingDnis(prev => [...prev, titular.dni]);
                          setSyncErrors(prev => {
                            const copy = { ...prev };
                            delete copy[titular.dni];
                            return copy;
                          });
                          const result = await asegurarSincronizacionCompleta(titular.dni, titular.fotoUrl);
                          setSyncingDnis(prev => prev.filter(d => d !== titular.dni));
                          if (result.success) {
                            // Refrescar titular
                            const t = await obtenerPersona(titular.dni);
                            setTitular(t);
                          } else {
                            setSyncErrors(prev => ({ ...prev, [titular.dni]: result.error || 'Fallo de conexión.' }));
                          }
                        }}
                        disabled={syncingDnis.includes(titular.dni)}
                        className={`text-xs font-bold py-2.5 px-4 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          syncingDnis.includes(titular.dni)
                            ? 'bg-outline-variant/30 text-on-surface-variant/50 cursor-not-allowed border-none shadow-none'
                            : 'bg-primary text-white hover:bg-primary/95 border-none hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        {syncingDnis.includes(titular.dni) ? (
                          <><Loader2 size={12} className="animate-spin" /> Sincronizando</>
                        ) : (
                          <><span className="material-symbols-outlined text-sm">sync</span> Sincronizar</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Familiares si están pendientes */}
                  {familiares.filter(f => !f.rostro_sincronizado).map(f => (
                    <div key={f.dni} className="flex items-center justify-between p-4 bg-surface-container/30 border border-outline-variant/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant bg-surface flex-shrink-0">
                          {f.fotoUrl ? (
                            <img src={f.fotoUrl} alt={f.nombres} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                              <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary leading-tight">
                            {f.nombres} {f.apellidos}
                          </p>
                          <p className="text-xs text-on-surface-variant">DNI: {f.dni} • <span className="font-medium text-secondary">{f.relacion}</span></p>
                          {syncErrors[f.dni] && (
                            <p className="text-[11px] text-error-accent font-semibold mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">warning</span>
                              {syncErrors[f.dni]}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setSyncingDnis(prev => [...prev, f.dni]);
                          setSyncErrors(prev => {
                            const copy = { ...prev };
                            delete copy[f.dni];
                            return copy;
                          });
                          const result = await asegurarSincronizacionCompleta(f.dni, f.fotoUrl);
                          setSyncingDnis(prev => prev.filter(d => d !== f.dni));
                          if (result.success) {
                            // Refrescar familiares
                            const fams = await obtenerFamiliares(usuario.dni);
                            setFamiliares(fams);
                          } else {
                            setSyncErrors(prev => ({ ...prev, [f.dni]: result.error || 'Fallo de conexión.' }));
                          }
                        }}
                        disabled={syncingDnis.includes(f.dni)}
                        className={`text-xs font-bold py-2.5 px-4 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          syncingDnis.includes(f.dni)
                            ? 'bg-outline-variant/30 text-on-surface-variant/50 cursor-not-allowed border-none shadow-none'
                            : 'bg-primary text-white hover:bg-primary/95 border-none hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        {syncingDnis.includes(f.dni) ? (
                          <><Loader2 size={12} className="animate-spin" /> Sincronizando</>
                        ) : (
                          <><span className="material-symbols-outlined text-sm">sync</span> Sincronizar</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={async () => {
                    // Volver a verificar antes de avanzar
                    const [t, fams] = await Promise.all([
                      obtenerPersona(usuario.dni),
                      obtenerFamiliares(usuario.dni),
                    ]);
                    setTitular(t);
                    setFamiliares(fams);

                    const tienePendientes = (t && !t.rostro_sincronizado) || 
                      fams.some(f => !f.rostro_sincronizado);

                    if (!tienePendientes) {
                      setView('contacto-emergencia');
                    } else {
                      alert('Aún tienes registros pendientes de sincronización biométrica.');
                    }
                  }}
                  disabled={
                    (titular && !titular.rostro_sincronizado) || 
                    familiares.some(f => !f.rostro_sincronizado)
                  }
                  className="btn-primary w-full justify-center py-3.5"
                >
                  Continuar a Contacto de Emergencia
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <p className="text-center text-xs text-on-surface-variant">
                  El botón se activará una vez que todas las identidades tengan su rostro sincronizado.
                </p>
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
                    <button
                      onClick={() => setIsTreeView(!isTreeView)}
                      className={`text-sm font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer border shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 ${
                        isTreeView 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-primary border-primary/30 hover:border-primary/60 hover:bg-primary/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isTreeView ? 'format_list_bulleted' : 'account_tree'}
                      </span>
                      {isTreeView ? 'Vista Clásica' : 'Vista de Árbol'}
                    </button>
                  </div>
                  
                  {titular ? (
                    isTreeView ? (
                      <div className="flex flex-col items-center gap-4 py-4 overflow-x-auto w-full">
                        {/* Ancestros */}
                        {ancestros.length > 0 && (
                          <div className="flex flex-col items-center w-full">
                            <div className="flex flex-wrap justify-center gap-4 w-full">
                              {ancestros.map(f => (
                                <div key={f.vinculoId} className="w-full max-w-[280px]">
                                  <FamiliarTreeCard
                                    persona={f}
                                    onClick={() => setSelectedFamiliarModal(f)}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="w-px h-8 bg-outline-variant/80 mt-4"></div>
                          </div>
                        )}

                        {/* Tú + Mismo Nivel */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 relative w-full">
                          {/* El Titular */}
                          <div className="w-full max-w-[300px] relative z-10 ring-2 ring-primary/30 rounded-2xl shadow-lg bg-surface">
                            <FamiliarTreeCard
                              persona={titular}
                              onClick={() => setSelectedFamiliarModal(titular)}
                            />
                          </div>

                          {/* Mismo Nivel */}
                          {mismoNivel.length > 0 && (
                            <div className="flex flex-col gap-4 relative">
                              {/* Línea conectora horizontal solo visible en desktop largo */}
                              <div className="hidden lg:block absolute top-1/2 -left-6 w-6 h-px bg-outline-variant/80 -translate-y-1/2"></div>
                              {/* Línea vertical para móviles */}
                              <div className="lg:hidden absolute -top-6 left-1/2 w-px h-6 bg-outline-variant/80 -translate-x-1/2"></div>
                              {mismoNivel.map(f => (
                                <div key={f.vinculoId} className="w-full max-w-[280px]">
                                  <FamiliarTreeCard
                                    persona={f}
                                    onClick={() => setSelectedFamiliarModal(f)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Descendientes */}
                        {descendientes.length > 0 && (
                          <div className="flex flex-col items-center w-full">
                            <div className="w-px h-8 bg-outline-variant/80 mb-4"></div>
                            <div className="flex flex-wrap justify-center gap-4 w-full">
                              {descendientes.map(f => (
                                <div key={f.vinculoId} className="w-full max-w-[280px]">
                                  <FamiliarTreeCard
                                    persona={f}
                                    onClick={() => setSelectedFamiliarModal(f)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
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
                    )
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
        {/* Modal de Detalles del Familiar */}
        <AnimatePresence>
          {selectedFamiliarModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
              >
                {/* Botón Cerrar */}
                <button 
                  onClick={() => setSelectedFamiliarModal(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/60 text-on-surface-variant cursor-pointer border-none transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface-container bg-surface shadow-md mb-4">
                    {selectedFamiliarModal.fotoUrl ? (
                      <img src={selectedFamiliarModal.fotoUrl} alt={selectedFamiliarModal.nombres} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/5">
                        <span className="material-symbols-outlined text-on-surface-variant text-5xl">person</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-headline-md text-2xl font-bold text-primary text-center mb-1">
                    {selectedFamiliarModal.nombres} {selectedFamiliarModal.apellidos}
                  </h3>
                  
                  <div className="flex gap-2 mb-6 mt-2">
                    {selectedFamiliarModal.esTitular ? (
                      <span className="text-xs uppercase tracking-wider bg-primary text-white px-3 py-1 rounded-full font-bold shadow-sm">Tú</span>
                    ) : (
                      <span className="text-xs uppercase tracking-wider bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">
                        {'relacion' in selectedFamiliarModal ? selectedFamiliarModal.relacion : 'Familiar'}
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider bg-surface-container text-on-surface-variant px-3 py-1 rounded-full font-bold">
                      DNI: {selectedFamiliarModal.dni}
                    </span>
                  </div>
                  
                  <div className="w-full text-left bg-surface/50 border border-outline-variant/40 rounded-2xl p-5 mb-8 shadow-sm">
                    <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">medical_services</span>
                      Información Médica
                    </h4>
                    
                    {selectedFamiliarModal.datosMedicos.enfermedadesCronicas.length === 0 && selectedFamiliarModal.datosMedicos.condicionesEspeciales.length === 0 ? (
                      <p className="text-sm text-on-surface-variant italic m-0">No se registraron condiciones médicas.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {selectedFamiliarModal.datosMedicos.enfermedadesCronicas.length > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Enfermedades Crónicas</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedFamiliarModal.datosMedicos.enfermedadesCronicas.map(e => (
                                <span key={e} className="text-xs font-medium bg-error-accent/10 text-error-accent px-2.5 py-1 rounded-md border border-error-accent/20">{e}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedFamiliarModal.datosMedicos.condicionesEspeciales.length > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Condiciones Especiales</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedFamiliarModal.datosMedicos.condicionesEspeciales.map(c => (
                                <span key={c} className="text-xs font-medium bg-secondary/10 text-secondary px-2.5 py-1 rounded-md border border-secondary/20">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedFamiliarModal(null);
                      if (selectedFamiliarModal.esTitular) {
                        setView('editar-propio');
                      } else {
                        setFamiliarEditando(selectedFamiliarModal as FamiliarData);
                        setView('editar-familiar');
                      }
                    }}
                    className="flex-1 btn-primary justify-center flex items-center gap-2 py-3"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Editar Perfil
                  </button>
                  
                  {!selectedFamiliarModal.esTitular && (
                    <button
                      onClick={() => {
                        const id = (selectedFamiliarModal as FamiliarData).vinculoId;
                        setSelectedFamiliarModal(null);
                        setShowDeleteConfirm(id);
                      }}
                      className="flex-none px-5 bg-error-accent/10 text-error-accent hover:bg-error-accent hover:text-white rounded-xl font-semibold border-none cursor-pointer transition-colors flex items-center justify-center shadow-sm hover:shadow"
                      title="Eliminar Familiar"
                    >
                      <span className="material-symbols-outlined text-[22px]">delete</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
