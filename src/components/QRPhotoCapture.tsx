import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, QrCode, CheckCircle2, RefreshCw, X, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRPhotoCaptureProps {
  apiUrl: string;
  onFotoCaptured: (b64: string) => void;
}

type CaptureState = 'idle' | 'waiting' | 'received';

export const QRPhotoCapture = ({ apiUrl, onFotoCaptured }: QRPhotoCaptureProps) => {
  const [state, setState] = useState<CaptureState>('idle');
  const [sessionId, setSessionId] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpiar WebSocket y ping interval al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, []);

  const iniciarCaptura = useCallback(() => {
    const nuevoSessionId = crypto.randomUUID();
    setSessionId(nuevoSessionId);
    setState('waiting');

    // Determinar protocolo WebSocket (ws o wss)
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const apiHost = apiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${apiHost}/ws/foto/${nuevoSessionId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[QR] WebSocket conectado, esperando foto...');
      // Enviar ping cada 30 segundos para mantener conexión viva
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === 'foto_recibida' && data.foto_b64) {
          setFotoPreview(data.foto_b64);
          setState('received');
          onFotoCaptured(data.foto_b64);

          // Limpiar WebSocket y ping
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          ws.close();
          wsRef.current = null;
        }
      } catch (e) {
        // Ignorar mensajes que no son JSON (como "pong")
      }
    };

    ws.onerror = (error) => {
      console.error('[QR] Error de WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('[QR] WebSocket cerrado');
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [apiUrl, onFotoCaptured]);

  const cancelar = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    setState('idle');
    setSessionId('');
    setFotoPreview('');
  }, []);

  const reintentar = useCallback(() => {
    cancelar();
    // Pequeño delay para que se limpie el estado
    setTimeout(() => iniciarCaptura(), 100);
  }, [cancelar, iniciarCaptura]);

  const qrUrl = `${apiUrl}/captura/${sessionId}`;

  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="input-group">
      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Camera size={16} /> Foto del Paciente (Opcional)
      </label>

      <AnimatePresence mode="wait">
        {/* Estado: Sin foto, botón para iniciar */}
        {state === 'idle' && (
          <motion.button
            key="idle"
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={iniciarCaptura}
            className="qr-trigger-btn"
          >
            <QrCode size={20} />
            Capturar foto con el celular
          </motion.button>
        )}

        {/* Estado: Esperando que el celular envíe la foto */}
        {state === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="qr-container"
          >
            <div className="qr-code-wrapper">
              <QRCodeSVG
                value={qrUrl}
                size={180}
                bgColor="transparent"
                fgColor="#f8fafc"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="qr-instructions">
              <p className="qr-instructions-title">Escanea con tu celular</p>
              <p className="qr-instructions-text">
                Abre la cámara de tu celular y apunta al código QR para tomar la foto del paciente.
              </p>
              <div className="qr-waiting">
                <Loader2 size={16} className="qr-spinner" />
                <span>Esperando foto...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={cancelar}
              className="qr-cancel-btn"
            >
              <X size={14} />
              Cancelar
            </button>
          </motion.div>
        )}

        {/* Estado: Foto recibida */}
        {state === 'received' && fotoPreview && (
          <motion.div
            key="received"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="qr-received"
          >
            <div className="foto-preview">
              <img src={fotoPreview} alt="Foto del paciente" />
            </div>
            <div className="foto-received-info">
              <div className="foto-received-badge">
                <CheckCircle2 size={18} />
                <span>Foto capturada</span>
              </div>
              <button
                type="button"
                onClick={reintentar}
                className="qr-retry-btn"
              >
                <RefreshCw size={14} />
                Tomar otra
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
