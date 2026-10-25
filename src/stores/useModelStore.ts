import { create } from 'zustand';
import { LeosModel } from '../types';

interface ModelState {
  models: LeosModel[];
  activeModelId: string;
  setActiveModel: (id: string) => void;
  addLocalModels: (localModels: LeosModel[]) => void;
}

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

  // Local Offline Models (Ollama & LM Studio default presets)
  {
    id: 'local-llama-3.2-3b',
    name: 'Llama 3.2 3B (Local)',
    provider: 'ollama',
    contextWindow: 8192,
    supportsVision: false,
    supportsVoice: false,
    supportsTools: true,
    isLocal: true,
    description: 'Runs 100% offline on your device hardware with zero token fees.',
    tag: 'Offline GPU',
  },
  {
    id: 'local-qwen-2.5-coder',
    name: 'Qwen 2.5 Coder 7B (Local)',
    provider: 'ollama',
    contextWindow: 32768,
    supportsVision: false,
    supportsVoice: false,
    supportsTools: true,
    isLocal: true,
    description: 'Specialized local code runner running privately on your laptop/desktop.',
    tag: 'Local Code',
  },
];

export const useModelStore = create<ModelState>((set) => ({
  models: DEFAULT_MODELS,
  activeModelId: 'gemini-1.5-pro',
  setActiveModel: (id) => set({ activeModelId: id }),
  addLocalModels: (localModels) =>
    set((state) => {
      // Remove previous local models and add new discovered ones
      const cloudOnly = state.models.filter((m) => !m.isLocal);
      return { models: [...cloudOnly, ...localModels] };
    }),
}));
