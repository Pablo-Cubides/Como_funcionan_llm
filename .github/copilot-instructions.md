<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# ExploraModelo - Proyecto Completado ✅

**Aplicación web educativa que explica cómo funcionan los modelos de lenguaje paso a paso**

## Estado del proyecto

- [x] **Verificación inicial** - copilot-instructions.md creado
- [x] **Requisitos clarificados** - Aplicación educativa Next.js 15 con TypeScript, TailwindCSS, UI en español, tema oscuro proyector-friendly
- [x] **Proyecto scaffoldeado** - Next.js 15 con TypeScript, TailwindCSS, ESLint, App Router creado exitosamente
- [x] **Proyecto personalizado** - Implementación completa de ExploraModelo con:
  - 6 componentes principales (InputStep, TokenizationStep, EmbeddingStep, AttentionStep, ProbabilityStep, AutoregressiveStep)
  - Stepper component para navegación
  - Utilidades de simulación LLM (client-side)
  - Tipos TypeScript definidos
  - API routes mínimas (/api/export, /api/log)
  - Tema oscuro completo con CSS personalizado
- [x] **Extensiones** - No se requieren extensiones adicionales
- [x] **Compilación** - Proyecto compila exitosamente sin errores
- [x] **Tarea creada** - Servidor de desarrollo ejecutándose en http://localhost:3000
- [x] **Proyecto lanzado** - Aplicación accesible en navegador
- [x] **Documentación** - README.md completo con instrucciones detalladas

## Características implementadas

### Frontend (Next.js 15 + TypeScript + TailwindCSS)
- ✅ Interfaz completamente en español
- ✅ Tema oscuro proyector-friendly (#0b0b0f fondo, #ffffff texto, #dc2626 acento)
- ✅ 5 pasos educativos interactivos:
  1. Tokenización → IDs
  2. Vectores + Posición 
  3. Self-Attention
  4. Probabilidades del siguiente token
  5. Bucle autoregresivo
- ✅ 10 demos precargados en español
- ✅ Modo explicación activable
- ✅ Componentes visuales interactivos (matrices, barras, chips)
- ✅ Navegación paso a paso con progreso visual

### Backend mínimo (Next.js API routes)
- ✅ POST /api/export - Endpoint para exportar estado
- ✅ POST /api/log - Logging de uso sin PII
- ✅ GET /api/log - Estadísticas básicas
- ✅ Compatible con Vercel

### Simulación LLM (client-side)
- ✅ Tokenización simple (espacios + puntuación)
- ✅ Hash determinista para IDs de tokens
- ✅ Embeddings generados con seed fijo
- ✅ Codificación posicional sinusoidal
- ✅ Self-attention toy con máscara causal
- ✅ Cálculo de probabilidades softmax
- ✅ Generación autoregresiva (máx. 3 tokens)
- ✅ Vocabulario español (~200 palabras)

### Características técnicas
- ✅ Todo el procesamiento client-side
- ✅ Sin APIs externas (OpenAI/Anthropic/etc)
- ✅ Tipos TypeScript completos
- ✅ CSS responsivo y accesible
- ✅ Alto contraste para proyectores
- ✅ Fuentes grandes (18px base)
- ✅ Tooltips y explicaciones interactivas

## Instrucciones de uso

1. **Desarrollo**: `npm run dev` (ya ejecutándose en http://localhost:3000)
2. **Producción**: `npm run build && npm start`
3. **Despliegue**: Compatible con Vercel directamente

## Archivos principales

- `src/app/page.tsx` - Componente principal de la aplicación
- `src/app/components/` - Componentes de cada paso
- `src/utils/llm-simulation.ts` - Lógica de simulación LLM
- `src/types/index.ts` - Definiciones TypeScript
- `src/app/globals.css` - Estilos del tema oscuro
- `src/app/api/` - API routes mínimas

El proyecto está **completamente funcional** y listo para uso educativo. ✨
