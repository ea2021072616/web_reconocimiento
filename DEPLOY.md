# Guía de Despliegue en GitHub Pages - SIRE Web

Esta guía detalla los pasos necesarios para compilar y desplegar la aplicación React `web_registro_familiares` en GitHub Pages de forma correcta.

---

## 🛠️ Requisitos de Configuración

Antes de desplegar, debes realizar tres configuraciones indispensables en tu proyecto local para evitar errores comunes (pantallas en blanco o fallas en llamadas a la API).

### 1. Configurar la Ruta Base en Vite
Por defecto, GitHub Pages aloja tu sitio en una subcarpeta (ejemplo: `https://tu-usuario.github.io/tu-repositorio/`). Debes indicar esta ruta base a Vite.

1. Abre el archivo `vite.config.ts`.
2. Modifica la configuración agregando la propiedad `base`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nombre-de-tu-repositorio/', // 👈 REEMPLAZA con el nombre exacto de tu repo en GitHub
})
```

---

### 2. Cambiar a `HashRouter` (Evitar error 404 en recarga)
GitHub Pages es un servidor de archivos estáticos y no entiende el enrutamiento dinámico de Single Page Applications (SPA). Si usas `BrowserRouter` y recargas la página en una subruta (como `/panel`), el servidor responderá con un error **404**.

**Solución:** Cambia tu Router principal a `HashRouter` en tu archivo de arranque (normalmente `src/main.tsx` o `src/App.tsx`):

```typescript
import { HashRouter } from 'react-router-dom';

// Reemplaza <BrowserRouter> por <HashRouter>
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```
*Las URLs ahora lucirán así: `https://tu-usuario.github.io/tu-repositorio/#/panel` pero funcionarán sin dar errores de 404.*

---

### 3. Configuración del Endpoint de la API (Cuidado con HTTPS)
Dado que GitHub Pages funciona obligatoriamente bajo **HTTPS** (conexión segura), los navegadores web **bloquearán** cualquier petición realizada a endpoints locales `http://localhost:8000` debido a políticas de **Mixed Content** (Contenido Mixto).

*   **Solución:** Tu API Python debe ser accesible mediante una URL segura HTTPS. 
*   Usa el dominio HTTPS seguro que te provee tu servicio de **Cloudflare Tunnel** (ejemplo: `https://tu-api.trycloudflare.com`).
*   Configura tu variable de entorno `VITE_API_URL` apuntando a dicho enlace seguro antes de construir el bundle.

---

## 🚀 Pasos para Publicar en GitHub Pages

La forma más automatizada de publicar es utilizando el paquete `gh-pages` de NPM.

### Paso 1: Instalar la dependencia de desarrollo
Ejecuta el siguiente comando en la carpeta raíz del frontend (`web_registro_familiares`):

```bash
npm install -D gh-pages
```

### Paso 2: Configurar los Scripts en `package.json`
Abre tu archivo `package.json` y añade los scripts de `predeploy` y `deploy` dentro de la sección `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Paso 3: Desplegar la Aplicación
Asegúrate de que tu código local esté sincronizado con tu repositorio en GitHub y ejecuta:

```bash
npm run deploy
```

**¿Qué hace este comando tras bambalinas?**
1. Ejecuta `predeploy` para compilar todo tu proyecto en la carpeta `dist`.
2. Crea una rama oculta en tu repositorio de GitHub llamada `gh-pages`.
3. Sube únicamente los archivos de distribución compilados a esa rama.

### Paso 4: Habilitar GitHub Pages en el repositorio
1. Entra a tu repositorio en GitHub desde el navegador.
2. Ve a **Settings** (Configuración) ➔ **Pages**.
3. En la sección **Build and deployment**, asegúrate de que la fuente sea **Deploy from a branch**.
4. En **Branch**, selecciona la rama **`gh-pages`** y la carpeta `/ (root)`.
5. Presiona **Save**.

¡Listo! En unos minutos tu sitio estará al aire en la URL que te muestre GitHub Pages en esa misma sección.
