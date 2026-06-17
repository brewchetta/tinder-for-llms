import { PrismaClient, FeatureCategory } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed catalog. Pricing/context values are illustrative and meant for the demo
 * deck — adjust to taste. Categories mirror the Feature.category convention:
 * MODALITY | CAPABILITY | DEPLOYMENT | PRICING | CONTEXT.
 */

const FEATURES: { key: string; label: string; category: FeatureCategory }[] = [
  // Modalities
  { key: "text", label: "Text", category: "MODALITY" },
  { key: "vision", label: "Vision", category: "MODALITY" },
  { key: "audio", label: "Audio", category: "MODALITY" },
  { key: "video", label: "Video", category: "MODALITY" },
  // Capabilities
  { key: "coding", label: "Coding", category: "CAPABILITY" },
  { key: "reasoning", label: "Reasoning", category: "CAPABILITY" },
  { key: "agentic", label: "Agentic", category: "CAPABILITY" },
  { key: "function-calling", label: "Tool use", category: "CAPABILITY" },
  { key: "multilingual", label: "Multilingual", category: "CAPABILITY" },
  { key: "fast", label: "Low latency", category: "CAPABILITY" },
  // Context
  { key: "long-context", label: "Long context", category: "CONTEXT" },
  // Deployment
  { key: "api", label: "Hosted API", category: "DEPLOYMENT" },
  { key: "open-weights", label: "Open weights", category: "DEPLOYMENT" },
  // Pricing
  { key: "premium", label: "Premium", category: "PRICING" },
  { key: "budget", label: "Budget", category: "PRICING" },
  { key: "free-tier", label: "Free tier", category: "PRICING" },
];

type SeedModel = {
  slug: string;
  name: string;
  provider: string;
  tagline: string;
  description: string;
  contextWindow: number;
  inputPricePerM: number;
  outputPricePerM: number;
  releaseDate: string;
  features: string[];
};

const MODELS: SeedModel[] = [
  {
    slug: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    tagline: "The big-brain partner",
    description:
      "Anthropic's most capable model — top-tier reasoning, coding, and agentic workflows with a huge context window.",
    contextWindow: 200000,
    inputPricePerM: 5,
    outputPricePerM: 25,
    releaseDate: "2026-02-01",
    features: [
      "text", "vision", "coding", "reasoning", "agentic",
      "function-calling", "long-context", "api", "premium",
    ],
  },
  {
    slug: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    tagline: "Smart, fast, balanced",
    description:
      "The everyday workhorse — near-flagship quality at a fraction of the cost and latency. Great default for most apps.",
    contextWindow: 200000,
    inputPricePerM: 3,
    outputPricePerM: 15,
    releaseDate: "2025-11-01",
    features: [
      "text", "vision", "coding", "reasoning",
      "function-calling", "long-context", "api", "budget",
    ],
  },
  {
    slug: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    tagline: "Quick on its feet",
    description:
      "Lightning-fast and cheap for high-volume tasks, classification, and snappy chat — without giving up tool use.",
    contextWindow: 200000,
    inputPricePerM: 1,
    outputPricePerM: 5,
    releaseDate: "2025-10-01",
    features: ["text", "vision", "fast", "function-calling", "api", "budget"],
  },
  {
    slug: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    tagline: "The all-rounder",
    description:
      "Strong multimodal generalist with voice, robust tool use, and broad ecosystem support.",
    contextWindow: 400000,
    inputPricePerM: 5,
    outputPricePerM: 20,
    releaseDate: "2025-08-01",
    features: [
      "text", "vision", "audio", "coding", "reasoning",
      "agentic", "function-calling", "api", "premium",
    ],
  },
  {
    slug: "gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    tagline: "Context for days",
    description:
      "Massive context window with native audio and video understanding — built for huge documents and media.",
    contextWindow: 1000000,
    inputPricePerM: 2.5,
    outputPricePerM: 15,
    releaseDate: "2025-06-01",
    features: [
      "text", "vision", "audio", "video", "reasoning",
      "function-calling", "long-context", "api", "premium",
    ],
  },
  {
    slug: "llama-4",
    name: "Llama 4",
    provider: "Meta",
    tagline: "Open and yours to run",
    description:
      "Open-weights multimodal model you can self-host or fine-tune. Free to run on your own hardware.",
    contextWindow: 256000,
    inputPricePerM: 0,
    outputPricePerM: 0,
    releaseDate: "2025-04-01",
    features: [
      "text", "vision", "multilingual", "long-context",
      "open-weights", "api", "free-tier",
    ],
  },
  {
    slug: "mistral-large-2",
    name: "Mistral Large 2",
    provider: "Mistral AI",
    tagline: "Lean European power",
    description:
      "Efficient open-weights model strong at coding and multilingual tasks, with permissive deployment.",
    contextWindow: 128000,
    inputPricePerM: 2,
    outputPricePerM: 6,
    releaseDate: "2025-03-01",
    features: [
      "text", "coding", "function-calling", "multilingual",
      "open-weights", "budget",
    ],
  },
  {
    slug: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    tagline: "Reasoning on a budget",
    description:
      "Open-weights mixture-of-experts model with excellent reasoning and coding at a very low price.",
    contextWindow: 128000,
    inputPricePerM: 0.3,
    outputPricePerM: 1.1,
    releaseDate: "2025-01-01",
    features: [
      "text", "coding", "reasoning", "open-weights", "budget",
    ],
  },
  {
    slug: "grok-4",
    name: "Grok 4",
    provider: "xAI",
    tagline: "Real-time and irreverent",
    description:
      "Multimodal model with real-time knowledge hooks and strong reasoning.",
    contextWindow: 256000,
    inputPricePerM: 3,
    outputPricePerM: 15,
    releaseDate: "2025-09-01",
    features: ["text", "vision", "reasoning", "function-calling", "api", "premium"],
  },
];

async function main() {
  for (const f of FEATURES) {
    await prisma.feature.upsert({
      where: { key: f.key },
      update: { label: f.label, category: f.category },
      create: f,
    });
  }

  for (const m of MODELS) {
    const { features, releaseDate, ...rest } = m;
    const data = { ...rest, releaseDate: new Date(releaseDate) };
    const model = await prisma.aiModel.upsert({
      where: { slug: m.slug },
      update: data,
      create: data,
    });

    // Reset feature links so re-seeding stays in sync.
    await prisma.aiModelFeature.deleteMany({ where: { aiModelId: model.id } });
    for (const key of features) {
      const feature = await prisma.feature.findUnique({ where: { key } });
      if (feature) {
        await prisma.aiModelFeature.create({
          data: { aiModelId: model.id, featureId: feature.id },
        });
      }
    }
  }

  const [models, feats] = await Promise.all([
    prisma.aiModel.count(),
    prisma.feature.count(),
  ]);
  console.log(`Seeded ${models} models and ${feats} features.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
