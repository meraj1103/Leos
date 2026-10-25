import { create } from 'zustand';
import { LeosModel } from '../types';
import { detectLocalModels } from '../services/localLLMService';

interface ModelState {
  models: LeosModel[];
  activeModelId: string;
  isScanningLocal: boolean;
  setActiveModel: (id: string) => void;
  addLocalModels: (localModels: LeosModel[]) => void;
  rescanLocalModels: () => Promise<number>;
}

const ACTIVE_MODEL_KEY = 'leos-active-model-id';

const DEFAULT_MODELS: LeosModel[] = [
  // Google Native Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    contextWindow: 2000000,
    supportsVision: true,
    supportsVoice: true,
    supportsTools: true,
    isLocal: false,
    description: '2M Context window. Ideal for large documents, books, and deep research.',
    tag: '2M Context',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    contextWindow: 1000000,
    supportsVision: true,
    supportsVoice: true,
    supportsTools: true,
    isLocal: false,
    description: 'Ultra-fast multimodal reasoning with real-time speed.',
    tag: 'High Speed',
  },

  // Anthropic Models
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    supportsVision: true,
    supportsVoice: false,
    supportsTools: true,
    isLocal: false,
    description: 'Top-tier code generation, logic reasoning, and architectural clarity.',
    tag: 'Coding Leader',
  },

  // OpenAI Models
  {
    id: 'chatgpt-4o-free',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    supportsVision: true,
    supportsVoice: true,
    supportsTools: true,
    isLocal: false,
    description: 'Flagship multimodal model with native voice, reasoning, and image reading.',
    tag: 'Multimodal',
  },

  // Open-Weights & Fast Cloud Models
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    contextWindow: 64000,
    supportsVision: false,
    supportsVoice: false,
    supportsTools: false,
    isLocal: false,
    description: 'Deep mathematical and algorithmic chain-of-thought reasoning.',
    tag: 'Reasoning',
  },
  {
    id: 'groq-llama-3.3-70b',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    contextWindow: 128000,
    supportsVision: false,
    supportsVoice: false,
    supportsTools: true,
    isLocal: false,
    description: 'Blazing 300+ tokens/sec output for instantaneous generation.',
    tag: '300 tok/s',
  },
  {
    id: 'openrouter-gemini-2.0',
    name: 'Gemini 2.0 (OpenRouter)',
    provider: 'openrouter',
    contextWindow: 1000000,
    supportsVision: true,
    supportsVoice: false,
    supportsTools: true,
    isLocal: false,
    description: 'Universal multihost model access via unified OpenRouter endpoint.',
    tag: 'OpenRouter',
  },
];

function getInitialActiveModel(): string {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(ACTIVE_MODEL_KEY);
    if (saved && DEFAULT_MODELS.some((m) => m.id === saved)) {
      return saved;
    }
  }
  return 'gemini-1.5-pro';
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: DEFAULT_MODELS,
  activeModelId: getInitialActiveModel(),
  isScanningLocal: false,

  setActiveModel: (id) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVE_MODEL_KEY, id);
    }
    set({ activeModelId: id });
  },

  addLocalModels: (localModels) =>
    set((state) => {
      const cloudOnly = state.models.filter((m) => !m.isLocal);
      return { models: [...cloudOnly, ...localModels] };
    }),

  rescanLocalModels: async () => {
    set({ isScanningLocal: true });
    try {
      const discovered = await detectLocalModels();
      get().addLocalModels(discovered);
      return discovered.length;
    } finally {
      set({ isScanningLocal: false });
    }
  },
}));
