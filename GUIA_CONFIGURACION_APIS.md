# Guía de Configuración de APIs para Búsqueda de Cines

Esta guía te ayudará a configurar correctamente Google Places API y Foursquare Places API para obtener los mejores resultados en la búsqueda de cines.

---

## 📍 Google Places API

### APIs que DEBES habilitar en Google Cloud Console

Para que la aplicación funcione correctamente, necesitas habilitar las siguientes APIs en tu proyecto de Google Cloud:

1. **Places API** (NUEVA) ⭐ **OBLIGATORIA**
   - Esta es la API principal que usamos para buscar cines
   - Endpoints usados:
     - `place/textsearch` - Búsqueda por texto (ciudad)
     - `place/nearbysearch` - Búsqueda por proximidad (cuando hay coordenadas)
     - `place/details` - Detalles completos de un cine

2. **Maps JavaScript API** ⭐ **OBLIGATORIA**
   - Ya la tienes habilitada (la usas para los mapas)
   - Necesaria para mostrar mapas en la aplicación

3. **Geocoding API** ⭐ **OBLIGATORIA**
   - Ya la tienes habilitada (la usas para convertir direcciones a coordenadas)
   - Necesaria para geocodificación de direcciones

4. **Places API (Legacy)** - **OPCIONAL**
   - Solo si necesitas compatibilidad con código antiguo
   - No es necesaria si usas Places API (Nueva)

### Pasos para habilitar Places API en Google Cloud Console

1. **Accede a Google Cloud Console:**
   - Ve a: https://console.cloud.google.com/
   - Selecciona tu proyecto (o crea uno nuevo)

2. **Habilita Places API:**
   - Ve a: **APIs y servicios** > **Biblioteca**
   - Busca: **"Places API"** o **"Places API (New)"**
   - Haz clic en el resultado
   - Haz clic en **"HABILITAR"**

3. **Verifica que todas las APIs estén habilitadas:**
   - Ve a: **APIs y servicios** > **APIs habilitadas**
   - Deberías ver:
     - ✅ Maps JavaScript API
     - ✅ Places API (o Places API New)
     - ✅ Geocoding API

4. **Configura restricciones de seguridad (RECOMENDADO):**
   - Ve a: **APIs y servicios** > **Credenciales**
   - Haz clic en tu clave API
   - En **"Restricciones de aplicación"**:
     - Selecciona **"Referencias HTTP (sitios web)"**
     - Agrega tus dominios:
       - `http://localhost:*` (para desarrollo)
       - `https://tudominio.com` (para producción)
   - En **"Restricciones de API"**:
     - Selecciona **"Limitar clave"**
     - Marca solo estas APIs:
       - Maps JavaScript API
       - Places API
       - Geocoding API
   - Guarda los cambios

### Costos de Google Places API

- **Crédito mensual gratuito:** $200 USD (equivalente a ~40,000 búsquedas de texto)
- **Después del crédito gratuito:**
  - Text Search: $32 por cada 1,000 solicitudes
  - Nearby Search: $32 por cada 1,000 solicitudes
  - Place Details: $17 por cada 1,000 solicitudes

**💡 Consejo:** Para una aplicación pequeña/mediana, el crédito gratuito suele ser suficiente.

---

## 🎯 Foursquare Places API

### ¿Qué es Foursquare?

Foursquare es una plataforma de datos de lugares (POI - Points of Interest) que ofrece información sobre negocios, restaurantes, cines, etc. en todo el mundo.

### Ventajas de usar Foursquare

1. **Base de datos masiva:**
   - Más de 100 millones de puntos de interés
   - Cobertura en más de 200 países
   - Datos verificados por usuarios

2. **Información enriquecida:**
   - Más de 16 mil millones de check-ins verificados
   - Más de mil millones de fotos, consejos y reseñas
   - Datos actualizados constantemente

3. **Plan gratuito generoso:**
   - **10,000 llamadas GRATIS** al mes en endpoints Pro
   - **$200 en créditos mensuales** para desarrolladores
   - Perfecto para aplicaciones pequeñas/medianas

4. **Complementa Google Places:**
   - Puede encontrar cines que Google no tiene
   - Datos diferentes pueden enriquecer la información
   - Fallback automático si Google falla

5. **Precios escalables:**
   - Solo pagas por lo que usas
   - Precios competitivos después del plan gratuito

### ¿Es gratuita?

**SÍ, tiene un plan gratuito muy generoso:**
- **10,000 llamadas/mes GRATIS** en endpoints Pro
- **$200 en créditos mensuales** adicionales
- Para la mayoría de aplicaciones pequeñas/medianas, esto es suficiente

### Cómo obtener tu API Key de Foursquare

1. **Regístrate en Foursquare Developers:**
   - Ve a: https://developer.foursquare.com/
   - Haz clic en **"Get Started"** o **"Sign Up"**
   - Crea una cuenta (puedes usar Google, GitHub, o email)

2. **Crea una nueva aplicación:**
   - Una vez dentro del dashboard, haz clic en **"Create a new app"**
   - Completa el formulario:
     - **App Name:** LaPremier (o el nombre que prefieras)
     - **App Website:** Tu sitio web (puede ser localhost para desarrollo)
     - **App Description:** Descripción de tu aplicación
   - Acepta los términos y condiciones

