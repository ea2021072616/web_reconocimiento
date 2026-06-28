import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Recuerda configurar estas variables en tu archivo .env local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase solo si hay configuracion (evita crash en UI al iniciar sin env variables)
let app;
let db: any;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.warn("⚠️ Advertencia: Variables de entorno de Firebase no configuradas.");
}

export { db };
