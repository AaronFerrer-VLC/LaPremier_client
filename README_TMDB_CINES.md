# 🎬 Guía de Integración TMDB + Cines por Ciudad

## ✅ Lo que está Implementado

### 1. **Películas en Cartelera desde TMDB**
- ✅ La aplicación obtiene películas "now playing" de TMDB
- ✅ Se muestran en la HomePage y en `/peliculas/cartelera`
- ✅ Filtradas por ciudad del usuario

### 2. **Detección de Ciudad**
- ✅ Geolocalización automática
- ✅ Selección manual de ciudad
- ✅ Guardado en localStorage

### 3. **Asociación con Cines**
- ✅ Filtra cines por ciudad del usuario
- ✅ Muestra películas disponibles en esos cines
- ✅ Funciona con cines de `db.json`

---

## 🔧 Configuración Actual

### Variables de Entorno Necesarias:

```env
# OBLIGATORIO para películas en cartelera
VITE_TMDB_API_KEY=tu_api_key_de_tmdb

# OPCIONAL - Para obtener cines vía API
VITE_GOOGLE_PLACES_API_KEY=tu_api_key (opcional)
VITE_FOURSQUARE_API_KEY=tu_api_key (opcional)
```

**Nota:** Si no configuras APIs de cines, la app usará los cines de `db.json`.

---

## 📡 Opciones para Obtener Cines vía API

### Opción 1: Google Places API (Recomendado) ⭐

**Pasos:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita "Places API"
4. Crea credenciales (API Key)
5. Agrega al `.env`:
   ```env
   VITE_GOOGLE_PLACES_API_KEY=tu_key_aqui
   ```

**Costo:** $200 créditos gratis/mes, luego $0.017 por request

---

### Opción 2: Foursquare Places API

**Pasos:**
1. Ve a [Foursquare Developers](https://developer.foursquare.com/)
2. Crea cuenta y proyecto
3. Obtén API key
4. Agrega al `.env`:
   ```env
   VITE_FOURSQUARE_API_KEY=tu_key_aqui
   ```

**Costo:** Plan gratuito con límites

---

### Opción 3: OpenStreetMap (Gratis) 🆓

**Ya está implementado como fallback**
- ✅ No requiere configuración
- ✅ Funciona automáticamente si no hay otras APIs
- ✅ 100% gratis

---

## 🎯 Cómo Funciona

### Flujo Actual:

1. **Usuario entra** → Se detecta su ciudad (o usa "Madrid" por defecto)
2. **HomePage carga** → Obtiene películas "now playing" de TMDB
3. **Filtra cines** → Muestra solo cines de la ciudad del usuario
4. **Muestra películas** → Películas en cartelera disponibles

### Para Cambiar Ciudad:
- Usa el selector de ciudad en la HomePage
- O ve a `/peliculas/cartelera` y cambia la ciudad allí

---

## 🚀 Próximos Pasos

### Si quieres usar APIs de cines:

1. **Obtén API key** (Google Places recomendado)
2. **Agrega al `.env`**
3. **La app automáticamente:**
   - Buscará cines en la ciudad del usuario
   - Los mostrará junto con las películas
   - Permitirá asociar películas con cines encontrados

### Si prefieres usar solo `db.json`:

- ✅ Ya funciona perfectamente
- ✅ Solo asegúrate de que los cines tengan `address.city` correcto
- ✅ Las películas de TMDB se mostrarán automáticamente

---

## 📝 Archivos Importantes

- `src/services/location.service.js` - Detección de ciudad
- `src/services/cinemas-api.service.js` - APIs de cines
- `src/services/movies.service.js` - Método `getNowPlayingFromTMDB()`
- `src/components/CitySelector/` - Selector de ciudad
- `src/pages/NowPlayingPage/` - Página de cartelera
- `src/pages/HomePage/` - Actualizada con películas en cartelera

---

## ✅ Estado Actual

- ✅ TMDB integrado y funcionando
- ✅ Películas en cartelera se muestran
- ✅ Filtrado por ciudad funciona
- ✅ Selector de ciudad implementado
- ⚠️ APIs de cines listas pero opcionales (funciona con db.json)

**¡Todo listo para usar!** 🎉

