import { LeosAttachment } from '../types';

export interface DispatchParams {
  modelId: string;
  modelName: string;
  provider: string;
  prompt: string;
  conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string }[];
  attachments?: LeosAttachment[];
  mcpContext?: string;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
}

/**
 * Builds an enriched prompt text that includes document contents, referenced URLs,
 * active MCP context, and attachment notices for models.
 */
function buildEnrichedPrompt(
  prompt: string,
  attachments?: LeosAttachment[],
  mcpContext?: string
): string {
  let enriched = prompt ? prompt.trim() : '';

  if (attachments && attachments.length > 0) {
    const textAttachments = attachments
      .filter((a) => a.type === 'document' && a.content)
      .map((a) => `\n\n--- Document Attached: ${a.name} ---\n${a.content}\n--- End of Document ---`)
      .join('\n');

    const urlAttachments = attachments
      .filter((a) => a.type === 'url')
      .map((a) => `\n[Referenced URL: ${a.url || a.name}]`)
      .join('\n');

    const imageNotices = attachments
      .filter((a) => a.type === 'image')
      .map((a) => `\n[Image Attached: ${a.name}]`)
      .join('\n');

    if (textAttachments) enriched += textAttachments;
    if (urlAttachments) enriched += urlAttachments;
    if (imageNotices) enriched += imageNotices;
  }

  if (mcpContext && mcpContext.trim()) {
    enriched = `[Active MCP Tools Available: ${mcpContext.trim()}]\n\n${enriched}`;
  }

  // If user provided no text and only attached something
  if (!enriched.trim()) {
    enriched = 'Please review and analyze the attached item(s).';
  }

  return enriched;
}

