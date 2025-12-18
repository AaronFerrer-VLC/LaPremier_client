# Solución de Problemas - Google Maps API

## Error: "Failed to load Google Maps script"

Este error indica que el script de Google Maps no se puede cargar. Sigue estos pasos:

### 1. Verificar API Key en `.env`

Asegúrate de que tu archivo `.env` en `LaPremier_client/` tenga:

```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

**Importante:** 
- No uses comillas alrededor del valor
- No dejes espacios antes o después del `=`
- Reinicia el servidor de desarrollo después de cambiar el `.env`

### 2. Verificar Restricciones en Google Cloud Console

#### Restricciones de Aplicación:
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu API Key
3. En "Restricciones de aplicaciones", selecciona **"Sitios web"**
4. En "Restricciones de sitios web", agrega:
   - `http://localhost:*` (para desarrollo)
   - `https://tudominio.com` (para producción)

#### Restricciones de API:
1. En "Restricciones de API", selecciona **"Restringir clave"**
2. Asegúrate de que estas APIs estén seleccionadas:
   - ✅ **Maps JavaScript API** (OBLIGATORIA)
   - ✅ **Places API** o **Places API (New)** (OBLIGATORIA)
   - ✅ **Geocoding API** (OBLIGATORIA)
   - ✅ **Directions API** (si usas rutas)

### 3. Verificar que las APIs estén Habilitadas

1. Ve a: https://console.cloud.google.com/apis/library
2. Busca y habilita estas APIs:
   - Maps JavaScript API
   - Places API (o Places API New)
   - Geocoding API

### 4. Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca:

1. **Errores de red:**
   - Ve a la pestaña "Network"
   - Busca solicitudes a `maps.googleapis.com`
   - Si ves errores 403 o 400, la API key tiene problemas

2. **Mensajes de error específicos:**
   - `RefererNotAllowedMapError` = Restricciones de sitio web incorrectas
   - `ApiNotActivatedMapError` = API no habilitada
   - `InvalidKeyMapError` = API key inválida

### 5. Probar la API Key Directamente

Abre esta URL en tu navegador (reemplaza `TU_API_KEY`):

```
https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&callback=initMap
```

- Si funciona: El problema está en la aplicación
- Si no funciona: El problema está en la configuración de la API key

### 6. Soluciones Comunes

#### Problema: "RefererNotAllowedMapError"
**Solución:** Agrega `http://localhost:*` en las restricciones de sitios web

#### Problema: "ApiNotActivatedMapError"
**Solución:** Habilita Maps JavaScript API en Google Cloud Console

#### Problema: El script se carga pero los mapas no aparecen
**Solución:** Verifica que Places API y Geocoding API estén habilitadas

### 7. Verificar Variables de Entorno

En la consola del navegador, ejecuta:

```javascript
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
```

- Si muestra `undefined`: El `.env` no se está leyendo correctamente
- Si muestra la key: El problema está en las restricciones o APIs

### 8. Reiniciar Servidor

Después de cambiar el `.env` o las restricciones:

1. Detén el servidor (Ctrl+C)
2. Espera 5 minutos (si cambiaste restricciones en Google Cloud)
3. Reinicia: `npm run dev`

### 9. Verificar Logs

Revisa la consola del navegador para ver los logs de diagnóstico:
- Busca mensajes que empiecen con `[useGoogleMaps]`
- Estos te dirán si la API key se está cargando correctamente

### 10. Contacto con Soporte

Si nada funciona:
1. Verifica que tu cuenta de Google Cloud tenga facturación habilitada (aunque uses el crédito gratuito)
2. Revisa el dashboard de Google Cloud para ver si hay errores
3. Verifica que no hayas excedido las cuotas

---

## Checklist Rápido

- [ ] API Key está en `.env` como `VITE_GOOGLE_MAPS_API_KEY=...`
- [ ] Servidor reiniciado después de cambiar `.env`
- [ ] `http://localhost:*` agregado en restricciones de sitios web
- [ ] Maps JavaScript API habilitada
- [ ] Places API habilitada
- [ ] Geocoding API habilitada
- [ ] Esperado 5 minutos después de cambiar restricciones
- [ ] Sin errores 403/400 en Network tab

