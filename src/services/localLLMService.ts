import { LeosModel } from '../types';

export async function detectLocalModels(): Promise<LeosModel[]> {
  const discovered: LeosModel[] = [];

  const ollamaEndpoint = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('leos-ollama-url') || 'http://localhost:11434').replace(/\/+$/, '')
    : 'http://localhost:11434';

  const lmStudioEndpoint = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('leos-lmstudio-url') || 'http://localhost:1234').replace(/\/+$/, '')
    : 'http://localhost:1234';

  // 1. Probe Ollama at configured host/port
  try {
    const res = await fetch(`${ollamaEndpoint}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        for (const m of data.models) {
          const sizeGB = m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) : 'unknown';
          discovered.push({
            id: `ollama-${m.name}`,
            name: `${m.name} (Ollama)`,
            provider: 'ollama',
            contextWindow: 16384,
            supportsVision: m.name.toLowerCase().includes('vision') || m.name.toLowerCase().includes('llava') || m.name.toLowerCase().includes('vl'),
            supportsVoice: false,
            supportsTools: true,
            isLocal: true,
            description: `Locally hosted on Ollama. Size: ${sizeGB} GB.`,
            tag: 'Local GPU',
          });
        }
      }
    }
  } catch {
    // Ollama not currently active or endpoint unreachable, silently continue
  }

  // 2. Probe LM Studio at configured host/port
  try {
    const res = await fetch(`${lmStudioEndpoint}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
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
