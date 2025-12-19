<div align="center">

# 🎬 LaPremier Client

### Frontend moderno y elegante para la plataforma de cines más completa de España

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Aplicación React moderna con diseño responsive y experiencia de usuario excepcional**

</div>

---

## ✨ Características Principales

### 🎯 Funcionalidades Core

- 🎬 **Gestión completa de películas** con integración TMDB
- 🏛️ **Directorio de cines** con mapas interactivos
- ⭐ **Sistema de reseñas** y valoraciones
- ❤️ **Favoritos** personalizados
- 🔍 **Búsqueda avanzada** con filtros inteligentes
- 📊 **Estadísticas** y visualizaciones
- 🗺️ **Mapas interactivos** con Google Maps
- 📱 **Diseño 100% responsive**

### 🎨 Diseño y UX

- 🎭 **Sistema de diseño** propio y consistente
- 🌈 **Tema oscuro/claro** (preparado)
- ♿ **Accesibilidad** (WCAG 2.1)
- 🎯 **SEO optimizado** con React Helmet
- ⚡ **Carga rápida** con lazy loading
- 🖼️ **Imágenes optimizadas** con lazy loading
- 📱 **PWA Ready** (Progressive Web App)

### 🔌 Integraciones

- 🎬 **TMDB** - Base de datos de películas
- 🗺️ **Google Maps** - Mapas interactivos
- 📍 **Google Places** - Búsqueda de ubicaciones
- 🔐 **JWT Authentication** - Autenticación segura
- 📡 **React Query** - Gestión de estado del servidor

---

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** v16 o superior
- **npm** o **yarn**

### 📦 Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd LaPremier_client

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Backend
VITE_APP_API_URL=http://localhost:5005

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=tu-api-key-de-google-maps

# TMDB (opcional, se usa el proxy del backend)
VITE_TMDB_API_KEY=tu-api-key-de-tmdb
```

### ▶️ Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto mostrado).

### 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`.

### 👀 Preview de Producción

```bash
npm run preview
```

---

## 📚 Estructura del Proyecto

```
LaPremier_client/
├── 📁 public/
│   ├── _redirects          # Configuración de redirecciones
│   └── vite.svg            # Favicon
│
├── 📁 src/
│   ├── 📁 components/       # Componentes reutilizables
│   │   ├── AdvancedSearch/      # Búsqueda avanzada
│   │   ├── CinemaCard/          # Tarjeta de cine
│   │   ├── MovieCard/           # Tarjeta de película
│   │   ├── Navigation/         # Navegación principal
│   │   ├── UI/                  # Componentes del sistema de diseño
│   │   │   ├── Button/
│   │   │   ├── Badge/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Select/
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── 📁 pages/           # Páginas de la aplicación
│   │   ├── CinemaPages/         # Páginas de cines
│   │   │   ├── CinemasPage/
│   │   │   ├── CinemaDetailsPage/
│   │   │   └── ...
│   │   ├── MoviePages/          # Páginas de películas
│   │   │   ├── MoviesPage/
│   │   │   ├── MovieDetailsPage/
│   │   │   ├── NowPlayingPage/
│   │   │   └── ...
│   │   ├── HomePage/
│   │   ├── SearchPage/
│   │   ├── FavoritesPage/
│   │   └── ...
│   │
│   ├── 📁 services/         # Servicios de API
│   │   ├── api.service.js       # Cliente Axios base
│   │   ├── movies.service.js    # Servicio de películas
│   │   ├── cinemas.service.js   # Servicio de cines
│   │   ├── reviews.service.js   # Servicio de reseñas
│   │   ├── tmdb.service.js       # Integración TMDB
│   │   └── ...
│   │
│   ├── 📁 hooks/            # Custom React Hooks
│   │   ├── useMovies.js         # Hook para películas
│   │   ├── useCinemas.js        # Hook para cines
│   │   ├── useReviews.js        # Hook para reseñas
│   │   └── ...
│   │
│   ├── 📁 contexts/         # React Contexts
│   │   ├── auth.context.jsx     # Contexto de autenticación
│   │   └── ThemeContext.jsx     # Contexto de tema
│   │
│   ├── 📁 config/           # Configuración
│   │   ├── constants.js         # Constantes de la app
│   │   ├── env.js               # Variables de entorno
│   │   ├── googleMaps.js        # Configuración Google Maps
│   │   └── queryClient.js        # Configuración React Query
│   │
│   ├── 📁 utils/            # Utilidades
│   │   ├── errorHandler.js      # Manejo de errores
│   │   ├── logger.js            # Sistema de logging
│   │   ├── notifications.js     # Notificaciones
│   │   ├── validation.js        # Validaciones
│   │   └── ...
│   │
│   ├── 📁 styles/           # Estilos globales
│   │   ├── design-system.css    # Sistema de diseño
│   │   └── responsive.css        # Media queries
│   │
│   ├── 📁 routes/           # Configuración de rutas
│   │   └── AppRoutes.jsx
│   │
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
│
├── vite.config.js           # Configuración de Vite
├── package.json            # Dependencias
└── README.md               # Este archivo
```

