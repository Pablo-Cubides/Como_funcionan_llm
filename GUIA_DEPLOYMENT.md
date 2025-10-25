# 🚀 GUÍA RÁPIDA DE DEPLOYMENT - ExploraModelo

## ✅ PRE-FLIGHT CHECK (5 minutos)

```powershell
# 1. Verificar que todo compila
npm run build

# 2. Verificar tests
npm test

# 3. Verificar linting
npm run lint

# Si todo pasa ✅, continuar al deployment
```

---

## 🎨 PASO 1: CREAR ASSETS (30-45 minutos)

### Imagen OG (Open Graph) - 1200x630px
**Herramientas online gratuitas:**
- https://www.canva.com (plantillas pre-diseñadas)
- https://og image.gallery (generador automático)
- https://www.figma.com (diseño personalizado)

**Contenido sugerido:**
```
Fondo: #0f172a (azul oscuro)
Título: "ExploraModelo"
Subtítulo: "Aprende cómo funcionan los LLM paso a paso"
Icono: 🧠 (grande, centrado)
Elementos visuales: Flechas o diagrama simple (tokens → embeddings → atención)
```

**Guardar como:** `/public/og-image.png`

### Favicons
**Generador automático:**
1. Ir a https://realfavicongenerator.net/
2. Subir logo/icono (mínimo 260x260px)
3. Personalizar colores:
   - Background: #0f172a
   - Theme color: #6366f1
4. Descargar package
5. Extraer archivos a `/public/`

**Archivos necesarios:**
- `favicon.ico` (32x32)
- `icon.svg` (opcional, vectorial)
- `apple-touch-icon.png` (180x180)

---

## 🌐 PASO 2: CONFIGURAR VERCEL (15 minutos)

### Opción A: Deploy desde GitHub (recomendado)

```powershell
# 1. Commit y push todos los cambios
git add .
git commit -m "chore: preparar para producción"
git push origin main

# 2. En Vercel dashboard (https://vercel.com):
# - Click "Add New Project"
# - Import from GitHub
# - Seleccionar repositorio "Como_funcionan_llm"
# - Framework Preset: Next.js (auto-detectado)
# - Build Command: npm run build
# - Output Directory: .next
# - Install Command: npm install

# 3. Configurar variables de entorno:
# NEXT_PUBLIC_BASE_URL = https://tu-proyecto.vercel.app
# NODE_ENV = production

# 4. Click "Deploy"
```

### Opción B: Deploy desde CLI

```powershell
# 1. Instalar Vercel CLI (si no está instalado)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy de prueba
vercel

# 4. Deploy a producción
vercel --prod

# 5. Configurar dominio custom (opcional)
vercel domains add tu-dominio.com
```

---

## 🔧 PASO 3: CONFIGURACIÓN POST-DEPLOYMENT (10 minutos)

### En Vercel Dashboard:

1. **Environment Variables**
   ```
   NEXT_PUBLIC_BASE_URL = https://tu-proyecto.vercel.app
   NODE_ENV = production
   ```

2. **Domains** (opcional)
   - Agregar dominio custom
   - Configurar DNS
   - Habilitar HTTPS automático

3. **Settings > General**
   - Build & Development Settings
     - Framework Preset: `Next.js`
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`
     - Node.js Version: `20.x`

4. **Settings > Security**
   - Verificar que los headers están configurados (ya en vercel.json)

---

## ✅ PASO 4: VERIFICACIÓN POST-DEPLOYMENT (10 minutos)

### Checklist de verificación:

```powershell
# 1. Abrir la URL de producción en navegador
# https://tu-proyecto.vercel.app

# Verificar manualmente:
□ Página carga sin errores
□ Los 5 pasos funcionan correctamente
□ Selección de demos funciona
□ Tokenización muestra chips
□ Embeddings muestra visualizaciones
□ Atención muestra matriz
□ Probabilidades muestra barras
□ Generación crea tokens nuevos
□ Modo explicación se puede activar/desactivar
□ Botón reiniciar funciona
□ Responsive en móvil (usar DevTools)
□ No hay errores en consola del navegador

