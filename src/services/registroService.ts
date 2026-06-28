import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Familiar {
  nombrePaciente: string;
  condicion: string;
  nombreApoderado: string;
  telefono: string;
  detallesAdicionales?: string;
  fotoBase64?: string;
}

export const registrarFamiliar = async (datos: Familiar) => {
  if (!db) {
    throw new Error("Base de datos no inicializada. Revisa tus variables de entorno.");
  }
  
  try {
    const docRef = await addDoc(collection(db, 'familiares_vulnerables'), {
      ...datos,
      fechaRegistro: serverTimestamp(),
      estado: 'activo'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al registrar familiar:", error);
    return { success: false, error };
  }
};