---

## 🛣️ Rutas de la Aplicación

### 🏠 Públicas

| Ruta                      | Descripción            | Componente          |
| ------------------------- | ---------------------- | ------------------- |
| `/`                       | Página de inicio       | `HomePage`          |
| `/peliculas`              | Lista de películas     | `MoviesPage`        |
| `/peliculas/detalles/:id` | Detalles de película   | `MovieDetailsPage`  |
| `/peliculas/cartelera`    | Películas en cartelera | `NowPlayingPage`    |
| `/cines`                  | Lista de cines         | `CinemasPage`       |
| `/cines/detalles/:id`     | Detalles de cine       | `CinemaDetailsPage` |
| `/buscar`                 | Búsqueda avanzada      | `SearchPage`        |
| `/favoritos`              | Películas favoritas    | `FavoritesPage`     |
| `/generos`                | Películas por género   | `GenresPage`        |
| `/comparar`               | Comparar cines         | `ComparePage`       |
| `/calendario`             | Calendario de estrenos | `CalendarPage`      |

### 🔐 Administración (Requiere Auth)

| Ruta                    | Descripción         | Componente           |
| ----------------------- | ------------------- | -------------------- |
| `/peliculas/crear`      | Crear película      | `NewMovieForm`       |
| `/peliculas/editar/:id` | Editar película     | `EditMovieForm`      |
| `/peliculas/eliminados` | Restaurar películas | `DeletedMoviesPage`  |
| `/cines/crear`          | Crear cine          | `NewCinemaForm`      |
| `/cines/editar/:id`     | Editar cine         | `EditCinemaForm`     |
| `/cines/eliminados`     | Restaurar cines     | `DeletedCinemasPage` |
| `/datos`                | Estadísticas        | `StatsPage`          |

---

## 🎨 Sistema de Diseño

### 🎭 Componentes UI

El proyecto incluye un sistema de diseño completo con componentes reutilizables:

- **Button** - Botones con variantes (primary, secondary, danger, etc.)
- **Badge** - Badges para etiquetas y estados
- **Card** - Tarjetas para contenido
- **Modal** - Modales y diálogos
- **Select** - Selectores personalizados
- **Alert** - Alertas y notificaciones
- **Loader** - Indicadores de carga
- **SkeletonLoader** - Placeholders de carga

### 🎨 Estilos

- **Design System CSS** - Variables CSS y estilos base
- **Responsive CSS** - Media queries para todos los dispositivos
- **Bootstrap 5** - Framework base
- **React Bootstrap** - Componentes Bootstrap para React

---

## 🔌 Integraciones

### 🎬 TMDB (The Movie Database)

- ✅ Búsqueda de películas
- ✅ Películas en cartelera
- ✅ Detalles completos
- ✅ Imágenes y trailers
- ✅ Información de casting
- ✅ Plataformas de streaming

### 🗺️ Google Maps

- ✅ Mapas interactivos
- ✅ Marcadores de cines
- ✅ Búsqueda de ubicaciones
- ✅ Rutas y direcciones
- ✅ Geocodificación

### 📍 Google Places

- ✅ Autocompletado de direcciones
- ✅ Búsqueda de cines
- ✅ Información de lugares

---

## 🛠️ Tecnologías Utilizadas

### Core

- **React 18.3** - Biblioteca UI
- **Vite 5.4** - Build tool y dev server
- **React Router 6** - Enrutamiento
- **Axios** - Cliente HTTP

### UI/UX

- **Bootstrap 5.3** - Framework CSS
- **React Bootstrap 2.10** - Componentes Bootstrap
- **React Icons 5.3** - Iconos
- **React Toastify** - Notificaciones

### Estado y Datos

- **React Query 5.9** - Gestión de estado del servidor
- **React Hook Form 7.6** - Formularios
- **Yup 1.7** - Validación de esquemas

### Mapas y Ubicación

- **@react-google-maps/api** - Google Maps
- **react-google-places-autocomplete** - Autocompletado

### Visualización

- **@nivo/pie** - Gráficos circulares

### SEO y Meta

- **react-helmet-async** - Gestión de meta tags

---

## 📱 Responsive Design

La aplicación está completamente optimizada para:

- 📱 **Móviles** (320px+)
- 📱 **Tablets** (768px+)
- 💻 **Laptops** (1024px+)
- 🖥️ **Desktop** (1440px+)
- 🖥️ **Large Desktop** (1920px+)

---

## ♿ Accesibilidad

### ✅ Implementado

- ✅ **Skip Links** para navegación por teclado
- ✅ **ARIA labels** en componentes interactivos
- ✅ **Contraste** de colores WCAG AA
- ✅ **Navegación por teclado** completa
- ✅ **Screen reader** friendly
- ✅ **Focus indicators** visibles

---

## 🔐 Autenticación

### 🔑 Sistema de Auth

