import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExploraModelo | Aprende cómo funcionan los LLM paso a paso",
  description: "Aplicación educativa interactiva que explica paso a paso cómo funcionan los modelos de lenguaje: tokenización, embeddings, atención, probabilidades y generación autoregresiva. 100% en español.",
  keywords: [
    "LLM",
    "inteligencia artificial",
    "educación",
    "transformers",
    "machine learning",
    "español",
    "tokenización",
    "embeddings",
    "self-attention",
    "GPT",
    "aprendizaje profundo",
    "deep learning",
  ],
  authors: [{ name: "ExploraModelo Team" }],
  creator: "ExploraModelo",
  publisher: "ExploraModelo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ExploraModelo | Aprende cómo funcionan los LLM",
    description: "Descubre cómo funcionan los modelos de lenguaje paso a paso con visualizaciones interactivas",
    url: "/",
    siteName: "ExploraModelo",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExploraModelo - Educación interactiva sobre LLMs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExploraModelo | Aprende cómo funcionan los LLM",
    description: "Descubre cómo funcionan los modelos de lenguaje paso a paso con visualizaciones interactivas",
    images: ["/og-image.png"],
    creator: "@exploramodelo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens when available
    // google: 'your-google-verification-token',
    // yandex: 'your-yandex-verification-token',
  },
  category: "education",
};

import { ProcessProvider } from "../context/ProcessContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for educational content and SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalWebsite",
    "name": "ExploraModelo",
    "description": "Aplicación educativa interactiva que explica paso a paso cómo funcionan los modelos de lenguaje (LLM): tokenización, embeddings, atención, probabilidades y generación autoregresiva",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "inLanguage": "es-ES",
    "educationalLevel": "Intermedio a Avanzado",
    "learningResourceType": "Interactive Learning Tool",
    "about": [
      {
        "@type": "Thing",
        "name": "Large Language Models",
        "description": "Modelos de lenguaje grandes basados en arquitectura Transformer"
      },
      {
        "@type": "Thing",
        "name": "Machine Learning",
        "description": "Aprendizaje automático y redes neuronales profundas"
      },
      {
        "@type": "Thing",
        "name": "Natural Language Processing",
        "description": "Procesamiento del lenguaje natural y comprensión computacional"
      }
    ],
    "teaches": [
      "Tokenización de texto",
      "Embeddings y representaciones vectoriales",
      "Codificación posicional",
      "Mecanismo de self-attention",
      "Cálculo de probabilidades con softmax",
      "Generación autoregresiva de texto"
    ],
    "citation": [
      {
        "@type": "ScholarlyArticle",
        "name": "Attention Is All You Need",
        "author": [
          { "@type": "Person", "name": "Ashish Vaswani" },
          { "@type": "Person", "name": "Noam Shazeer" },
          { "@type": "Person", "name": "Niki Parmar" },
          { "@type": "Person", "name": "Jakob Uszkoreit" }
        ],
        "datePublished": "2017",
        "publisher": "NeurIPS",
        "url": "https://arxiv.org/abs/1706.03762"
      },
      {
        "@type": "ScholarlyArticle",
        "name": "Language Models are Few-Shot Learners",
        "author": [
          { "@type": "Person", "name": "Tom B. Brown" },
          { "@type": "Person", "name": "Benjamin Mann" }
        ],
        "datePublished": "2020",
        "publisher": "NeurIPS",
        "url": "https://arxiv.org/abs/2005.14165"
      },
      {
        "@type": "ScholarlyArticle",
        "name": "BERT: Pre-training of Deep Bidirectional Transformers",
        "author": [
          { "@type": "Person", "name": "Jacob Devlin" },
          { "@type": "Person", "name": "Ming-Wei Chang" }
        ],
        "datePublished": "2018",
        "publisher": "NAACL",
        "url": "https://arxiv.org/abs/1810.04805"
      }
    ]
  };

  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ProcessProvider>{children}</ProcessProvider>
      </body>
    </html>
  );
}
