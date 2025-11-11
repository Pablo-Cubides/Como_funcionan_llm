# ExploraModelo Monorepo

Aplicación educativa interactiva que explica cómo funcionan los modelos de lenguaje (LLM) paso a paso, con opción de integración embeddable en cualquier sitio web.

## 📦 Estructura del Monorepo

```
exploramodelo-monorepo/
├── packages/
│   ├── app/           # Aplicación Next.js completa
│   └── embed/         # Componente embeddable
├── package.json       # Configuración del monorepo
└── README.md
```

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
# Aplicación completa
npm run dev

# Componente embeddable
npm run embed:dev
```

### Build
```bash
# Aplicación completa
npm run build

# Componente embeddable
npm run embed:build
```

### Tests
```bash
npm run test
```

## 📋 Configuración de Producción

### Variables de Entorno Obligatorias

Crea un archivo `.env.local` en `packages/app/`:

```bash
# URL base de tu aplicación (OBLIGATORIO)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### Archivos Estáticos Incluidos

- `public/og-image.svg` - Imagen para redes sociales
- `public/robots.txt` - Configuración SEO
- `public/sitemap.xml` - Mapa del sitio
- `public/favicon.svg` - Icono del sitio
- `public/manifest.json` - PWA

## 🔧 Integración en Sitios Web

### Opción 1: Componente Embeddable (Recomendado)

```bash
npm install @exploramodelo/embed
```

```jsx
import { ExploraModeloEmbed } from '@exploramodelo/embed';

function MiSitioWeb() {
  return (
    <div>
      <h1>Mi Sitio Web</h1>
      <ExploraModeloEmbed
        width="100%"
        height="600px"
        onStepChange={(step) => console.log('Paso actual:', step)}
      />
    </div>
  );
}
```

### Opción 2: iframe

```html
<iframe
  src="https://tu-dominio.com/embed"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

## 🎯 Características

### Aplicación Completa (`packages/app`)
- ✅ Next.js 14 con App Router
- ✅ Interfaz completa en español
- ✅ 6 pasos interactivos de aprendizaje
- ✅ Tema oscuro optimizado
- ✅ API routes para logging y export
- ✅ Tests unitarios completos
- ✅ SEO y PWA configurados

### Componente Embeddable (`packages/embed`)
- ✅ Componente React puro
- ✅ Sin dependencias externas
- ✅ Configurable (tamaño, callbacks)
- ✅ Simulación LLM simplificada
- ✅ CSS incluido
- ✅ TypeScript completo

## 🔒 Seguridad y Privacidad

- ✅ Sin APIs externas
- ✅ Procesamiento client-side
- ✅ No almacenamiento de datos personales
- ✅ Headers de seguridad configurados
- ✅ Variables de entorno seguras

## 📊 Rendimiento

- ✅ Bundle optimizado (~108 kB)
- ✅ Static generation
- ✅ Lazy loading
- ✅ Core Web Vitals optimizados

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E (requiere configuración)
npm run e2e
```

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
vercel deploy --prod
```

### Otro Hosting
```bash
npm run build
npm start
```

## 📝 Desarrollo

### Agregar Nuevos Pasos
1. Crear componente en `packages/app/src/app/components/`
2. Actualizar `ProcessContext.tsx`
3. Agregar tests
4. Actualizar documentación

### Modificar Embeddable
1. Editar `packages/embed/src/ExploraModeloEmbed.tsx`
2. Actualizar estilos en `ExploraModeloEmbed.css`
3. Ejecutar `npm run embed:build`

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature
3. Ejecutar tests
4. Hacer PR

## 📄 Licencia

MIT

## 🙏 Agradecimientos

- Basado en la arquitectura Transformer
- Inspirado en "Attention Is All You Need"
- Desarrollado para educación en IA