import { LeosModel } from '../types';

export async function detectLocalModels(): Promise<LeosModel[]> {
  const discovered: LeosModel[] = [];

  // 1. Probe Ollama (default port 11434)
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        for (const m of data.models) {
          discovered.push({
            id: `ollama-${m.name}`,
            name: `${m.name} (Ollama)`,
            provider: 'ollama',
            contextWindow: 16384,
            supportsVision: m.name.includes('vision') || m.name.includes('llava'),
            supportsVoice: false,
            supportsTools: true,
            isLocal: true,
            description: `Locally hosted on Ollama. Size: ${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB.`,
            tag: 'Local GPU',
          });
        }
      }
    }
  } catch {
    // Ollama not currently active, silently continue
  }

  // 2. Probe LM Studio (default port 1234)
  try {
    const res = await fetch('http://localhost:1234/v1/models', {
      method: 'GET',
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        for (const m of data.data) {
          discovered.push({
            id: `lmstudio-${m.id}`,
            name: `${m.id} (LM Studio)`,
            provider: 'lmstudio',
            contextWindow: 32768,
            supportsVision: false,
            supportsVoice: false,
            supportsTools: true,
            isLocal: true,
            description: 'Locally loaded in LM Studio via OpenAI-compatible endpoint.',
            tag: 'LM Studio',
          });
        }
      }
    }
  } catch {
    // LM Studio not active
  }

  return discovered;
}
