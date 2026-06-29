import { type ContactoEmergencia } from '../../services/contactoService';

interface ContactoCardProps {
  contacto: ContactoEmergencia;
  onEdit: () => void;
  onDelete: () => void;
}

export const ContactoCard = ({ contacto, onEdit, onDelete }: ContactoCardProps) => {
  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-5 hover-lift flex items-start gap-4 group">
      <div className="w-10 h-10 rounded-full bg-success-accent/10 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-success-accent">call</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-primary text-sm mb-0.5">{contacto.nombre}</h4>
        <p className="text-sm text-secondary font-medium mb-1">{contacto.telefono}</p>
        <p className="text-xs text-on-surface-variant truncate">
          {contacto.calle}, {contacto.distrito}
          {contacto.referencia && ` · ${contacto.referencia}`}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg bg-primary/5 hover:bg-primary/10 flex items-center justify-center border-none cursor-pointer transition-colors"
          title="Editar"
        >
          <span className="material-symbols-outlined text-primary text-lg">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-lg bg-error-accent/5 hover:bg-error-accent/10 flex items-center justify-center border-none cursor-pointer transition-colors"
          title="Eliminar"
        >
          <span className="material-symbols-outlined text-error-accent text-lg">delete</span>
        </button>
      </div>
    </div>
  );
};
