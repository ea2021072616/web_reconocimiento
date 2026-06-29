import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { QRPhotoCapture } from '../QRPhotoCapture';
import { ChipSelector, ENFERMEDADES_CRONICAS, CONDICIONES_ESPECIALES } from '../ChipSelector';
import { registrarPersona, actualizarPersona, type PersonaData } from '../../services/personaService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RegistroPropioProps {
  dniTitular: string;
  datosExistentes?: PersonaData | null;
  onComplete: () => void;
  onBack?: () => void;
}

export const RegistroPropio = ({ dniTitular, datosExistentes, onComplete, onBack }: RegistroPropioProps) => {
  const isEdit = !!datosExistentes;
  const [nombres, setNombres] = useState(datosExistentes?.nombres || '');
  const [apellidos, setApellidos] = useState(datosExistentes?.apellidos || '');
  const [fotoBase64, setFotoBase64] = useState('');
  const [enfermedades, setEnfermedades] = useState<string[]>(datosExistentes?.datosMedicos.enfermedadesCronicas || []);
  const [condiciones, setCondiciones] = useState<string[]>(datosExistentes?.datosMedicos.condicionesEspeciales || []);
  const [observaciones, setObservaciones] = useState(datosExistentes?.datosMedicos.observaciones || '');
  const [consentimiento, setConsentimiento] = useState(datosExistentes?.consentimiento || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formValido = nombres.trim() && apellidos.trim() && (fotoBase64 || datosExistentes?.fotoUrl) && consentimiento;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await actualizarPersona(dniTitular, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          datosMedicos: {
            enfermedadesCronicas: enfermedades,
            condicionesEspeciales: condiciones,
            observaciones: observaciones.trim(),
          },
          consentimiento,
        }, fotoBase64 || undefined);
      } else {
        const result = await registrarPersona({
          dni: dniTitular,
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          fotoBase64,
          datosMedicos: {
            enfermedadesCronicas: enfermedades,
            condicionesEspeciales: condiciones,
            observaciones: observaciones.trim(),
          },
          consentimiento,
          cuentaTitular: dniTitular,
          esTitular: true,
        });
        if (!result.success) {
          setError(result.error || 'Error al registrar.');
          setLoading(false);
          return;
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
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="absolute left-0 p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center"
              title="Volver atrás"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <h2 className="font-headline-lg text-2xl font-bold text-primary">
            {isEdit ? 'Editar mi perfil' : 'Mi Registro Personal'}
          </h2>
        </div>
        <p className="text-on-surface-variant text-sm text-center px-8">
          {isEdit ? 'Actualiza tu información personal' : 'Empecemos contigo. Luego podrás registrar a tu familia.'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">Nombres</label>
        <input
          type="text"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          placeholder="Ej. Juan Carlos"
          className="input-field"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">Apellidos</label>
        <input
          type="text"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          placeholder="Ej. Pérez López"
          className="input-field"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
          Foto de rostro con código QR
        </label>
        <p className="text-xs text-on-surface-variant -mt-1">Medida de seguridad: escanea el QR con tu celular para tomar la foto.</p>
        
        {datosExistentes?.fotoUrl && !fotoBase64 ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-success-accent shadow-lg">
              <img src={datosExistentes.fotoUrl} alt="Foto guardada" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm text-on-surface-variant">Ya tienes una foto registrada.</p>
            <button type="button" onClick={() => setFotoBase64('nueva_captura')} className="btn-secondary text-sm">
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
          <ChipSelector
            label="Enfermedades crónicas"
            opciones={ENFERMEDADES_CRONICAS}
            seleccionados={enfermedades}
            onChange={setEnfermedades}
          />
          <ChipSelector
            label="Condiciones especiales"
            opciones={CONDICIONES_ESPECIALES}
            seleccionados={condiciones}
            onChange={setCondiciones}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Alergias, medicamentos, información importante para rescatistas..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none bg-success-accent/5 border border-success-accent/20 rounded-xl p-4">
        <input
          type="checkbox"
          checked={consentimiento}
          onChange={(e) => setConsentimiento(e.target.checked)}
          className="mt-0.5 w-5 h-5 accent-success-accent cursor-pointer"
        />
        <span className="text-sm text-on-surface leading-relaxed">
          Doy mi <span className="font-semibold text-success-accent">consentimiento</span> para que mis datos sean utilizados
          exclusivamente en situaciones de emergencia por instituciones autorizadas.
        </span>
      </label>

      {error && (
        <div className="bg-error-accent/10 text-error-accent text-sm p-3 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!formValido || loading}
        className="btn-primary w-full justify-center"
      >
        {loading ? (
          <><Loader2 size={20} className="animate-spin" /> Guardando...</>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">save</span>
            {isEdit ? 'Guardar Cambios' : 'Guardar mi Registro'}
          </>
        )}
      </button>
    </motion.form>
  );
};
