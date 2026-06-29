import { type FamiliarData, type PersonaData } from '../../services/personaService';

interface FamiliarTreeCardProps {
  persona: FamiliarData | PersonaData;
  onClick: () => void;
}

export const FamiliarTreeCard = ({ persona, onClick }: FamiliarTreeCardProps) => {
  return (
    <button 
      type="button"
      onClick={onClick}
      className="bg-white border-2 border-outline-variant/60 rounded-2xl p-4 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center gap-3 cursor-pointer w-full outline-none focus:border-primary"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-container flex-shrink-0 bg-surface shadow-sm">
        {persona.fotoUrl ? (
          <img src={persona.fotoUrl} alt={persona.nombres} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/5">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
          </div>
        )}
      </div>
      
      <div className="text-center w-full min-w-0">
        <h4 className="font-bold text-primary text-[15px] truncate w-full leading-tight mb-1.5">
          {persona.nombres.split(' ')[0]} {persona.apellidos.split(' ')[0]}
        </h4>
        
        {persona.esTitular ? (
          <span className="inline-block text-[10px] uppercase tracking-wider bg-primary text-white px-3 py-1 rounded-full font-bold shadow-sm">Tú</span>
        ) : (
          <span className="inline-block text-[10px] uppercase tracking-wider bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">
            {'relacion' in persona ? persona.relacion : 'Familiar'}
          </span>
        )}
      </div>
    </button>
  );
};
