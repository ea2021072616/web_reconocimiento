import { type FamiliarData, type PersonaData } from '../../services/personaService';

interface FamiliarCardProps {
  persona: FamiliarData | PersonaData;
  onEdit: () => void;
  onDelete: () => void;
}

export const FamiliarCard = ({ persona, onEdit, onDelete }: FamiliarCardProps) => {
  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-5 hover-lift flex items-start gap-4 group">
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-outline-variant flex-shrink-0 bg-surface-container">
        {persona.fotoUrl ? (
          <img src={persona.fotoUrl} alt={persona.nombres} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-primary text-sm truncate">{persona.nombres} {persona.apellidos}</h4>
          {persona.esTitular ? (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex-shrink-0">Tú</span>
          ) : (
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium flex-shrink-0">
              {'relacion' in persona ? persona.relacion : 'Familiar'}
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant mb-1">DNI: {persona.dni}</p>
        {(persona.datosMedicos.enfermedadesCronicas.length > 0 || persona.datosMedicos.condicionesEspeciales.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {persona.datosMedicos.enfermedadesCronicas.map(e => (
              <span key={e} className="text-[10px] bg-error-accent/10 text-error-accent px-1.5 py-0.5 rounded-full">{e}</span>
            ))}
            {persona.datosMedicos.condicionesEspeciales.map(c => (
              <span key={c} className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center border-none cursor-pointer transition-colors"
          title="Editar"
        >
          <span className="material-symbols-outlined text-primary text-lg">edit</span>
        </button>
        {!persona.esTitular && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-error-accent/5 hover:bg-error-accent/10 flex items-center justify-center border-none cursor-pointer transition-colors"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-error-accent text-lg">delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
