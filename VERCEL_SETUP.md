# ▲ Configuración Vercel - 100% Gratis

## ✅ Checklist de Configuración

### 1. Variables de Entorno Requeridas

Añadir en Vercel → Project Settings → Environment Variables:

```env
# Backend API URL (URL de tu backend en Render)
VITE_APP_API_URL=https://tu-proyecto.onrender.com

# Google Maps (opcional pero recomendado)
VITE_GOOGLE_MAPS_API_KEY=tu-api-key-de-google-maps
```

### 2. Configuración Automática

Vercel detecta automáticamente:
- ✅ Framework: **Vite** (por `vite.config.js`)
- ✅ Build Command: `npm run build` (automático)
- ✅ Output Directory: `dist` (automático)
- ✅ Install Command: `npm install` (automático)

El archivo `vercel.json` optimiza la configuración.

### 3. Límites del Plan Gratuito

- ✅ **100GB bandwidth/mes** (miles de usuarios)
- ✅ **Deploys ilimitados**
- ✅ **Dominios personalizados** gratis
- ✅ **SSL automático**
- ✅ **CDN global** incluido

### 4. Deploy Automático

- ✅ Cada push a `main` → deploy automático
- ✅ Pull requests → preview deployments automáticos
- ✅ Rollback fácil desde Dashboard

---

## 🔧 Configuración de Build

Vercel detecta Vite automáticamente, pero puedes verificar en Settings:

- **Framework Preset:** Vite
- **Root Directory:** `LaPremier_client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 🌐 Dominio Personalizado (Opcional - Gratis)

1. Vercel Dashboard → Settings → Domains
2. Add Domain
3. Seguir instrucciones para configurar DNS
4. SSL automático (gratis)

---

## 🔧 Troubleshooting

### Build falla
- ✅ Verificar que todas las dependencias estén en `package.json`
- ✅ Verificar que `npm run build` funciona localmente
- ✅ Revisar logs de build en Vercel

### No conecta al backend
- ✅ Verificar `VITE_APP_API_URL` en variables de entorno
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar CORS en backend

### Google Maps no carga
- ✅ Verificar `VITE_GOOGLE_MAPS_API_KEY`
- ✅ Verificar restricciones de API en Google Cloud Console
- ✅ Añadir dominio de Vercel a restricciones si es necesario

---

## 💡 Tips

1. **Preview Deployments:** Cada PR crea un preview URL para testing
2. **Analytics:** Vercel Analytics incluido (opcional)
3. **Speed Insights:** Ver métricas de rendimiento
4. **Environment Variables:** Diferentes valores para Production/Preview

---

<div align="center">

**Vercel optimiza automáticamente tu aplicación React** ⚡

</div>

