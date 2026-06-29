import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { agregarContacto, actualizarContacto, type ContactoEmergencia } from '../../services/contactoService';

interface ContactoEmergenciaFormProps {
  cuentaDni: string;
  datosExistentes?: ContactoEmergencia | null;
  onComplete: () => void;
  onCancel: () => void;
}

export const ContactoEmergenciaForm = ({ cuentaDni, datosExistentes, onComplete, onCancel }: ContactoEmergenciaFormProps) => {
  const isEdit = !!datosExistentes;
  const [nombre, setNombre] = useState(datosExistentes?.nombre || '');
  const [telefono, setTelefono] = useState(datosExistentes?.telefono || '');
  const [calle, setCalle] = useState(datosExistentes?.calle || '');
  const [distrito, setDistrito] = useState(datosExistentes?.distrito || '');
  const [referencia, setReferencia] = useState(datosExistentes?.referencia || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formValido = nombre.trim() && telefono.trim() && calle.trim() && distrito.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        calle: calle.trim(),
        distrito: distrito.trim(),
        referencia: referencia.trim(),
      };

      if (isEdit && datosExistentes?.id) {
        await actualizarContacto(cuentaDni, datosExistentes.id, data);
      } else {
        await agregarContacto(cuentaDni, data);
      }
      onComplete();
    } catch {
      setError('Error al guardar el contacto.');
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
            {isEdit ? 'Editar Contacto' : 'Contacto de Emergencia'}
          </h2>
        </div>
        <p className="text-on-surface-variant text-sm text-center px-8">
          ¿A quién deben contactar si algo le pasa a cualquier miembro de tu familia?
        </p>
      </div>

      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-sm text-on-surface-variant flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-lg mt-0.5">info</span>
        <p className="m-0 leading-relaxed">
          Este contacto aplica para <span className="font-semibold text-on-surface">todos</span> los miembros de tu familia registrados.
          Si algo le pasa a cualquiera de ellos, se comunicarán con esta persona. Puedes agregar varios contactos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Nombre del contacto</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. María García"
            className="input-field"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej. 987654321"
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-on-surface">Dirección (calle)</label>
        <input
          type="text"
          value={calle}
          onChange={(e) => setCalle(e.target.value)}
          placeholder="Ej. Av. Principal 123"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Distrito</label>
          <input
            type="text"
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
            placeholder="Ej. San Isidro"
            className="input-field"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface">Referencia</label>
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ej. Frente al parque"
            className="input-field"
          />
        </div>
      </div>

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
              <span className="material-symbols-outlined text-lg">save</span>
              {isEdit ? 'Guardar Cambios' : 'Guardar Contacto'}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};
