import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, FileText, HeartPulse, Loader2, CheckCircle2 } from 'lucide-react';
import { registrarFamiliar, type Familiar } from '../services/registroService';
import { QRPhotoCapture } from './QRPhotoCapture';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const RegistroForm = () => {
  const [formData, setFormData] = useState<Familiar>({
    nombrePaciente: '',
    condicion: '',
    nombreApoderado: '',
    telefono: '',
    detallesAdicionales: '',
    fotoBase64: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simular un poco de delay para ver la animacion fluida, luego procesar la db
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = await registrarFamiliar(formData);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          nombrePaciente: '',
          condicion: '',
          nombreApoderado: '',
          telefono: '',
          detallesAdicionales: '',
          fotoBase64: ''
        });
      }, 3000);
    } else {
      setError('Hubo un error al registrar. Revisa tu conexión y las credenciales de Firebase.');
    }
  };

  return (
    <motion.div 
      className="glass-panel"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Registro de Paciente</h2>
      
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="success-message"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0', color: 'var(--primary-color)' }}
          >
            <CheckCircle2 size={64} />
            <h3>¡Registro Exitoso!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Los datos han sido guardados de manera segura.</p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> Nombre del Familiar (Paciente)
              </label>
              <input 
                type="text" 
                name="nombrePaciente" 
                value={formData.nombrePaciente} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="Ej. María Pérez" 
                required 
              />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={16} /> Condición / Vulnerabilidad
              </label>
              <select 
                name="condicion" 
                value={formData.condicion} 
                onChange={handleChange} 
                className="input-field" 
                required
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>Seleccione una condición...</option>
                <option value="alzheimer">Alzheimer</option>
                <option value="demencia_senil">Demencia Senil</option>
                <option value="autismo">Trastorno del Espectro Autista</option>
                <option value="sindrome_down">Síndrome de Down</option>
                <option value="otro">Otra condición</option>
              </select>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <motion.div variants={itemVariants} className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} /> Tu Nombre (Apoderado)
                </label>
                <input 
                  type="text" 
                  name="nombreApoderado" 
                  value={formData.nombreApoderado} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Ej. Juan Pérez" 
                  required 
                />
              </motion.div>

              <motion.div variants={itemVariants} className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> Teléfono de Emergencia
                </label>
                <input 
                  type="tel" 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Ej. +51 987 654 321" 
                  required 
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} /> Detalles Adicionales (Opcional)
              </label>
              <textarea 
                name="detallesAdicionales" 
                value={formData.detallesAdicionales} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="Alergias, medicamentos, lugares frecuentes..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </motion.div>

            <QRPhotoCapture
              apiUrl={API_URL}
              onFotoCaptured={(b64) => setFormData({ ...formData, fotoBase64: b64 })}
            />

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Procesando...
                </>
              ) : (
                'Registrar Familiar'
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
