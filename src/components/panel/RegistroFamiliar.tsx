import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { QRPhotoCapture } from '../QRPhotoCapture';
import { ChipSelector, ENFERMEDADES_CRONICAS, CONDICIONES_ESPECIALES } from '../ChipSelector';
import { registrarPersona, actualizarPersona, crearVinculoFamiliar, obtenerPersona, verificarVinculoExiste, asegurarSincronizacionCompleta, type FamiliarData } from '../../services/personaService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RegistroFamiliarProps {
  cuentaTitularDni: string;
  datosExistentes?: FamiliarData | null;
  onComplete: () => void;
  onCancel: () => void;
}

const OPCIONES_PARENTESCO = [
  'Hijo/a',
  'Padre/Madre',
  'Pareja',
  'Hermano/a',
  'Abuelo/a',
  'Nieto/a',
  'Tío/a',
  'Sobrino/a',
  'Primo/a',
  'Otro'
];

export const RegistroFamiliar = ({ cuentaTitularDni, datosExistentes, onComplete, onCancel }: RegistroFamiliarProps) => {
  const isEdit = !!datosExistentes;
  const [dni, setDni] = useState(datosExistentes?.dni || '');
  const [relacion, setRelacion] = useState(datosExistentes?.relacion || '');
  const [nombres, setNombres] = useState(datosExistentes?.nombres || '');
  const [apellidos, setApellidos] = useState(datosExistentes?.apellidos || '');
  const [telefono, setTelefono] = useState(datosExistentes?.telefono || '');
  const [fotoBase64, setFotoBase64] = useState('');
  const [enfermedades, setEnfermedades] = useState<string[]>(datosExistentes?.datosMedicos?.enfermedadesCronicas || []);
  const [condiciones, setCondiciones] = useState<string[]>(datosExistentes?.datosMedicos?.condicionesEspeciales || []);
  const [observaciones, setObservaciones] = useState(datosExistentes?.datosMedicos?.observaciones || '');
  const [autorizacion, setAutorizacion] = useState(isEdit ? true : false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nuevo estado para saber si el DNI ya existe
  const [dniExiste, setDniExiste] = useState(false);
  const [checkingDni, setCheckingDni] = useState(false);
  const [wantsNewPhoto, setWantsNewPhoto] = useState(false);
  const [vinculoExistente, setVinculoExistente] = useState(false);

  const dniValido = /^\d{8}$/.test(dni);

  // Efecto para verificar si el DNI existe cuando termina de escribirlo
  useEffect(() => {
    if (isEdit || !dniValido) {
      setDniExiste(false);
      setVinculoExistente(false);
      return;
    }

    const checkDni = async () => {
      setCheckingDni(true);
      try {
        const persona = await obtenerPersona(dni);
        if (persona) {
          setDniExiste(true);
          const vinculo = await verificarVinculoExiste(cuentaTitularDni, dni);
          setVinculoExistente(vinculo);
        } else {
          setDniExiste(false);
          setVinculoExistente(false);
        }
      } catch (e) {
        console.error('Error verificando DNI:', e);
      } finally {
        setCheckingDni(false);
      }
    };

    const timeoutId = setTimeout(checkDni, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [dni, dniValido, isEdit]);

  const [consultandoReniec, setConsultandoReniec] = useState(false);

  // Limpiar nombres y apellidos cuando cambia el DNI en modo creación
  useEffect(() => {
    if (!isEdit) {
      setNombres('');
      setApellidos('');
    }
  }, [dni, isEdit]);

  const handleConsultarReniec = async () => {
    setConsultandoReniec(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/proxy/dni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dni })
      });

      if (!response.ok) {
        throw new Error('No se pudo establecer conexión con la API de RENIEC.');
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const apiNombres = resData.data.nombres;
        const apiApellidos = `${resData.data.apellido_paterno} ${resData.data.apellido_materno}`.trim();
        
        setNombres(apiNombres);
        setApellidos(apiApellidos);
      } else {
        throw new Error(resData.message || 'La consulta no devolvió datos válidos.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo sincronizar los datos de RENIEC.');
    } finally {
      setConsultandoReniec(false);
    }
  };

  // Si existe el DNI, solo necesitamos la relacion. Si no existe, necesitamos todo.
  const photoValid = (isEdit && !wantsNewPhoto) ? true : (fotoBase64.length > 100);
  const telefonoValido = /^[9]\d{8}$/.test(telefono.trim());
  const formValido = dniValido && !vinculoExistente && dni !== cuentaTitularDni && relacion.trim() !== '' && (
    isEdit 
      ? (nombres.trim() && apellidos.trim() && telefonoValido)
      : (dniExiste ? true : (nombres.trim() && apellidos.trim() && telefonoValido && photoValid && autorizacion))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        // Solo actualizar datos de la persona
        await actualizarPersona(datosExistentes!.dni, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
          datosMedicos: {
            enfermedadesCronicas: enfermedades,
            condicionesEspeciales: condiciones,
            observaciones: observaciones.trim(),
          },
          consentimiento: true,
        }, fotoBase64 || undefined);

        // Y actualizar el vínculo
        if (relacion !== datosExistentes!.relacion) {
          await crearVinculoFamiliar(cuentaTitularDni, datosExistentes!.dni, relacion);
        }
      } else {
        if (dniExiste) {
          // Si ya existe en la DB, solo creamos el vínculo
          await crearVinculoFamiliar(cuentaTitularDni, dni, relacion);
        } else {
          // Si no existe, primero registramos la persona
          const result = await registrarPersona({
            dni,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            fotoBase64,
            telefono: telefono.trim(),
            datosMedicos: {
              enfermedadesCronicas: enfermedades,
              condicionesEspeciales: condiciones,
              observaciones: observaciones.trim(),
            },
            consentimiento: true,
            cuentaTitular: cuentaTitularDni,
            esTitular: false,
          });
          if (!result.success) {
            setError(result.error || 'Error al registrar familiar.');
            setLoading(false);
            return;
          }
          // Luego creamos el vínculo
          await crearVinculoFamiliar(cuentaTitularDni, dni, relacion);

          // Ejecutar sincronización de RENIEC y Qdrant
          await asegurarSincronizacionCompleta(dni, fotoBase64);
        }
      }
      onComplete();
    } catch {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-lg mx-auto"
    >
      <div className="flex flex-col items-center relative mb-2">
        <div className="w-full flex items-center justify-center relative mb-1">
          <button
            type="button"
            onClick={onCancel}
            className="absolute left-0 p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center"
            title="Volver atrás"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-headline-lg text-2xl font-bold text-primary">
            {isEdit ? 'Editar Familiar' : 'Agregar Familiar'}
          </h2>
        </div>
        <p className="text-on-surface-variant text-sm text-center px-8">
          {isEdit ? `Editando datos de ${datosExistentes?.nombres}` : 'Registra a un ser querido para su protección'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-on-surface">N° DNI del familiar</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="8 dígitos"
            maxLength={8}
            className="input-field"
            disabled={isEdit}
            required
          />
        </div>
        {dniValido && !dniExiste && !checkingDni && !vinculoExistente && dni !== cuentaTitularDni && (
          <button
            type="button"
            onClick={handleConsultarReniec}
            disabled={consultandoReniec}
            className="btn-secondary h-[48px] px-4 justify-center gap-1.5 border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 w-full sm:w-auto"
          >
            {consultandoReniec ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">search</span>
            )}
            <span>Consultar</span>
          </button>
        )}
      </div>

      {dni.length > 0 && !dniValido && (
        <p className="text-xs text-on-surface-variant -mt-3">El DNI debe tener 8 dígitos</p>
      )}
      {dni === cuentaTitularDni && (
        <p className="text-xs text-error-accent font-semibold -mt-3">No puedes registrarte a ti mismo como familiar</p>
      )}
      {vinculoExistente && (
        <p className="text-xs text-error-accent font-semibold -mt-3">Esta persona ya es parte de tu red familiar</p>
      )}
      {checkingDni && (
        <p className="text-xs text-secondary flex items-center gap-1 -mt-3">
          <Loader2 size={12} className="animate-spin" /> Verificando DNI...
        </p>
      )}

      {/* Nombres */}
      {(!dniExiste || isEdit) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Nombres</label>
          <input
            type="text"
            value={nombres}
            readOnly
            placeholder="Consulta el DNI para autocompletar..."
            className="input-field bg-surface-container/50 text-on-surface/70 cursor-not-allowed border-outline/30"
            required
          />
        </div>
      )}

      {/* Apellidos */}
      {(!dniExiste || isEdit) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Apellidos</label>
          <input
            type="text"
            value={apellidos}
            readOnly
            placeholder="Consulta el DNI para autocompletar..."
            className="input-field bg-surface-container/50 text-on-surface/70 cursor-not-allowed border-outline/30"
            required
          />
        </div>
      )}

      {/* Teléfono */}
      <AnimatePresence mode="popLayout">
        {!dniExiste && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <label className="text-sm font-semibold text-on-surface">Teléfono Celular</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="Ej. 987654321"
              maxLength={9}
              className={`input-field bg-white ${telefono && !telefonoValido ? 'border-error-accent text-error-accent' : ''}`}
              required
            />
            {telefono && !telefonoValido && (
              <p className="text-xs text-error-accent font-semibold mt-0.5">El teléfono debe tener 9 dígitos y empezar con 9.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parentesco */}
      <AnimatePresence mode="popLayout">
        {!vinculoExistente && dni !== cuentaTitularDni && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <label className="text-sm font-semibold text-on-surface">
              ¿Qué es esta persona para ti? (Parentesco)
            </label>
            <select
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              className="input-field bg-white"
              required
            >
              <option value="" disabled>Selecciona el parentesco</option>
              {OPCIONES_PARENTESCO.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Familiar encontrado Banner */}
      <AnimatePresence mode="popLayout">
        {dniValido && dniExiste && !vinculoExistente && dni !== cuentaTitularDni && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
            <div className="w-full">
              <p className="font-semibold text-primary text-sm mb-1">
                ¡Familiar encontrado: {nombres} {apellidos}!
              </p>
              <p className="text-xs text-on-surface-variant font-medium">
                Esta persona ya está registrada en el sistema. No es necesario volver a tomarle fotos ni llenar sus datos médicos. Solo selecciona el parentesco y guarda para agregarlo a tu red.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resto del Registro (Foto, Datos médicos, Consentimiento) */}
      <AnimatePresence mode="popLayout">
        {dniValido && !dniExiste && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                Foto de rostro del familiar con código QR
              </label>

              {datosExistentes?.fotoUrl && !wantsNewPhoto ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary shadow-lg">
                    <img src={datosExistentes.fotoUrl} alt="Foto guardada" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-on-surface-variant">El familiar ya tiene una foto registrada.</p>
                  <button type="button" onClick={() => setWantsNewPhoto(true)} className="btn-secondary text-sm">
                    Tomar foto nueva
                  </button>
                </div>
              ) : (
                <QRPhotoCapture apiUrl={API_URL} onFotoCaptured={setFotoBase64} />
              )}
            </div>

            <div className="border-t border-outline-variant pt-6">
              <p className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-secondary">medical_information</span>
                Datos Médicos <span className="text-on-surface-variant font-normal">(opcional)</span>
              </p>
              <div className="flex flex-col gap-5">
                <ChipSelector label="Enfermedades crónicas" opciones={ENFERMEDADES_CRONICAS} seleccionados={enfermedades} onChange={setEnfermedades} />
                <ChipSelector label="Condiciones especiales" opciones={CONDICIONES_ESPECIALES} seleccionados={condiciones} onChange={setCondiciones} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Observaciones</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Alergias, medicamentos, información importante..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none bg-secondary/5 border border-secondary/20 rounded-xl p-4">
              <input
                type="checkbox"
                checked={autorizacion}
                onChange={(e) => setAutorizacion(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-secondary cursor-pointer"
              />
              <span className="text-sm text-on-surface leading-relaxed">
                <span className="font-semibold text-secondary">Declaro</span> tener autorización legal para registrar a esta persona
                y consiento el uso de sus datos en situaciones de emergencia.
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-error-accent/10 text-error-accent text-sm p-3 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
          Cancelar
        </button>
        <button type="submit" disabled={!formValido || loading} className="btn-primary flex-[2] justify-center">
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Guardando...</>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">person_add</span>
              {isEdit ? 'Guardar Cambios' : 'Registrar Familiar'}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};
