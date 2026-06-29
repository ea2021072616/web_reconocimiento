import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ContactoEmergencia {
  id?: string;
  nombre: string;
  telefono: string;
  calle: string;
  distrito: string;
  referencia: string;
}

/**
 * Agrega un contacto de emergencia a la cuenta.
 */
export const agregarContacto = async (cuentaDni: string, data: Omit<ContactoEmergencia, 'id'>): Promise<string> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const colRef = collection(db, 'cuentas', cuentaDni, 'contactosEmergencia');
  const docRef = await addDoc(colRef, {
    ...data,
    creadoEn: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Obtiene todos los contactos de emergencia de una cuenta.
 */
export const obtenerContactos = async (cuentaDni: string): Promise<ContactoEmergencia[]> => {
  if (!db) return [];
  const colRef = collection(db, 'cuentas', cuentaDni, 'contactosEmergencia');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as ContactoEmergencia[];
};

/**
 * Actualiza un contacto de emergencia.
 */
export const actualizarContacto = async (
  cuentaDni: string,
  contactoId: string,
  data: Partial<Omit<ContactoEmergencia, 'id'>>
): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const docRef = doc(db, 'cuentas', cuentaDni, 'contactosEmergencia', contactoId);
  await updateDoc(docRef, { ...data });
};

/**
 * Elimina un contacto de emergencia.
 */
export const eliminarContacto = async (cuentaDni: string, contactoId: string): Promise<void> => {
  if (!db) throw new Error('Base de datos no inicializada.');
  const docRef = doc(db, 'cuentas', cuentaDni, 'contactosEmergencia', contactoId);
  await deleteDoc(docRef);
};
