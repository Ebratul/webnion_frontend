// Shapes of the AI Settings screen, as the API returns them. Keys are never included: only whether one is saved.

export type ModelSlot = 'chat' | 'writing' | 'image' | 'embedding';

export interface MaskedSlot {
  provider: string;
  model: string;
  baseUrl?: string;
  hfProvider?: string;
  accountId?: string;
  pricing?: { inputPerMillion?: number; outputPerMillion?: number; perPicture?: number };
  tested?: { ok: boolean; tools?: boolean | null; structured?: boolean | null; dimension?: number | null; picture?: boolean | null; at: string };
  hasKey: boolean;
  keyHint: string;
  keyUnreadable: boolean;
}

export interface MaskedKeyed {
  hasKey: boolean;
  keyHint: string;
  keyUnreadable: boolean;
}

export interface AiSettingsData {
  settings: {
    enabled: boolean;
    showOnSite: boolean;
    showInAdmin: boolean;
    features: { siteQa: boolean; chatInquiry: boolean; blogWriter: boolean; pictures: boolean };
    models: Record<ModelSlot, MaskedSlot>;
    pinecone: MaskedKeyed & { index: string; cloud: 'aws' | 'gcp' | 'azure'; region: string };
    langsmith: MaskedKeyed & { project: string };
    limits: { messagesPerVisitorPerDay: number; publicMessagesPerDay: number; blogsPerDay: number; picturesPerBlog: number; picturesPerDay: number; maxReplyTokens: number };
    assistant: { name: { en: string; bn: string }; greeting: { en: string; bn: string }; suggestions: { en: string[]; bn: string[] }; tone: string };
    studio: { pictureStyle: string };
    index: { signature?: string; dimension?: number; documents?: number; passages?: number; lastSyncAt?: string; lastRebuildAt?: string; lastError?: string };
  };
  status: {
    agentConnected: boolean;
    canSaveKeys: boolean;
    fakeAllowed: boolean;
    ready: Record<ModelSlot, boolean>;
    indexReady: boolean;
    needsRebuild: boolean;
  };
}

export interface SiteTextDocument {
  id: string;
  title: string;
  url: string;
  text: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google_genai: 'Google (Gemini)',
  groq: 'Groq',
  mistralai: 'Mistral',
  huggingface: 'Hugging Face',
  openai_compatible: 'OpenAI-compatible (DeepSeek, OpenRouter, Together…)',
  cloudflare: 'Cloudflare Workers AI',
  fake: 'Fake (local testing only)',
};

const CHAT = ['openai', 'anthropic', 'google_genai', 'groq', 'mistralai', 'huggingface', 'openai_compatible'];

export const SLOTS: { key: ModelSlot; title: string; description: string; providers: string[] }[] = [
  { key: 'chat', title: 'Chat model', description: 'Answers visitors in the chat. A fast, low-cost model works best.', providers: CHAT },
  { key: 'writing', title: 'Writing model', description: 'Writes blog outlines, articles and translations in AI Studio. A stronger model gives better articles.', providers: CHAT },
  { key: 'image', title: 'Picture model', description: 'Makes blog cover and section pictures. Claude cannot make pictures, so this is always separate.', providers: ['openai', 'google_genai', 'huggingface', 'cloudflare'] },
  { key: 'embedding', title: 'Embedding model', description: 'Turns site content into vectors for the Pinecone search. Changing it needs a rebuild of the search index.', providers: ['openai', 'google_genai', 'mistralai', 'huggingface', 'openai_compatible'] },
];

export const providerLabel = (provider: string) => PROVIDER_LABELS[provider] ?? provider;

// Examples only: the admin can type any model name the provider accepts, and Test checks it
export const MODEL_EXAMPLES: Record<ModelSlot, Record<string, string[]>> = {
  chat: {
    openai: ['gpt-5-mini', 'gpt-4.1-mini'],
    anthropic: ['claude-haiku-5-5', 'claude-sonnet-5-5'],
    google_genai: ['gemini-2.5-flash'],
    groq: ['llama-3.3-70b-versatile'],
    mistralai: ['mistral-small-latest'],
    huggingface: ['Qwen/Qwen2.5-7B-Instruct'],
  },
  writing: {
    openai: ['gpt-5', 'gpt-4.1'],
    anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5'],
    google_genai: ['gemini-2.5-pro'],
    groq: ['llama-3.3-70b-versatile'],
    mistralai: ['mistral-large-latest'],
    huggingface: ['Qwen/Qwen2.5-72B-Instruct'],
  },
  image: {
    openai: ['gpt-image-1', 'dall-e-3'],
    google_genai: ['imagen-4.0-generate-001', 'gemini-2.5-flash-image'],
    huggingface: ['black-forest-labs/FLUX.1-schnell'],
    cloudflare: ['@cf/black-forest-labs/flux-1-schnell', '@cf/stabilityai/stable-diffusion-xl-base-1.0'],
  },
  embedding: {
    openai: ['text-embedding-3-small'],
    google_genai: ['gemini-embedding-001'],
    mistralai: ['mistral-embed'],
    huggingface: ['BAAI/bge-m3'],
  },
};
