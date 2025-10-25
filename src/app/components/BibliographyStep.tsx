'use client';

import { useProcess } from '../../context/ProcessContext';

interface BibliographyStepProps { 
  onRestart?: () => void;
}

export default function BibliographyStep({ onRestart }: BibliographyStepProps) {
  const { state, dispatch } = useProcess();
  const { isExplanationMode } = state;

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
    if (typeof onRestart === 'function') onRestart();
  };

  const references = [
    {
      title: "Attention Is All You Need",
      authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
      year: 2017,
      venue: "NeurIPS",
      url: "https://arxiv.org/abs/1706.03762",
      description: "El paper fundamental que introdujo la arquitectura Transformer, base de los LLMs modernos como GPT y BERT.",
      keywords: ["transformer", "self-attention", "arquitectura"]
    },
    {
      title: "Language Models are Few-Shot Learners (GPT-3)",
      authors: "Brown, T., Mann, B., Ryder, N., et al.",
      year: 2020,
      venue: "NeurIPS",
      url: "https://arxiv.org/abs/2005.14165",
      description: "Presenta GPT-3 y demuestra las capacidades de few-shot learning en modelos de lenguaje grandes.",
      keywords: ["GPT-3", "few-shot learning", "generación de texto"]
    },
    {
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin, J., Chang, M., Lee, K., Toutanova, K.",
      year: 2018,
      venue: "NAACL",
      url: "https://arxiv.org/abs/1810.04805",
      description: "Introduce BERT y el concepto de pre-entrenamiento bidireccional para comprensión del lenguaje.",
      keywords: ["BERT", "bidirectional", "pre-training"]
    },
    {
      title: "The Illustrated Transformer",
      authors: "Alammar, J.",
      year: 2018,
      venue: "Blog Post",
      url: "https://jalammar.github.io/illustrated-transformer/",
      description: "Explicación visual y didáctica de cómo funciona la arquitectura Transformer paso a paso.",
      keywords: ["tutorial", "visualización", "educación"]
    },
    {
      title: "A Survey of Large Language Models",
      authors: "Zhao, W., Zhou, K., Li, J., et al.",
      year: 2023,
      venue: "arXiv",
      url: "https://arxiv.org/abs/2303.18223",
      description: "Survey comprensivo sobre el estado actual de los modelos de lenguaje grandes, técnicas y aplicaciones.",
      keywords: ["survey", "LLM", "estado del arte"]
    },
    {
      title: "Distributed Representations of Words and Phrases",
      authors: "Mikolov, T., Sutskever, I., Chen, K., et al.",
      year: 2013,
      venue: "NIPS",
      url: "https://arxiv.org/abs/1310.4546",
      description: "Introduce Word2Vec y los word embeddings modernos, fundamento de las representaciones vectoriales.",
      keywords: ["word2vec", "embeddings", "representaciones"]
    },
    {
      title: "Neural Machine Translation by Jointly Learning to Align and Translate",
      authors: "Bahdanau, D., Cho, K., Bengio, Y.",
      year: 2014,
      venue: "ICLR",
      url: "https://arxiv.org/abs/1409.0473",
      description: "Introduce el mecanismo de atención en redes neuronales, precursor del self-attention.",
      keywords: ["attention mechanism", "neural machine translation", "seq2seq"]
    },
    {
      title: "Understanding Deep Learning",
      authors: "Prince, S.",
      year: 2023,
      venue: "MIT Press",
      url: "https://udlbook.github.io/udlbook/",
      description: "Libro completo y gratuito sobre deep learning con explicaciones claras de conceptos fundamentales.",
      keywords: ["deep learning", "libro", "educación"]
    },
    {
      title: "GPT-4 Technical Report",
      authors: "OpenAI",
      year: 2023,
      venue: "Technical Report",
      url: "https://arxiv.org/abs/2303.08774",
      description: "Reporte técnico de GPT-4, el modelo multimodal más avanzado de OpenAI.",
      keywords: ["GPT-4", "multimodal", "state-of-the-art"]
    },
    {
      title: "LLaMA: Open and Efficient Foundation Language Models",
      authors: "Touvron, H., Lavril, T., Izacard, G., et al.",
      year: 2023,
      venue: "arXiv",
      url: "https://arxiv.org/abs/2302.13971",
      description: "Familia de modelos open-source de Meta que democratiza el acceso a LLMs eficientes.",
      keywords: ["LLaMA", "open-source", "eficiencia"]
    }
  ];

  const additionalResources = [
    {
      title: "Stanford CS224N: Natural Language Processing",
      url: "https://web.stanford.edu/class/cs224n/",
      description: "Curso gratuito de Stanford sobre NLP y modelos de lenguaje"
    },
    {
      title: "Hugging Face NLP Course",
      url: "https://huggingface.co/learn/nlp-course/",
      description: "Curso interactivo sobre transformers y aplicaciones prácticas"
    },
    {
      title: "Papers With Code - Language Modelling",
      url: "https://paperswithcode.com/task/language-modelling",
      description: "Papers más recientes con implementaciones de código"
    },
    {
      title: "The Annotated Transformer",
      url: "https://nlp.seas.harvard.edu/annotated-transformer/",
      description: "Implementación línea por línea del paper original con explicaciones"
    }
  ];

  return (
    <div className="p-8 sm:p-12 panel">
      <div className="text-center mb-12">
        <h2 className="step-title">📚 Bibliografía y Referencias</h2>
        {isExplanationMode && (
          <p className="step-description">
            Explora los papers fundamentales y recursos educativos que explican en profundidad 
            los conceptos de modelos de lenguaje, transformers y aprendizaje profundo.
          </p>
        )}
      </div>

      <div className="space-y-8">
        {/* Papers Fundamentales */}
        <section className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
            <span>📄</span> Papers Fundamentales
          </h3>
          
          <div className="space-y-4">
            {references.map((ref, index) => (
              <article 
                key={index}
                className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors mb-1">
                        {ref.title}
                      </h4>
                      <p className="text-sm text-slate-400 mb-2">
                        {ref.authors} ({ref.year}) - <span className="text-blue-400">{ref.venue}</span>
                      </p>
                    </div>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                      aria-label={`Leer ${ref.title}`}
                    >
                      <span>📖</span>
                      <span>Leer</span>
                    </a>
                  </div>
                  
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {ref.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ref.keywords.map((keyword, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium border border-slate-600"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recursos Educativos */}
        <section className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
            <span>🎓</span> Recursos Educativos Adicionales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all group"
              >
                <h4 className="font-bold text-slate-100 group-hover:text-green-400 transition-colors mb-2 flex items-center gap-2">
                  <span>🔗</span>
                  {resource.title}
                </h4>
                <p className="text-sm text-slate-400">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Explicación de términos */}
        {isExplanationMode && (
          <section className="p-8 bg-gradient-to-br from-purple-950/30 to-slate-900/50 rounded-2xl border-2 border-purple-700/30">
            <h4 className="font-bold text-2xl text-purple-300 mb-4 flex items-center gap-2">
              <span>💡</span> Glosario de Términos Técnicos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Transformer</p>
                <p>Arquitectura de red neuronal basada en mecanismos de atención, introducida en 2017. Base de GPT, BERT y la mayoría de LLMs modernos.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Self-Attention</p>
                <p>Mecanismo que permite a cada token "mirar" a todos los demás tokens para determinar su importancia contextual en la secuencia.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Pre-training</p>
                <p>Fase de entrenamiento en grandes cantidades de texto sin supervisión, donde el modelo aprende patrones generales del lenguaje.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Few-Shot Learning</p>
                <p>Capacidad del modelo para realizar nuevas tareas con solo unos pocos ejemplos, sin re-entrenamiento.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Embeddings</p>
                <p>Representaciones vectoriales densas que capturan el significado semántico de palabras o tokens en un espacio continuo.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="font-bold text-purple-400 mb-2">Autoregresivo</p>
                <p>Proceso de generación secuencial donde cada nuevo token se predice basándose en todos los tokens anteriores.</p>
              </div>
            </div>
          </section>
        )}

        {/* Botones de acción */}
        <div className="text-center p-8 bg-gradient-to-br from-emerald-900/50 to-green-900/30 border-2 border-emerald-600 rounded-2xl shadow-2xl">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-3xl font-bold text-emerald-300 mb-3">
            ¡Has Completado el Recorrido!
          </h3>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-6">
            Ahora comprendes los componentes fundamentales de los modelos de lenguaje: 
            tokenización, embeddings, atención, probabilidades y generación autoregresiva. 
            Usa estas referencias para profundizar en cada concepto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleRestart}
              className="navigation-button px-10 py-4"
            >
              <span>🔄</span>
              <span>Empezar de Nuevo</span>
            </button>
            
            <a
              href="https://github.com/Pablo-Cubides/Como_funcionan_llm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600 hover:border-slate-500 inline-flex items-center justify-center gap-2"
            >
              <span>⭐</span>
              <span>Ver en GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