# 2. Verificar metadata
# - Compartir URL en Slack/Discord/Twitter
# - Verificar que aparece imagen OG
# - Verificar título y descripción

# 3. Verificar performance
# - Abrir Chrome DevTools > Lighthouse
# - Run audit
# - Verificar scores > 90 en todas las categorías
```

---

## 🐛 TROUBLESHOOTING COMÚN

### Error: "Build failed"
```powershell
# Verificar localmente primero
npm run build

# Si falla localmente, revisar errores
# Si funciona localmente pero falla en Vercel:
# - Verificar versión de Node en Vercel (debe ser 20.x)
# - Verificar que todas las dependencias están en package.json
```

### Error: "Page not found" después del deploy
```powershell
# Verificar en Vercel Dashboard > Deployments
# - Build debe mostrar "Ready"
# - Verificar que .next/static existe
# - Revisar logs de build por errores
```

### Imágenes OG no aparecen
```powershell
# 1. Verificar que /public/og-image.png existe
# 2. Verificar URL en metadata:
#    https://tu-proyecto.vercel.app/og-image.png
# 3. Usar herramienta de debug:
#    https://www.opengraph.xyz/
```

### Performance bajo
```powershell
# 1. Verificar bundle size
npm run build
# Buscar "First Load JS"

# 2. Implementar lazy loading si > 150KB
# Ver ANALISIS_PRODUCCION.md sección 9
```

---

## 🔄 ACTUALIZACIÓN CONTINUA

### Para actualizar después del deployment:

```powershell
# 1. Hacer cambios locales
# 2. Verificar que funciona
npm run build
npm run test

# 3. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# Vercel automáticamente detecta el push y re-deploya
# Ver progreso en: https://vercel.com/dashboard
```

### Rollback si algo sale mal:

```powershell
# Opción 1: Desde Vercel Dashboard
# Deployments > (seleccionar deployment anterior) > Promote to Production

# Opción 2: Desde CLI
vercel rollback
```

---

## 📊 MONITOREO POST-LANZAMIENTO

### Día 1-7 después del lanzamiento:

1. **Verificar analytics diarios**
   - Vercel Analytics (si está habilitado)
   - Verificar endpoint `/api/log` para stats

2. **Monitorear errores**
   - Vercel Dashboard > Functions > Logs
   - Buscar status 500 o timeouts

3. **Recopilar feedback**
   - Compartir con usuarios beta
   - Anotar sugerencias de mejora

4. **Performance tracking**
   - Core Web Vitals en Vercel
   - Lighthouse scores semanales

---

## 📞 RECURSOS Y SOPORTE

### Documentación oficial:
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs
- React: https://react.dev

### Comunidades:
- Vercel Discord: https://vercel.com/discord
- Next.js Discussions: https://github.com/vercel/next.js/discussions

### Herramientas útiles:
- Vercel Status: https://www.vercel-status.com/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- OG Image Debugger: https://www.opengraph.xyz/

---

## ✨ FEATURES OPCIONALES POST-LANZAMIENTO

### Semana 1-2:
- [ ] Agregar Google Analytics
- [ ] Implementar Vercel Speed Insights
- [ ] Crear página /about con más info del proyecto

### Mes 1:
- [ ] Agregar más demos en español
- [ ] Implementar modo claro/oscuro toggle
- [ ] Añadir página FAQ

### Mes 2-3:
- [ ] Internacionalización (i18n) - inglés
- [ ] Convertir en PWA
- [ ] Agregar más visualizaciones interactivas

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

**Tiempo total estimado:**
- Assets visuales: 30-45 min
- Configuración Vercel: 15 min
- Verificación: 10 min
- **TOTAL: ~1 hora**

**El proyecto está bien estructurado y listo para escalar.**

¡Éxito con el lanzamiento! 🚀

---

**Última actualización:** 24 de Octubre, 2025  
**Versión:** 1.0.0  
**Mantenedor:** ExploraModelo Team
