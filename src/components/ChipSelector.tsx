import { useState } from 'react';

interface ChipSelectorProps {
  label: string;
  opciones: string[];
  seleccionados: string[];
  onChange: (seleccionados: string[]) => void;
}

export const ChipSelector = ({ label, opciones, seleccionados, onChange }: ChipSelectorProps) => {
  const [personalizado, setPersonalizado] = useState('');

  const toggleChip = (opcion: string) => {
    if (seleccionados.includes(opcion)) {
      onChange(seleccionados.filter(s => s !== opcion));
    } else {
      onChange([...seleccionados, opcion]);
    }
  };

  const agregarPersonalizado = () => {
    const valor = personalizado.trim();
    if (valor && !seleccionados.includes(valor)) {
      onChange([...seleccionados, valor]);
      setPersonalizado('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-on-surface">{label}</label>
      <div className="flex flex-wrap gap-2">
        {opciones.map(opcion => {
          const isSelected = seleccionados.includes(opcion);
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => toggleChip(opcion)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all
                ${isSelected
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                }`}
            >
              {opcion}
              {isSelected && (
                <span className="ml-1.5 text-xs">✕</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={personalizado}
          onChange={(e) => setPersonalizado(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPersonalizado())}
          placeholder="Agregar otra..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface outline-none
                     focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
        />
        <button
          type="button"
          onClick={agregarPersonalizado}
          disabled={!personalizado.trim()}
          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border-none cursor-pointer
                     hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

// Opciones por defecto
export const ENFERMEDADES_CRONICAS = [
  'Diabetes', 'Hipertensión', 'Asma', 'Epilepsia', 'Cardiopatía', 'Insuficiencia Renal'
];

export const CONDICIONES_ESPECIALES = [
  'Alzheimer', 'Demencia Senil', 'Autismo', 'Síndrome de Down',
  'Discapacidad Visual', 'Discapacidad Auditiva', 'Discapacidad Motora'
];