- **JWT Tokens** - Autenticación basada en tokens
- **Context API** - Estado global de autenticación
- **Protected Routes** - Rutas protegidas
- **Auto-refresh** - Renovación automática de tokens

### 👤 Roles

- **Admin** - Acceso completo
- **User** - Acceso limitado

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Coverage
npm run test:coverage
```

---

## 📊 Scripts Disponibles

| Script                  | Descripción                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Iniciar servidor de desarrollo  |
| `npm run build`         | Build para producción           |
| `npm run preview`       | Preview del build de producción |
| `npm run lint`          | Ejecutar ESLint                 |
| `npm test`              | Ejecutar tests                  |
| `npm run test:ui`       | Tests con interfaz              |
| `npm run test:coverage` | Coverage de tests               |

---

## 🎯 Características Avanzadas

### 🔍 Búsqueda Inteligente

- Búsqueda en tiempo real
- Filtros múltiples
- Búsqueda en TMDB
- Historial de búsquedas

### ⭐ Sistema de Reseñas

- Valoraciones 1-5 estrellas
- Comentarios
- Filtros por rating
- Edición y eliminación

### ❤️ Favoritos

- Guardar películas favoritas
- Lista personalizada
- Sincronización con backend

### 📊 Estadísticas

- Gráficos de géneros
- Estadísticas de cines
- Visualizaciones interactivas

### 🗺️ Mapas Interactivos

- Ubicación de cines
- Búsqueda por ciudad
- Rutas y direcciones
- Marcadores personalizados

---

## 🌐 Variables de Entorno

| Variable                   | Descripción            | Requerido | Default |
| -------------------------- | ---------------------- | --------- | ------- |
| `VITE_APP_API_URL`         | URL del backend API    | **Sí**    | -       |
| `VITE_GOOGLE_MAPS_API_KEY` | API Key de Google Maps | No        | -       |
| `VITE_TMDB_API_KEY`        | API Key de TMDB        | No        | -       |

---

## 🚀 Despliegue

> 📖 **Guía completa:** Ver [DEPLOY.md](../LaPremier_Server/DEPLOY.md) para instrucciones detalladas

### 🎯 Opciones Recomendadas

#### ⭐ Vercel (Recomendado - Optimizado para React/Vite)

- ✅ Setup en minutos
- ✅ Auto-deploy desde GitHub
- ✅ CDN global automático
- ✅ HTTPS automático
- ✅ Preview deployments
- 💰 Gratis (muy generoso)

**Pasos rápidos:**

1. Crear cuenta en [Vercel.com](https://vercel.com)
2. "Add New Project" → Importar desde GitHub
3. Seleccionar `LaPremier_client`
4. Configurar:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Añadir variables de entorno
6. Deploy automático

#### 🥈 Netlify

- ✅ Similar a Vercel
- ✅ Plan gratuito
- ✅ Formularios incluidos
- 💰 Gratis

#### 🥉 Cloudflare Pages

- ✅ Gratis e ilimitado
- ✅ CDN global de Cloudflare
- 💰 Gratis

### 📦 Build de Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`.

### ⚙️ Variables de Entorno en Producción

Configurar en la plataforma de hosting:

```env
VITE_APP_API_URL=https://tu-backend.railway.app
VITE_GOOGLE_MAPS_API_KEY=tu-api-key
```

### 📝 Notas de Despliegue

- ✅ `_redirects` ya configurado para SPA
- ✅ Variables de entorno en la plataforma
- ✅ HTTPS automático (Vercel/Netlify)
- ✅ CDN automático para assets estáticos
- ✅ Deploy automático desde GitHub

### 🚀 Stack Recomendado Completo

- **Backend:** Railway (gratis) - Ver [DEPLOY.md](../LaPremier_Server/DEPLOY.md)
- **Frontend:** Vercel (gratis)
- **Base de Datos:** MongoDB Atlas (gratis - 512MB)
- **Total:** $0/mes

### 📖 Guía Completa

Para instrucciones detalladas paso a paso, ver **[DEPLOY.md](../LaPremier_Server/DEPLOY.md)**

---

## 🐛 Troubleshooting

### Problemas Comunes

**Error de CORS:**

- Verificar `VITE_APP_API_URL` en `.env`
- Verificar configuración CORS en el backend

**Google Maps no carga:**

- Verificar `VITE_GOOGLE_MAPS_API_KEY`
- Verificar restricciones de API en Google Cloud

**TMDB no funciona:**

- El backend debe tener `TMDB_API_KEY` configurado
- Verificar que el proxy esté funcionando

---

## 📝 Licencia

ISC

---

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para problemas o preguntas:

- 📧 Abre un issue en GitHub
- 📖 Revisa la documentación
- 🔍 Busca en issues existentes

---

<div align="center">

**Hecho con ❤️ para los amantes del cine**

🎬 **LaPremier** - Tu plataforma de cines favorita

[⬆ Volver arriba](#-lapremier-client)

</div>
