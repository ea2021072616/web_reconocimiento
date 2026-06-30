# Guía de Despliegue en GitHub Pages - SIRE Web (Actualizado)

¡El proyecto ya ha sido configurado y desplegado con éxito en GitHub Pages! 

El sitio está publicado en:
👉 **[https://ea2021072616.github.io/web_reconocimiento/](https://ea2021072616.github.io/web_reconocimiento/)**

---

## 🔄 Flujo de Trabajo para Actualizar la Web

Cada vez que realices cambios o nuevas funciones en el código de tu proyecto, sigue estos tres sencillos pasos para publicarlos de forma segura:

### Paso 1: Realiza tus modificaciones en el código
Edita, programa y prueba tus archivos localmente en tu entorno de desarrollo.

### Paso 2: Despliega los cambios en la web
Ejecuta el siguiente comando en la terminal para compilar el proyecto y subirlo a GitHub Pages de forma automatizada:
```bash
npm run deploy
```
*Los cambios tardarán aproximadamente de 1 a 2 minutos en verse reflejados en la URL pública.*

### Paso 3: Guarda tu código fuente en GitHub
Una vez publicado, no olvides respaldar tu código de desarrollo subiéndolo a tu rama principal (`main`):
```bash
git add .
git commit -m "Descripción de los cambios realizados"
git push origin main
```