3. **Obtén tu API Key:**
   - Después de crear la app, verás tu **"API Key"**
   - Esta es la clave que necesitas (no necesitas Client ID/Secret para la API v3)
   - **Copia esta clave** - la necesitarás para configurar tu `.env`

4. **Configuración adicional (opcional):**
   - Puedes configurar límites de uso en el dashboard
   - Revisa los endpoints disponibles en la documentación

### Precios de Foursquare (después del plan gratuito)

**Endpoints Pro:**
- 0-10,000 llamadas: **GRATIS** ✅
- 10,001-100,000: $15 por cada 1,000 llamadas
- 100,001-500,000: $12 por cada 1,000 llamadas
- Más de 500,000: Precios escalados

**💡 Nota:** Para la mayoría de aplicaciones, el plan gratuito es más que suficiente.

---

## ⚙️ Configuración en tu aplicación

### 1. Variables de entorno (.env)

Agrega estas variables a tu archivo `.env` en `LaPremier_client/`:

```env
# Google Maps API (ya lo tienes)
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui

# Google Places API (usa la misma clave que Google Maps)
VITE_GOOGLE_PLACES_API_KEY=tu_google_maps_api_key_aqui

# Foursquare Places API (nueva)
VITE_FOURSQUARE_API_KEY=tu_foursquare_api_key_aqui
```

**💡 Nota:** Para Google Places, puedes usar la misma clave que Google Maps, solo asegúrate de que tenga habilitadas todas las APIs necesarias.

### 2. Verificar configuración

Después de agregar las variables, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

La aplicación detectará automáticamente qué APIs están disponibles y las usará en este orden:

1. **Google Places** (si está configurada) - Primera opción
2. **Foursquare** (si está configurada) - Segunda opción
3. **OpenStreetMap** (siempre disponible) - Fallback gratuito

---

## 🔍 Cómo funciona la búsqueda

Cuando un usuario selecciona una ciudad (ej: Zaragoza):

1. **Primero:** Busca cines en tu base de datos local
2. **Si no hay cines locales:** Busca automáticamente desde APIs externas
3. **Orden de búsqueda:**
   - Google Places (si está configurada)
   - Foursquare (si Google falla o no está configurada)
   - OpenStreetMap (siempre disponible como último recurso)

4. **Resultados:** Muestra los cines encontrados con opción de agregarlos a tu base de datos

---

## 📊 Comparación de APIs

| Característica | Google Places | Foursquare | OpenStreetMap |
|---------------|--------------|------------|---------------|
| **Plan gratuito** | $200 crédito/mes | 10,000 llamadas/mes | Ilimitado |
| **Calidad de datos** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Muy buena | ⭐⭐⭐ Buena |
| **Cobertura** | Global | Global | Global |
| **Información detallada** | Sí | Sí | Limitada |
| **Valoraciones** | Sí | Sí | No |
| **Fotos** | Sí | Sí | No |
| **Requisitos** | API Key | API Key | Ninguno |

---

## ✅ Checklist de configuración

### Google Places API
- [ ] Crear/habilitar proyecto en Google Cloud Console
- [ ] Habilitar **Places API** (o Places API New)
- [ ] Verificar que **Maps JavaScript API** esté habilitada
- [ ] Verificar que **Geocoding API** esté habilitada
- [ ] Configurar restricciones de seguridad en la clave API
- [ ] Agregar `VITE_GOOGLE_PLACES_API_KEY` al `.env`

### Foursquare Places API
- [ ] Crear cuenta en Foursquare Developers
- [ ] Crear una nueva aplicación
- [ ] Copiar la API Key
- [ ] Agregar `VITE_FOURSQUARE_API_KEY` al `.env`

### Verificación
- [ ] Reiniciar servidor de desarrollo
- [ ] Probar búsqueda de cines en una ciudad
- [ ] Verificar que se muestren cines desde las APIs

---

## 🆘 Solución de problemas

### Error: "Google Places API error: REQUEST_DENIED"
- **Causa:** La API no está habilitada o la clave no tiene permisos
- **Solución:** Verifica que Places API esté habilitada en Google Cloud Console

### Error: "Google Places API error: INVALID_REQUEST"
- **Causa:** La solicitud tiene parámetros incorrectos
- **Solución:** Verifica que la clave API tenga las restricciones correctas

### No aparecen cines desde Foursquare
- **Causa:** La API Key no está configurada o es incorrecta
- **Solución:** Verifica que `VITE_FOURSQUARE_API_KEY` esté en el `.env` y sea correcta

### Se muestra "Usando OpenStreetMap"
- **Causa:** Ninguna de las APIs está configurada
- **Solución:** Configura al menos Google Places o Foursquare

---

## 📚 Recursos adicionales

- **Google Places API Docs:** https://developers.google.com/maps/documentation/places/web-service
- **Foursquare API Docs:** https://developer.foursquare.com/docs
- **Google Cloud Console:** https://console.cloud.google.com/
- **Foursquare Developers:** https://developer.foursquare.com/

---

## 💡 Recomendaciones

1. **Para desarrollo:** Usa Google Places (ya lo tienes configurado)
2. **Para producción:** Configura ambas APIs para mejor cobertura
3. **Monitorea el uso:** Revisa regularmente el uso en los dashboards
4. **Configura alertas:** Establece alertas de uso en Google Cloud Console
5. **Usa restricciones:** Siempre restringe tus claves API por dominio/IP

---

¡Con esta configuración tendrás acceso a millones de cines en todo el mundo! 🎬🌍

