# ExploraModelo

ExploraModelo es una aplicación web educativa que explica cómo funcionan los modelos de lenguaje (LLMs) paso a paso, desde el texto de entrada hasta la generación de texto.

## 🎯 Características

- **Interfaz completamente en español**
- **Tema oscuro optimizado para proyectores** (alto contraste, fuentes grandes)
- **Proceso visual interactivo de 5 pasos:**
  1. **Tokenización → IDs**: División del texto en tokens y asignación de IDs numéricos
  2. **Vectores + Posición**: Conversión a embeddings y codificación posicional
  3. **Self-Attention**: Cálculo de pesos de atención con matriz visual interactiva
  4. **Probabilidades**: Distribución de probabilidades para el siguiente token
  5. **Bucle autoregresivo**: Generación iterativa de nuevos tokens

- **Demos precargados**: 10 frases de ejemplo en español
- **Modo explicación**: Textos didácticos detallados en cada paso
- **Simulación completa**: Todo el procesamiento se ejecuta en el cliente
- **Sin APIs externas**: No requiere conexiones a OpenAI, Anthropic, etc.

## 🛠️ Tecnologías

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **Backend mínimo**: Next.js API routes para export/logging opcional
- **Simulación**: Implementación toy de transformers (client-side)
- **Despliegue**: Compatible con Vercel

## 🚀 Instalación y uso

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir http://localhost:3000
```

### Construcción para producción

```bash
# Construir la aplicación
npm run build

# Iniciar servidor de producción
npm start
```

### Despliegue en Vercel

1. Fork este repositorio
2. Conectar con Vercel
3. Desplegar automáticamente

## 📚 Uso de la aplicación

### Paso 1: Entrada de texto
- Escribir una frase personalizada (máx. 200 caracteres)
- O seleccionar uno de los 10 ejemplos precargados
- Hacer clic en "Comenzar análisis"

### Paso 2: Tokenización
- Ver cómo el texto se divide en tokens
- Observar la asignación de IDs numéricos únicos
- Entender la conversión texto → números

### Paso 3: Vectorización
- Visualizar embeddings como barras de colores
- Ver la codificación posicional sinusoidal
- Entender la combinación embedding + posición

### Paso 4: Atención
- Explorar la matriz de atención interactiva
- Hacer hover sobre celdas para ver detalles
- Entender la máscara causal (no mirar al futuro)

### Paso 5: Probabilidades
- Ver las probabilidades del siguiente token
- Explorar el top 10 de candidatos
- Entender la distribución softmax

### Paso 6: Generación autoregresiva
- Generar hasta 3 tokens nuevos
- Ver el proceso iterativo paso a paso
- Entender el bucle de generación

## 🎨 Características visuales

### Tema oscuro proyector-friendly
- Fondo: `#0b0b0f` (negro profundo)
- Texto: `#ffffff` (blanco puro)
- Acento: `#dc2626` (rojo)
- Fuentes grandes (18px base)
- Alto contraste en todos los elementos

### Componentes interactivos
- **TokenChips**: Tokens con colores alternados
- **EmbeddingBars**: Vectores como barras de color
- **AttentionHeatmap**: Matriz de atención con hover
- **ProbabilityBars**: Barras de probabilidad animadas
- **ProgressStepper**: Navegación entre pasos

### Modo explicación
- Textos didácticos detallados
- Tooltips informativos
- Ejemplos contextuales
- Explicaciones paso a paso

## 🔧 API Endpoints (opcional)

### POST /api/export
Endpoint para exportar el estado actual (implementación mínima)

```javascript
{
  "htmlContent": "<html>...</html>",
  "format": "PNG" | "PDF"
}
```

### POST /api/log
Logging de uso sin datos personales

```javascript
{
  "demoUsed": "Los pájaros vuelan...",
  "stepsCompleted": 5,
  "sessionId": "anonymous"
}
```

### GET /api/log
Estadísticas básicas de uso

## 📖 Aspectos educativos

### Conceptos explicados
1. **Tokenización**: Cómo se divide el texto en unidades procesables
2. **Embeddings**: Representación vectorial del significado
3. **Posición**: Importancia del orden en el texto
4. **Atención**: Cómo el modelo "enfoca" información relevante
5. **Softmax**: Conversión de logits a probabilidades
6. **Autoregresión**: Generación iterativa token por token

### Público objetivo
- Estudiantes de IA/ML
- Desarrolladores curiosos sobre LLMs
- Educadores en tecnología
- Cualquier persona interesada en entender cómo funcionan los modelos de lenguaje

## 🎯 Limitaciones intencionales

- **No sampling**: No implementa temperature/top-k/top-p
- **Modelo toy**: Simplificado para propósitos educativos
- **Vocabulario pequeño**: ~200 tokens en español
- **Generación limitada**: Máximo 3 tokens nuevos
- **Sin persistencia**: Los datos se resetean al recargar

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Inspirado en el paper "Attention Is All You Need" (Vaswani et al., 2017)
- Diseñado para ser accesible y educativo
- Optimizado para presentaciones y enseñanza

---

**ExploraModelo** - Haciendo los LLMs comprensibles, un paso a la vez. 🚀
