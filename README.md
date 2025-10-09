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
# ExploraModelo — How Large Language Models Work (Educational Demo)

ExploraModelo is a single-page educational web application that explains, step-by-step, how transformer-based language models process text: from tokenization, embeddings and positional encoding, through self-attention and softmax probabilities, to autoregressive generation. It is intentionally a "toy" model for teaching core concepts without external APIs or private data.

---

## Table of contents

- Project summary
- Technical highlights (what recruiters look for)
- Architecture and data flow
- API contracts
- Local development
- Production deployment
- Testing and CI
- Security, privacy, and accessibility
- Performance and scaling notes
- Extensibility and next steps
- File structure
- License

---

## Project summary

ExploraModelo demonstrates the internal steps of a transformer-style LLM with an emphasis on pedagogy and reproducibility. It is built with Next.js (App Router), TypeScript and client-side simulation of transformer internals to keep the demo self-contained and safe for classroom or conference use.

Key features
- Single-page flow with 6 interactive steps: Entrada, Tokenización, Embeddings, Atención, Probabilidades, Generación.
- Deterministic, client-side LLM simulation (token hashing, fixed-size embeddings, sinusoidal positional encodings, toy multi-head self-attention, softmax probabilities, sampling strategies).
- Visualizations: token chips, embedding tiles, attention heatmaps, probability bars and generation timeline.
- Accessibility-first styling (high contrast theme, large fonts) optimized for projector display.
- Minimal server API routes for export and anonymous usage logging compatible with serverless platforms.


## Technical highlights

This project showcases experience across frontend engineering, systems design and applied ML concepts. Recruiters should note:

- Modern React architecture: Next.js App Router with server/client components and well-typed TypeScript context/reducer patterns (useReducer + Context API) for predictable state transitions.
- UI/UX: Accessible, responsive design using a single global CSS theme, clear componentization (InputStep, TokenizationStep, EmbeddingStep, AttentionStep, ProbabilityStep, AutoregressiveStep) and progressive disclosure for educational content.
- Deterministic simulation: Reproducible embedding and attention generation using seeded hashing and mathematical transforms — demonstrates an understanding of linear algebra primitives used in ML models.
- Testing & Quality: Unit tests with Vitest and @testing-library; CI workflow included to ensure build/test/lint on PRs.
- Observability & Privacy: Minimal server-side logging with privacy-aware truncation (no PII stored by default), and API endpoints designed for lightweight analytics and optional export.
- Deployment-ready: Compatible with Vercel (serverless functions) and standard Node hosting. Configured for production build and basic CI.

Skills demonstrated
- TypeScript, React, Next.js, CSS architecture, testing (Vitest), Git workflows, basic security/privacy best-practices, and pedagogical communication of ML concepts.


## Architecture and data flow

Overview (high level): user input → tokenizer → embeddings (+ positional encodings) → multi-head self-attention → softmax probabilities → autoregressive generation.

Sequence diagram (simplified):

User -> InputStep: text
InputStep -> ProcessContext: START_PROCESS
ProcessContext -> Tokenizer: tokenize(text)
Tokenizer -> State: tokens, tokenIds
State -> Embeddings module: generateEmbedding(tokenId) & generatePositionalEncoding(position)
Embeddings -> State: embeddings, positionalEncodings, combinedEmbeddings
State -> Attention module: computeMultiHeadAttention(combinedEmbeddings)
Attention -> State: attentionHeads, attentionWeights
State -> Probabilities module: computeProbabilities(lastEmbedding, vocabulary)
Probabilities -> State: probabilities
State -> Autoregressive: sampleNextToken/proceed (repeat)


Component responsibilities
- InputStep: Accepts text input or demo selection, shows token limit and starts the pipeline.
- TokenizationStep: Visualizes tokens and their numeric IDs.
- EmbeddingStep: Shows semantic embeddings, positional encodings and combined vectors (per-token selector available).
- AttentionStep: Shows multi-head attention matrices, head selector and causal mask explanation.
- ProbabilityStep: Renders the softmax distribution (top-k candidates) and allows sampling strategies.
- AutoregressiveStep: Demonstrates stepwise generation of up to 3 tokens with history and explanation.


## API contracts

Two minimal server routes live under `src/app/api` (Next.js route handlers). They are intentionally simple and safe for demo deployment.

