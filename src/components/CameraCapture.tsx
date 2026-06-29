import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  existingPhoto?: string;
}

export const CameraCapture = ({ onCapture, existingPhoto }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string>(existingPhoto || '');
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos de tu navegador.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(base64);
    onCapture(base64);
    stopCamera();
  }, [onCapture, stopCamera]);

  const retake = useCallback(() => {
    setPhoto('');
    startCamera();
  }, [startCamera]);

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />

      {photo ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-success-accent shadow-lg">
            <img src={photo} alt="Foto de rostro" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 text-success-accent text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Foto capturada
          </div>
          <button
            type="button"
            onClick={retake}
            className="text-sm text-on-surface-variant underline hover:text-primary cursor-pointer bg-transparent border-none"
          >
            Tomar otra foto
          </button>
        </div>
      ) : streaming ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border-2 border-secondary shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 border-[3px] border-white/30 rounded-2xl pointer-events-none" />
          </div>
          <p className="text-body-sm text-on-surface-variant text-center">
            Centra tu rostro en el recuadro y presiona el botón
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant text-sm hover:bg-slate-100 bg-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={takePhoto}
              className="px-6 py-2 rounded-lg bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 border-none cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
              Capturar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {error && (
            <p className="text-error-accent text-sm text-center">{error}</p>
          )}
          <button
            type="button"
            onClick={startCamera}
            className="w-full max-w-sm py-8 rounded-2xl border-2 border-dashed border-outline-variant hover:border-secondary
                       bg-surface-container hover:bg-secondary/5 transition-all cursor-pointer
                       flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl">photo_camera</span>
            </div>
            <span className="text-on-surface font-semibold text-sm">Activar cámara</span>
            <span className="text-on-surface-variant text-xs">Foto en vivo · No se permite galería</span>
          </button>
        </div>
      )}
    </div>
  );
};
