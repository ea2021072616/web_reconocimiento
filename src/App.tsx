import { motion } from 'framer-motion';
import { RegistroForm } from './components/RegistroForm';
import { ShieldAlert } from 'lucide-react';
import './index.css';

function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', minHeight: '80vh' }}>
      
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{ paddingRight: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(74, 222, 128, 0.2)', padding: '1rem', borderRadius: '50%' }}>
            <ShieldAlert size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>SIRE Protect</h2>
        </div>
        
        <h1>Cuidamos a quienes más amas</h1>
        <p className="subtitle">
          Regístralos hoy. La tecnología de reconocimiento facial de SIRE nos ayudará a 
          protegerlos y encontrarlos rápidamente en caso de emergencia.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Base de datos segura y encriptada (Firebase)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
            <span style={{ color: 'var(--text-secondary)' }}>Lista para futuras alertas en tiempo real</span>
          </div>
        </div>
      </motion.div>

      <div>
        <RegistroForm />
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
