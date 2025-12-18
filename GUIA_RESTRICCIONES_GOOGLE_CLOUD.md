# Guía: Configurar Restricciones de Sitios Web en Google Cloud Console

## Formato Correcto para Localhost

Google Cloud Console **NO acepta** el formato `http://localhost:*` directamente. Debes agregar cada puerto individualmente o usar un formato específico.

### Opción 1: Agregar Puertos Específicos (Recomendado para Desarrollo)

Agrega cada puerto que uses, uno por uno:

1. Haz clic en **"+ Add"** (o "Agregar")
2. Agrega estos sitios web uno por uno:
   - `http://localhost:5173/*` (puerto de Vite por defecto)
   - `http://localhost:3000/*` (si usas otro puerto)
   - `http://localhost:5174/*` (si Vite usa otro puerto)
   - `http://localhost:8080/*` (si usas otro puerto)

**Formato:** `http://localhost:PUERTO/*`

### Opción 2: Sin Restricciones (Solo para Desarrollo)

Si estás en desarrollo y quieres probar rápidamente:

1. En "Restricciones de aplicaciones", selecciona **"Ninguno"**
2. Esto permitirá que la API key funcione desde cualquier origen
3. ⚠️ **IMPORTANTE:** Esto NO es seguro para producción

### Opción 3: Usar Referrer HTTP (Formato Alternativo)

Si el formato anterior no funciona, intenta:

- `http://localhost:5173`
- `http://localhost:5173/`
- `http://127.0.0.1:5173/*`

## Pasos Detallados

### 1. Accede a Google Cloud Console

Ve a: https://console.cloud.google.com/apis/credentials

### 2. Selecciona tu API Key

Haz clic en el nombre de tu API key para editarla.

### 3. Configura Restricciones de Aplicación

- En "Restricciones de aplicaciones", selecciona **"Sitios web"**

### 4. Agrega Sitios Web

En "Restricciones de sitios web":

1. Haz clic en **"+ Add"** o **"Agregar"**
2. En el campo que aparece, escribe: `http://localhost:5173/*`
3. Haz clic fuera del campo o presiona Enter
4. Repite para otros puertos si los necesitas

### 5. Guarda los Cambios

- Haz clic en **"Guardar"** (botón azul en la parte inferior)
- Espera hasta 5 minutos para que se apliquen los cambios

## Formato Correcto de URLs

Google Cloud Console acepta estos formatos:

✅ **Correctos:**
- `http://localhost:5173/*`
- `http://localhost:5173/`
- `http://localhost:5173`
- `https://tudominio.com/*`
- `https://*.tudominio.com/*`

❌ **Incorrectos:**
- `http://localhost:*` (no acepta wildcard en el puerto)
- `localhost:5173` (falta el protocolo)
- `http://localhost:5173` sin `/*` (puede funcionar pero es mejor con `/*`)

## Verificación

Después de guardar:

1. Espera 5 minutos
2. Recarga completamente tu aplicación (Ctrl+F5)
3. Verifica en la consola del navegador que no haya errores de CORS

## Para Producción

Cuando despliegues a producción, agrega:

- `https://tudominio.com/*`
- `https://www.tudominio.com/*` (si usas www)

## Solución de Problemas

### Si sigue sin funcionar:

1. **Verifica el puerto exacto:**
   - Mira en la terminal donde corre `npm run dev`
   - Debería decir algo como: `Local: http://localhost:5173/`
   - Usa ese puerto exacto

2. **Prueba sin restricciones temporalmente:**
   - Selecciona "Ninguno" en restricciones de aplicación
   - Si funciona, el problema es el formato de la URL
   - Luego vuelve a agregar las restricciones con el formato correcto

3. **Verifica que guardaste:**
   - Asegúrate de hacer clic en "Guardar"
   - Espera 5 minutos después de guardar

4. **Limpia la caché:**
   - Ctrl+Shift+Delete
   - Limpia caché y cookies
   - Recarga la página

---

**Resumen:** Agrega `http://localhost:5173/*` (con el puerto específico) en lugar de `http://localhost:*`

