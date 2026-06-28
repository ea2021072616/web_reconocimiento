# SIRE Protect - Web Registro de Familiares

Este es el sistema web para el registro de personas con condiciones vulnerables (Alzheimer, Demencia Senil, Autismo, etc.). Permite registrar los datos básicos de la persona, contacto del familiar y, opcionalmente, capturar una foto a través del teléfono celular del usuario escaneando un código QR. Toda la información se guarda en la base de datos segura (Firebase).

## 🚀 Requisitos

- **Node.js** v18+ (Recomendado)
- **Firebase:** El proyecto necesita las variables de entorno para funcionar, estas deben estar definidas en un archivo `.env` en la raíz del proyecto (basado en `.env.example`).
- **API de Reconocimiento:** Para la captura de foto vía QR, la aplicación web debe poder comunicarse con la API de reconocimiento (la cual maneja la conexión WebSocket con el dispositivo móvil). La URL de la API se configura en el `.env`.

## 🛠️ Comandos de Desarrollo

### 1. Instalar dependencias
La primera vez que clonas el repositorio o si se añaden nuevas dependencias, debes instalarlas:
```bash
npm install
```

### 2. Ejecutar Servidor de Desarrollo
Para correr el proyecto en modo de desarrollo:
```bash
npm run dev
```
Esto levantará la aplicación web localmente, usualmente en `http://localhost:5173`. Si quieres exponerlo en tu red local (por ejemplo, para abrirlo en tu celular conectado al mismo WiFi), usa:
```bash
npm run dev -- --host
```

### 3. Construir para Producción
Cuando estés listo para subir el proyecto a producción (Hosting), genera los archivos estáticos optimizados:
```bash
npm run build
```
Esto creará una carpeta `dist` con los archivos listos para desplegar en cualquier proveedor de hosting estático (como Firebase Hosting, Vercel, Netlify). Puedes probar el build localmente con:
```bash
npm run preview
```

## 📸 Funcionamiento de Captura QR (Sesiones)

1. El usuario completa el formulario y al llegar a la opción de la foto, hace clic en "Capturar foto con el celular".
2. La web React solicita un **WebSocket** hacia `VITE_API_URL`.
3. Se muestra un QR. El familiar escanea el QR con su celular.
4. El QR lo redirige a una página alojada en la API que usa la cámara del celular.
5. El familiar toma la foto y la envía; la foto pasa de forma transparente (relay) a través de la API hacia la web de React usando la conexión abierta por WebSocket.
6. La web muestra la captura y, al finalizar, guarda el registro íntegro en Firestore, incluyendo la foto (`fotoBase64`).
