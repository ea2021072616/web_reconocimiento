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
  rostro_sincronizado?: boolean;
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

// Helper para obtener el parentesco inverso usando SOLO las opciones permitidas
export const obtenerInversoParentesco = (relacion: string): string => {
  switch (relacion) {
    case 'Hijo/a': return 'Padre/Madre';
    case 'Padre/Madre': return 'Hijo/a';
    case 'Pareja': return 'Pareja';
    case 'Hermano/a': return 'Hermano/a';
    case 'Abuelo/a': return 'Nieto/a';
    case 'Nieto/a': return 'Abuelo/a';
    case 'Tío/a': return 'Sobrino/a';
    case 'Sobrino/a': return 'Tío/a';
    case 'Primo/a': return 'Primo/a';
    default: return 'Otro';
  }
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
    rostro_sincronizado: false,
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
  
  const relacionInversa = obtenerInversoParentesco(relacion);

  // 1. Crear/Actualizar Vínculo Directo (titular -> familiar)
  // Regla del cliente: titularDni_familiarDni significa "titular es [relacionInversa] de familiar"
  const idDirecto = `${titularDni}_${familiarDni}`;
  const docRefDirecto = doc(db, 'vinculos_familiares', idDirecto);
  const docSnapDirecto = await getDoc(docRefDirecto);
  
  if (docSnapDirecto.exists()) {
    await setDoc(docRefDirecto, {
      relacion: relacionInversa,
      actualizadoEn: serverTimestamp(),
    }, { merge: true });
  } else {
    await setDoc(docRefDirecto, {
      id: idDirecto,
      titularDni,
      familiarDni,
      relacion: relacionInversa,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  }

  // 2. Crear/Actualizar Vínculo Inverso (familiar -> titular)
  // Regla del cliente: familiarDni_titularDni significa "familiar es [relacion] de titular"
  const idInverso = `${familiarDni}_${titularDni}`;
  const docRefInverso = doc(db, 'vinculos_familiares', idInverso);
  const docSnapInverso = await getDoc(docRefInverso);

  if (docSnapInverso.exists()) {
    await setDoc(docRefInverso, {
      relacion: relacion,
      actualizadoEn: serverTimestamp(),
    }, { merge: true });
  } else {
    await setDoc(docRefInverso, {
      id: idInverso,
      titularDni: familiarDni,   // El familiar ahora es el titular de este documento
      familiarDni: titularDni,   // El titular original es el familiar en este documento
      relacion: relacion,
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
        // Como la DB guarda lo que Titular es de Familiar,
        // invertimos el parentesco para mostrar en la UI lo que Familiar es de Titular.
        relacion: obtenerInversoParentesco(vinculo.relacion),
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

/**
 * Asegura que los datos de la persona existan en 'datos_reniec' y
 * que su rostro esté indexado en Qdrant.
 * Actualiza el campo 'rostro_sincronizado' en la colección 'personas'.
 */
export const asegurarSincronizacionCompleta = async (
  dni: string,
  fotoBase64Capturada?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) throw new Error('Base de datos no inicializada.');

  try {
    // 1. Verificar si existe en 'datos_reniec'
    const reniecRef = doc(db, 'datos_reniec', dni);
    const reniecSnap = await getDoc(reniecRef);
    let datosReniec: any = null;

    if (reniecSnap.exists()) {
      datosReniec = reniecSnap.data();
    } else {
      // Consultar API Avanzada mediante proxy seguro del backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/proxy/biometria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni }),
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.message === 'found data' && resJson.result) {
          datosReniec = resJson.result;
          // Guardar en firestore
          await setDoc(reniecRef, datosReniec);
        }
      }
    }

    // 2. Intentar indexar en Qdrant
    // Buscamos la foto base64 de la RENIEC, o usamos la foto capturada como fallback
    let fotoB64 = datosReniec?.imagenes?.foto || fotoBase64Capturada;

    if (!fotoB64) {
      await setDoc(doc(db, 'personas', dni), {
        rostro_sincronizado: false,
      }, { merge: true });
      return { success: false, error: 'No se encontró una foto de rostro para indexar.' };
    }

    // Limpiar prefijo data:image/jpeg;base64, si lo tiene
    if (fotoB64.includes(',')) {
      fotoB64 = fotoB64.split(',')[1];
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const qdrantResponse = await fetch(`${apiUrl}/indexar_base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        dni,
        foto_b64: fotoB64,
      }),
    });

    if (qdrantResponse.ok) {
      const qdrantJson = await qdrantResponse.json();
      if (qdrantJson.estado === 'exito') {
        // Éxito: actualizar personas con rostro_sincronizado: true
        await setDoc(doc(db, 'personas', dni), {
          rostro_sincronizado: true,
        }, { merge: true });
        return { success: true };
      }
    }

    // Si falló la llamada a Qdrant
    await setDoc(doc(db, 'personas', dni), {
      rostro_sincronizado: false,
    }, { merge: true });
    return { success: false, error: 'La API de indexación facial no respondió con éxito.' };

  } catch (err: any) {
    console.error('Error en asegurarSincronizacionCompleta:', err);
    await setDoc(doc(db, 'personas', dni), {
      rostro_sincronizado: false,
    }, { merge: true });
    return { success: false, error: err.message || 'Error de conexión con los servicios de indexación.' };
  }
};
