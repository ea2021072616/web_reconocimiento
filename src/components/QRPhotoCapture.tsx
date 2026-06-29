import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, RefreshCw, X, Loader2 } from 'lucide-react';
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

    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const apiHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
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

  const baseUrl = apiUrl.replace(/\/$/, '');
  const qrUrl = `${baseUrl}/captura/${sessionId}`;

  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="w-full">

      <AnimatePresence mode="wait">
        {/* Estado: Sin foto, botón para iniciar */}
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <motion.button
              key="idle"
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={iniciarCaptura}
              className="w-full max-w-sm py-8 rounded-2xl border-2 border-dashed border-outline-variant hover:border-secondary bg-surface-container hover:bg-secondary/5 transition-all cursor-pointer flex flex-col items-center gap-3 group border-none"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="text-secondary" size={32} />
              </div>
              <span className="text-on-surface font-semibold text-sm">Capturar foto con el celular</span>
            </motion.button>
          </div>
        )}

        {/* Estado: Esperando que el celular envíe la foto */}
        {state === 'waiting' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border-2 border-secondary bg-slate-900 shadow-xl p-6 flex flex-col items-center gap-5"
            >
              <div className="bg-white p-3 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={qrUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#020617"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="text-center flex flex-col gap-2">
                <p className="text-white font-semibold text-lg m-0">Escanea con tu celular</p>
                <p className="text-slate-300 text-sm m-0 leading-relaxed px-2">
                  Abre la cámara de tu celular y apunta al código QR para tomar la foto.
                </p>
                <div className="flex items-center justify-center gap-2 text-secondary text-sm font-medium mt-2 bg-secondary/10 py-2 rounded-lg">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Esperando foto...</span>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelar}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}

        {/* Estado: Foto recibida */}
        {state === 'received' && fotoPreview && (
          <div className="flex flex-col items-center gap-4 w-full">
            <motion.div
              key="received"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-success-accent shadow-lg">
                <img src={fotoPreview} alt="Foto capturada" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-success-accent text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  <span>Foto capturada</span>
                </div>
                <button
                  type="button"
                  onClick={reintentar}
                  className="text-sm text-on-surface-variant underline hover:text-primary cursor-pointer bg-transparent border-none flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Tomar otra
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