POST /api/export
- Request JSON: { htmlContent: string, format?: 'PNG' | 'PDF' }
- Response: { success: boolean, message: string, recommendation?: string }
- Notes: This route does not generate a file server-side. The recommended approach is client-side `html2canvas` + `jsPDF` for export in static deployments. Server-side PDF generation requires headless Chromium and additional infra.

POST /api/log
- Request JSON: { demoUsed: string, stepsCompleted?: number, sessionId?: string }
- Response: { success: boolean, message: string, totalLogs?: number }
- Notes: Logs are kept in-memory for the demo. For production switch to a persistent store with retention policies. Ensure consent and anonymization.

GET /api/log
- Response: { totalSessions: number, averageStepsCompleted: number, lastActivity?: string }


## Local development

Prerequisites
- Node.js 18+ (LTS recommended)
- npm

Quick start

```powershell
npm install
npm run dev
# open http://localhost:3000
```

Build & run production locally

```powershell
npm run build
npm start
```

Run tests

```powershell
npm test
```

Lint (ESLint)

```powershell
npm run lint
```


## CI / GitHub Actions

A CI workflow is included at `.github/workflows/ci.yml` which runs on PRs and pushes to main. It executes:
- npm ci
- npm run lint
- npm test
- npm run build

This demonstrates familiarity with standard CI gates required by many engineering teams and recruiters.


## Security, privacy and compliance notes

- No external LLM APIs: the demo runs purely client-side and does not send user text to third parties.
- Logging: `/api/log` truncates demo text and stores minimal metadata. For production use, sanitize inputs and store only hashed or consented data.
- Rate limiting: Add rate-limiting (server or edge) before exposing endpoints publicly.
- Vulnerability scanning: Run `npm audit` and include automated dependency scanning in CI for production readiness.


## Accessibility

- High contrast dark theme, large base font (18px) and clear layout.
- Recommended improvements before wide accessibility audits: add ARIA roles, ensure focus management on step changes and run axe/pa11y checks.


## Performance & scaling

- Complexity: Attention computation in the toy model is O(seq^2). For longer sequences, move heavy computations to a Web Worker or limit the input length.
- Bundling: Keep third-party libraries minimal to reduce JS payload for classroom/embedded usage.
- Serverless readiness: The API routes are compatible with serverless platforms (Vercel). Avoid long-running CPU tasks in serverless functions.


## Extensibility & next iterations

Possible improvements (ranked):
1. WebWorker offload for attention & embedding computation (smooth UI for longer sequences).
2. Real export generation server-side (headless Chromium) or fully client-side html2canvas+jsPDF.
3. Add E2E Playwright tests that simulate the full user flow for regression protection.
4. Replace toy embeddings with a tiny WASM-backed vector library for more realistic visuals.
5. Add telemetry and anonymized usage analytics + consent screen.


## File structure (high level)

```
src/
  app/
    api/
      export/route.ts
      log/route.ts
    components/
      InputStep.tsx
      TokenizationStep.tsx
      EmbeddingStep.tsx
      AttentionStep.tsx
      ProbabilityStep.tsx
      AutoregressiveStep.tsx
      Stepper.tsx
    globals.css
    page.tsx
  context/
    ProcessContext.tsx
  utils/
    llm-simulation.ts
    analytics.ts
  types/
    index.ts

README.md
package.json
.vscode/*
.github/workflows/ci.yml
```


## How to evaluate candidate experience

If you're a recruiter reviewing this repo, look for:
- Clear, typed React code and simple, well-isolated components.
- Tests covering core logic (tokenize, embedding generation, probability sampling).
- Thoughtful trade-offs: why client-side simulation, why limit inputs, how privacy is handled.
- CI that enforces tests/lint/build.
- README and docs that explain architecture and reasoning (this file).

Suggested interview topics
- Explain how tokenization maps to embedding indices.
- Walk through the self-attention computation and justify the softmax step.
- Discuss scaling strategies for longer sequences and where to offload computation.
- Propose how you'd productionize logging and telemetry while preserving privacy.


## License

MIT


---

If you want, puedo:
- Añadir diagramas SVG/PNG al README (arquitectura y secuencia).
- Generar Playwright E2E tests y añadirlos a CI.
- Implementar WebWorker para offload de cómputo.

Dime qué prefieres y lo agrego al repo.
