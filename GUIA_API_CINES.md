# 🎬 Guía Completa: Integración de APIs de Cines

## ✅ Implementación Completada

Se ha implementado un sistema completo para buscar y sincronizar cines desde APIs externas.

---

## 🚀 Cómo Usar

### 1. **Acceder a la Página de Sincronización**

1. Inicia sesión como administrador
2. Ve al menú "Administrar" en la navegación
3. Selecciona "Sincronizar cines (API)"
4. O accede directamente a: `/cines/sincronizar`

### 2. **Buscar Cines**

1. En la pestaña "🔍 Buscar Cines":
   - Ingresa el nombre de una ciudad (ej: "Madrid", "Barcelona")
   - Haz clic en "🔍 Buscar Cines"
   - La aplicación buscará cines usando las APIs configuradas

2. **Resultados:**
   - Verás una lista de cines encontrados
   - Cada cine muestra: nombre, dirección, valoración (si está disponible)
   - La fuente de datos (Google Places, Foursquare, o OpenStreetMap)

### 3. **Seleccionar y Sincronizar**

1. Haz clic en "Seleccionar" en el cine que quieras agregar
2. Ve a la pestaña "✅ Cine Seleccionado"
3. Revisa la información del cine
4. Haz clic en "💾 Sincronizar a Base de Datos"
5. El cine se agregará a tu base de datos local
6. Serás redirigido a la página de edición para completar detalles (precios, servicios, etc.)

---

## 🔧 Configuración de APIs

### Opción 1: Google Places API (Recomendado) ⭐

**Ventajas:**
- ✅ Muy completa y precisa
- ✅ Información detallada (horarios, fotos, ratings)
- ✅ Integración con Google Maps

**Pasos para configurar:**

1. **Crear proyecto en Google Cloud:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Places API:**
   - En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
   - Busca "Places API"
   - Haz clic en "Habilitar"

3. **Crear API Key:**
   - Ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" > "Clave de API"
   - Copia la clave generada

4. **Restringir la API Key (Recomendado):**
   - Haz clic en la API key creada
   - En "Restricciones de API", selecciona "Restringir clave"
   - Selecciona "Places API"
   - En "Restricciones de aplicación", puedes restringir por dominio HTTP referrer

5. **Agregar al .env:**
   ```env
   VITE_GOOGLE_PLACES_API_KEY=tu_api_key_aqui
   ```

**Costo:** 
- $200 créditos gratis/mes
- Luego: $0.017 por request (Text Search) o $0.032 por request (Nearby Search)

---

### Opción 2: Foursquare Places API

**Ventajas:**
- ✅ Buena cobertura
- ✅ Plan gratuito disponible
- ✅ Información detallada

**Pasos para configurar:**

1. **Crear cuenta:**
   - Ve a [Foursquare Developers](https://developer.foursquare.com/)
   - Crea una cuenta o inicia sesión

2. **Crear proyecto:**
   - Ve a "My Apps"
   - Haz clic en "Create a new app"
   - Completa el formulario

3. **Obtener API Key:**
   - En la página de tu app, copia el "API Key"

4. **Agregar al .env:**
   ```env
   VITE_FOURSQUARE_API_KEY=tu_api_key_aqui
   ```

**Costo:**
- Plan gratuito: 50,000 requests/mes
- Luego: Planes de pago disponibles

---

### Opción 3: OpenStreetMap (Gratis) 🆓

**Ventajas:**
- ✅ 100% GRATIS
- ✅ No requiere API key
- ✅ Ya está configurado como fallback

**No requiere configuración** - Funciona automáticamente si no hay otras APIs configuradas.

**Limitaciones:**
- Información más básica
- Puede ser menos precisa
- Sin ratings ni horarios

---

## 📊 Orden de Prioridad

La aplicación intenta usar las APIs en este orden:

1. **Google Places API** (si está configurada)
2. **Foursquare Places API** (si está configurada)
3. **OpenStreetMap** (siempre disponible como fallback)

Si una API falla, automáticamente intenta con la siguiente.

---

## 🎯 Flujo de Trabajo Recomendado

### Para Administradores:

1. **Configura al menos una API** (Google Places recomendado)
2. **Busca cines en tu ciudad** usando la página de sincronización
3. **Selecciona los cines** que quieras agregar
4. **Sincroniza** a la base de datos local
5. **Completa la información** en la página de edición:
   - Precios (regular, fin de semana, especial)
   - Servicios (parking, comida, etc.)
   - Especificaciones (3D, VO, accesibilidad)
   - Capacidad (salas, butacas)
   - Fotos/portadas
   - Asociar películas

### Para Usuarios:

- Los cines sincronizados aparecerán automáticamente en:
  - Página de cines (`/cines`)
  - HomePage (filtrados por ciudad)
  - Página de películas en cartelera (`/peliculas/cartelera`)

---

## 🔍 Características Implementadas

### ✅ Búsqueda de Cines
- Búsqueda por ciudad
- Uso de geolocalización para mayor precisión
- Múltiples fuentes de datos

### ✅ Sincronización
- Sincronización automática a base de datos local
- Preservación de datos de API (placeId, source, location)
- Redirección a edición para completar detalles

### ✅ Interfaz de Usuario
- Componente de búsqueda intuitivo
- Lista de resultados con información relevante
- Indicador de fuente de datos
- Alertas informativas

---

## 📝 Archivos Creados

### Componentes:
- `src/components/CinemaAPISearch/` - Componente de búsqueda
- `src/pages/CinemaPages/SyncCinemasPage/` - Página de sincronización

### Servicios:
- `src/services/cinemas-api.service.js` - Lógica de APIs (ya existía, mejorado)

### Rutas:
- `/cines/sincronizar` - Nueva ruta agregada

---

## ⚠️ Notas Importantes

1. **Límites de API:**
   - Google Places tiene límites de uso
   - Foursquare tiene límites en plan gratuito
   - OpenStreetMap tiene límites de rate (1 request/segundo recomendado)

2. **Datos Sincronizados:**
   - Solo se sincronizan datos básicos (nombre, dirección, ubicación)
   - Debes completar manualmente: precios, servicios, horarios, fotos

3. **Duplicados:**
   - La aplicación no verifica duplicados automáticamente
   - Revisa antes de sincronizar si el cine ya existe

4. **Geolocalización:**
   - Se usa para mejorar la precisión de búsqueda
   - Si falla, se usa solo el nombre de la ciudad

---

## 🎉 Resultado Final

Ahora puedes:
- ✅ Buscar cines en cualquier ciudad usando APIs externas
- ✅ Sincronizar cines a tu base de datos local
- ✅ Completar información manualmente después de sincronizar
- ✅ Usar múltiples fuentes de datos (Google, Foursquare, OpenStreetMap)

**¡Todo listo para usar!** 🚀