export async function dispatchRealAI({
  modelId,
  modelName,
  provider,
  prompt,
  conversationHistory,
  attachments,
  mcpContext,
  signal,
  onChunk,
}: DispatchParams): Promise<void> {
  const finalPrompt = buildEnrichedPrompt(prompt, attachments, mcpContext);

  const ollamaEndpoint = typeof localStorage !== 'undefined' 
    ? (localStorage.getItem('leos-ollama-url') || 'http://localhost:11434').replace(/\/+$/, '')
    : 'http://localhost:11434';

  const lmStudioEndpoint = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('leos-lmstudio-url') || 'http://localhost:1234').replace(/\/+$/, '')
    : 'http://localhost:1234';

  // 1. OLLAMA LOCAL LLM
  if (provider === 'ollama') {
    const rawModel = modelId.replace(/^ollama-/, '');
    try {
      const response = await fetch(`${ollamaEndpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: rawModel,
          messages: [
            ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: finalPrompt },
          ],
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream from Ollama.');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              onChunk(parsed.message.content);
            }
          } catch {}
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onChunk(
        `⚠️ **Could not connect to Ollama at \`${ollamaEndpoint}\`**\n\n` +
        `• Make sure Ollama is running on your machine: \`ollama serve\`\n` +
        `• Verify the model is downloaded: \`ollama run ${rawModel}\`\n\n` +
        `*Error details: ${err.message || err}*`
      );
      return;
    }
  }

  // 2. LM STUDIO LOCAL LLM
  if (provider === 'lmstudio') {
    const rawModel = modelId.replace(/^lmstudio-/, '');
    try {
      const response = await fetch(`${lmStudioEndpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: rawModel,
          messages: [
            ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: finalPrompt },
          ],
          stream: true,
        }),
        signal,
      });

      if (!response.ok) throw new Error(`LM Studio returned status ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream from LM Studio');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.trim().startsWith('data:'));
        for (const line of lines) {
          const raw = line.replace('data:', '').trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch {}
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onChunk(
        `⚠️ **Could not connect to LM Studio at \`${lmStudioEndpoint}\`**\n\n` +
        `• Ensure LM Studio local server is started on port 1234.\n` +
        `• Load a model in LM Studio before sending queries.`
      );
      return;
    }
  }

  // 3. GOOGLE GEMINI
  if (provider === 'google') {
    const geminiKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('leos-gemini-key') || '').trim() : '';
    if (!geminiKey) {
      onChunk(
        `🔑 **Gemini API Key Required**\n\n` +
        `No API key is configured for **${modelName}**.\n\n` +
        `**To connect:**\n` +
        `1. Open **Settings** (⚙️ icon in the bottom-left sidebar).\n` +
        `2. Paste your Google Gemini API Key (get one free at [aistudio.google.com](https://aistudio.google.com)).\n` +
        `3. Or, select a local model (Ollama / LM Studio) for 100% free, offline AI without keys.`
      );
      return;
    }

    try {
      let apiModel = 'gemini-1.5-flash';
      if (modelId.includes('2.0')) {
        apiModel = 'gemini-2.0-flash';
      } else if (modelId.includes('1.5-pro')) {
        apiModel = 'gemini-1.5-pro';
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:streamGenerateContent?key=${geminiKey}&alt=sse`;
      
      // Multimodal parts: support images via inlineData
      const userParts: any[] = [];

      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          if (att.type === 'image' && att.content && att.content.startsWith('data:')) {
            const [meta, base64] = att.content.split(';base64,');
            const mimeType = meta.replace('data:', '') || 'image/jpeg';
            if (base64) {
              userParts.push({
                inlineData: {
                  mimeType,
                  data: base64,
                },
              });
            }
          }
        }
      }

      userParts.push({ text: finalPrompt });

      const contents = [
        ...conversationHistory.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: userParts },
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Google API status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream from Gemini API');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.trim().startsWith('data:'));
        for (const line of lines) {
          const raw = line.replace('data:', '').trim();
          try {
            const parsed = JSON.parse(raw);
            const piece = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (piece) onChunk(piece);
          } catch {}
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onChunk(`❌ **Gemini API Error:** ${err.message || 'Failed to complete request.'}`);
      return;
    }
  }

  // 4. ANTHROPIC CLAUDE
  if (provider === 'anthropic') {
    const anthropicKey = typeof localStorage !== 'undefined' ? (localStorage.getItem('leos-anthropic-key') || '').trim() : '';
    if (!anthropicKey) {
      onChunk(
        `🔑 **Anthropic Claude API Key Required**\n\n` +
        `No API key is configured for **${modelName}**.\n\n` +
        `**To connect:**\n` +
        `1. Open **Settings** (⚙️ in the sidebar).\n` +
        `2. Paste your Anthropic API Key (from [console.anthropic.com](https://console.anthropic.com)).\n` +
        `3. Or, select a local model (Ollama / LM Studio) or Google Gemini for free AI.`
      );
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            ...conversationHistory
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: finalPrompt },
          ],
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Anthropic API status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream from Anthropic API');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.trim().startsWith('data:'));
        for (const line of lines) {
          const raw = line.replace('data:', '').trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              onChunk(parsed.delta.text);
            }
          } catch {}
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onChunk(`❌ **Anthropic API Error:** ${err.message || 'Failed to complete request.'}`);
      return;
    }
  }

  // 5. OPENAI / GROQ / DEEPSEEK / OPENROUTER (OpenAI-compatible)
  const keyMap: Record<string, { storageKey: string; baseUrl: string; defaultModel: string }> = {
    openai: { storageKey: 'leos-openai-key', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
    groq: { storageKey: 'leos-groq-key', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
    deepseek: { storageKey: 'leos-deepseek-key', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
    openrouter: { storageKey: 'leos-openrouter-key', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'google/gemini-2.0-flash-001' },
  };

  const config = keyMap[provider];
  if (config) {
    const apiKey = typeof localStorage !== 'undefined' ? (localStorage.getItem(config.storageKey) || '').trim() : '';
    if (!apiKey) {
      onChunk(
        `🔑 **${modelName} API Key Required**\n\n` +
        `No API key is configured for **${modelName}**.\n\n` +
        `**To connect:**\n` +
        `1. Open **Settings** (⚙️ in the sidebar).\n` +
        `2. Enter your API key under **API Keys & Providers**.\n` +
        `3. Or run Ollama locally for free offline AI.`
      );
      return;
    }

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.defaultModel,
          messages: [
            ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: finalPrompt },
          ],
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter((l) => l.trim().startsWith('data:'));
        for (const line of lines) {
          const raw = line.replace('data:', '').trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch {}
        }
      }
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onChunk(`❌ **${modelName} Error:** ${err.message || 'Failed to complete request.'}`);
      return;
    }
  }

  // Fallback for any other provider
  onChunk(
    `ℹ️ **${modelName} is not yet configured.**\n\n` +
    `Please configure your endpoint or API key in Settings, or run Ollama on localhost:11434.`
  );
}
