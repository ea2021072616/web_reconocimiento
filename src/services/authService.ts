import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';

export interface CuentaData {
  dni: string;
  passwordHash: string;
  celular?: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  aceptoTerminos: boolean;
  tipoRegistro: 'solo' | 'familia' | null;
  registroCompletado: boolean;
}

/**
 * Verifica si un DNI ya tiene cuenta registrada.
 */
export const verificarDniExiste = async (dni: string): Promise<boolean> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const docRef = doc(db, 'cuentas', dni);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

/**
 * Crea una cuenta nueva. Hashea la contraseña con bcrypt.
 */
export const crearCuenta = async (data: {
  dni: string;
  password: string;
  celular?: string;
  correo?: string;
}): Promise<{ success: boolean; error?: string }> => {
  if (!db) throw new Error('Base de datos no inicializada.');

  // Verificar si ya existe
  const existe = await verificarDniExiste(data.dni);
  if (existe) {
    return { success: false, error: 'Este DNI ya tiene una cuenta registrada.' };
  }

  // Hashear contraseña
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Consultar RENIEC mediante json.pe de forma tolerante a errores
  let nombres: string | null = null;
  let apellidos: string | null = null;

  try {
    const apiKey = import.meta.env.VITE_RENIEC_API_KEY || import.meta.env.RENIEC_API_KEY || 'd43b2d7d63af0ae44998244ecbfe8f66db8f3cceca6c9b535bd571fb48e1';
    const response = await fetch('https://api.json.pe/api/dni', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ dni: data.dni }),
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.data) {
        nombres = resData.data.nombres || null;
        const pat = resData.data.apellido_paterno || resData.data.apellidoPaterno || '';
        const mat = resData.data.apellido_materno || resData.data.apellidoMaterno || '';
        const fullApellidos = `${pat} ${mat}`.trim();
        if (fullApellidos.length > 0) {
          apellidos = fullApellidos;
        }
      }
    }
  } catch (err) {
    console.error('Error consultando RENIEC en registro:', err);
  }

  // Guardar en Firestore
  await setDoc(doc(db, 'cuentas', data.dni), {
    dni: data.dni,
    passwordHash,
    celular: data.celular || null,
    correo: data.correo || null,
    nombres,
    apellidos,
    aceptoTerminos: true,
    tipoRegistro: null,
    registroCompletado: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return { success: true };
};

/**
 * Inicia sesión verificando DNI + contraseña contra el hash en BD.
 */
export const iniciarSesion = async (dni: string, password: string): Promise<{ success: boolean; cuenta?: CuentaData; error?: string }> => {
  if (!db) throw new Error('Base de datos no inicializada.');

  const docRef = doc(db, 'cuentas', dni);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { success: false, error: 'DNI o contraseña incorrectos.' };
  }

  const cuenta = docSnap.data() as CuentaData;
  const passwordValida = await bcrypt.compare(password, cuenta.passwordHash);

  if (!passwordValida) {
    return { success: false, error: 'DNI o contraseña incorrectos.' };
  }

  return { success: true, cuenta };
};

/**
 * Obtiene los datos de una cuenta por DNI.
 */
export const obtenerCuenta = async (dni: string): Promise<CuentaData | null> => {
  if (!db) return null;
  const docRef = doc(db, 'cuentas', dni);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as CuentaData;
};

/**
 * Actualiza campos de la cuenta (ej. tipoRegistro, registroCompletado).
 */
export const actualizarCuenta = async (dni: string, data: Partial<CuentaData>): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  await setDoc(doc(db, 'cuentas', dni), {
    ...data,
    actualizadoEn: serverTimestamp(),
  }, { merge: true });
};
