import { doc, getDoc, setDoc, getDocs, deleteDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
// Ya no usamos storageService

export interface DatosMedicos {
  enfermedadesCronicas: string[];
  condicionesEspeciales: string[];
  observaciones: string;
}

export interface PersonaData {
  dni: string;
  nombres: string;
  apellidos: string;
  fotoUrl: string;
  datosMedicos: DatosMedicos;
  consentimiento: boolean;
  cuentaTitular?: string; // Legacy
  esTitular: boolean;
  estado: 'titular' | 'registrado_por_familiar';
}

export interface VinculoFamiliar {
  id: string; // titularDni_familiarDni
  titularDni: string;
  familiarDni: string;
  relacion: string; // e.g., 'Hijo/a', 'Hermano/a'
  creadoEn: any;
}

export interface FamiliarData extends PersonaData {
  relacion: string;
  vinculoId: string;
}

/**
 * Verifica si un DNI ya existe en la colección de personas.
 */
export const verificarPersonaExiste = async (dni: string): Promise<boolean> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const docRef = doc(db, 'personas', dni);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

/**
 * Registra una persona (titular o familiar).
 */
export const registrarPersona = async (
  data: {
    dni: string;
    nombres: string;
    apellidos: string;
    fotoBase64: string;
    datosMedicos: DatosMedicos;
    consentimiento: boolean;
    cuentaTitular: string;
    esTitular: boolean;
  }
): Promise<{ success: boolean; error?: string }> => {
  if (!db) throw new Error('Base de datos no inicializada.');

  // Verificar unicidad de DNI en personas
  if (!data.esTitular) {
    const existe = await verificarPersonaExiste(data.dni);
    if (existe) {
      return { success: false, error: 'Este DNI ya está registrado en el sistema.' };
    }
  }

  // Guardar la foto directamente como base64 en la base de datos
  let fotoUrl = '';
  if (data.fotoBase64) {
    fotoUrl = data.fotoBase64;
  }

  // Guardar persona en Firestore
  await setDoc(doc(db, 'personas', data.dni), {
    dni: data.dni,
    nombres: data.nombres,
    apellidos: data.apellidos,
    fotoUrl,
    datosMedicos: data.datosMedicos,
    consentimiento: data.consentimiento,
    cuentaTitular: data.cuentaTitular,
    esTitular: data.esTitular,
    estado: data.esTitular ? 'titular' : 'registrado_por_familiar',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return { success: true };
};

/**
 * Crea o actualiza un vínculo familiar entre un titular y un familiar
 */
export const crearVinculoFamiliar = async (titularDni: string, familiarDni: string, relacion: string): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const id = `${titularDni}_${familiarDni}`;
  const docRef = doc(db, 'vinculos_familiares', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    await setDoc(docRef, {
      relacion,
      actualizadoEn: serverTimestamp(),
    }, { merge: true });
  } else {
    await setDoc(docRef, {
      id,
      titularDni,
      familiarDni,
      relacion,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  }
};

/**
 * Verifica si ya existe un vínculo familiar entre el titular y el familiar
 */
export const verificarVinculoExiste = async (titularDni: string, familiarDni: string): Promise<boolean> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const id = `${titularDni}_${familiarDni}`;
  const docRef = doc(db, 'vinculos_familiares', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

/**
 * Obtiene los datos de una persona por DNI.
 */
export const obtenerPersona = async (dni: string): Promise<PersonaData | null> => {
  if (!db) return null;
  const docRef = doc(db, 'personas', dni);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as PersonaData;
};

/**
 * Obtiene todos los familiares registrados bajo una cuenta titular usando los vínculos.
 */
export const obtenerFamiliares = async (cuentaTitularDni: string): Promise<FamiliarData[]> => {
  if (!db) return [];
  // 1. Obtener todos los vínculos del titular
  const q = query(
    collection(db, 'vinculos_familiares'),
    where('titularDni', '==', cuentaTitularDni)
  );
  const snapshot = await getDocs(q);
  const vinculos = snapshot.docs.map(d => d.data() as VinculoFamiliar);

  // 2. Obtener los datos de cada persona vinculada
  const familiares: FamiliarData[] = [];
  for (const vinculo of vinculos) {
    const persona = await obtenerPersona(vinculo.familiarDni);
    if (persona) {
      familiares.push({
        ...persona,
        relacion: vinculo.relacion,
        vinculoId: vinculo.id,
      });
    }
  }

  return familiares;
};

/**
 * Obtiene todos los titulares (responsables) que tienen vinculado a este familiar (Lectura Hacia Arriba).
 */
export const obtenerResponsables = async (familiarDni: string): Promise<FamiliarData[]> => {
  if (!db) return [];
  // 1. Obtener todos los vínculos donde este DNI es el familiar
  const q = query(
    collection(db, 'vinculos_familiares'),
    where('familiarDni', '==', familiarDni)
  );
  const snapshot = await getDocs(q);
  const vinculos = snapshot.docs.map(d => d.data() as VinculoFamiliar);

  // 2. Obtener los datos de cada titular
  const responsables: FamiliarData[] = [];
  for (const vinculo of vinculos) {
    const persona = await obtenerPersona(vinculo.titularDni);
    if (persona) {
      responsables.push({
        ...persona,
        relacion: vinculo.relacion,
        vinculoId: vinculo.id,
      });
    }
  }

  return responsables;
};

/**
 * Actualiza los datos de una persona.
 */
export const actualizarPersona = async (
  dni: string,
  data: Partial<Omit<PersonaData, 'dni' | 'cuentaTitular' | 'esTitular' | 'estado'>>,
  nuevaFotoBase64?: string
): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');

  const updateData: Record<string, unknown> = {
    ...data,
    actualizadoEn: serverTimestamp(),
  };

  if (nuevaFotoBase64) {
    updateData.fotoUrl = nuevaFotoBase64;
  }

  await setDoc(doc(db, 'personas', dni), updateData, { merge: true });
};

/**
 * Elimina una persona (Legacy). No usar para borrar familiares del panel.
 */
export const eliminarPersona = async (dni: string): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const docRef = doc(db, 'personas', dni);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await deleteDoc(docRef);
  }
};

/**
 * Elimina un vínculo familiar
 */
export const eliminarVinculoFamiliar = async (vinculoId: string): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  await deleteDoc(doc(db, 'vinculos_familiares', vinculoId));
};
