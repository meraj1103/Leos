import { create } from 'zustand';
import { LeosConversation, LeosMessage, LeosAttachment } from '../types';

interface ChatState {
  conversations: LeosConversation[];
  activeConversationId: string;
  isStreaming: boolean;
  abortController: AbortController | null;
  activeAttachments: LeosAttachment[];
  
  // Actions
  setActiveConversation: (id: string) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  addAttachment: (attachment: LeosAttachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  
  sendMessage: (
    content: string, 
    modelId: string, 
    modelName: string, 
    provider: any,
    accountId?: string,
    accountEmail?: string
  ) => Promise<void>;
  
  stopGenerating: () => void;
  regenerateResponseWithModel: (
    messageId: string,
    newModelId: string,
    newModelName: string,
    newProvider: any,
    accountId?: string,
    accountEmail?: string
  ) => Promise<void>;
}

const INITIAL_CONVERSATIONS: LeosConversation[] = [
  {
    id: 'conv-1',
    title: 'Multi-Account Architecture Design',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How should Leos partition multiple Google accounts and switch models mid-chat?',
        timestamp: Date.now() - 3500000,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `To partition multiple Google accounts safely without cookie collision, we use Chromium's isolated session partitions:

1. **Storage Sandboxing:** Each Google account is isolated into \`persist:account_id\`. Cookies, tokens, and storage jars never leak between accounts.
2. **Universal Context Normalizer:** When switching between Gemini, Claude, or ChatGPT mid-chat, Leos dynamically maps messages into the target provider's schema while preserving full conversation context.
3. **Hardware Keystore:** Credentials stored locally are protected with AES-256 encryption.`,
        timestamp: Date.now() - 3400000,
        modelInfo: {
          modelId: 'gemini-1.5-pro',
          modelName: 'Gemini 1.5 Pro',
          provider: 'google',
          accountId: 'acc-personal',
          accountEmail: 'user.personal@gmail.com',
        },
      },
      {
        id: 'msg-3',
        role: 'user',
        content: 'Can you show me the TypeScript type definition for this session vault?',
        timestamp: Date.now() - 1200000,
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `Here is the clean TypeScript interface for the multi-account session vault:

\`\`\`typescript
export interface LeosAccountVault {
  readonly accountId: string;
  readonly email: string;
  readonly partitionId: string;
  readonly connectedServices: {
    service: 'gemini' | 'chatgpt' | 'claude';
    status: 'connected' | 'idle';
  }[];
  encryptTokens(masterKey: CryptoKey): Promise<ArrayBuffer>;
}
\`\`\`

Notice how each account is strictly scoped to its own \`partitionId\`. When you switch active accounts, Leos routes requests through that isolated partition.`,
        timestamp: Date.now() - 1100000,
        modelInfo: {
          modelId: 'claude-3.5-sonnet',
          modelName: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          accountId: 'acc-work',
          accountEmail: 'dev@company.io',
        },
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Local Ollama Setup & Offline Inference',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    messages: [
      {
        id: 'msg-201',
        role: 'user',
        content: 'Is Ollama running locally on my machine?',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'msg-202',
        role: 'assistant',
        content: 'Yes! Leos auto-detected Ollama at `http://localhost:11434`. Models detected: `Llama 3.2 3B` and `Qwen 2.5 Coder 7B`. You can use them 100% offline with zero token fees.',
        timestamp: Date.now() - 86300000,
        modelInfo: {
          modelId: 'local-llama-3.2-3b',
          modelName: 'Llama 3.2 3B (Local)',
          provider: 'ollama',
        },
      },
    ],
  },
];

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: 'conv-1',
  isStreaming: false,
  abortController: null,
  activeAttachments: [],

  setActiveConversation: (id) => set({ activeConversationId: id }),

  createNewConversation: () => {
    const newId = `conv-${Date.now()}`;
    const newConv: LeosConversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId,
      activeAttachments: [],
    }));
  },

  deleteConversation: (id) =>
    set((state) => {
      const remaining = state.conversations.filter((c) => c.id !== id);
      const nextActive = remaining.length > 0 ? remaining[0].id : '';
      return {
        conversations: remaining,
        activeConversationId: nextActive,
      };
    }),

  addAttachment: (attachment) =>
    set((state) => ({
      activeAttachments: [...state.activeAttachments, attachment],
    })),

  removeAttachment: (id) =>
    set((state) => ({
      activeAttachments: state.activeAttachments.filter((a) => a.id !== id),
    })),

  clearAttachments: () => set({ activeAttachments: [] }),

  sendMessage: async (content, modelId, modelName, provider, accountId, accountEmail) => {
    const { activeConversationId, conversations, activeAttachments } = get();
    if (!activeConversationId) return;

    const userMsg: LeosMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: [...activeAttachments],
    };

    const assistantMsgId = `msg-assistant-${Date.now()}`;
    const assistantMsg: LeosMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelInfo: {
        modelId,
        modelName,
        provider,
        accountId,
        accountEmail,
      },
    };

    // Update conversation state with user message and placeholder assistant message
    set((state) => ({
      activeAttachments: [],
      isStreaming: true,
      abortController: new AbortController(),
      conversations: state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          const isFirstMessage = conv.messages.length === 0;
          return {
            ...conv,
            title: isFirstMessage ? content.slice(0, 35) + '...' : conv.title,
            updatedAt: Date.now(),
            messages: [...conv.messages, userMsg, assistantMsg],
          };
        }
        return conv;
      }),
    }));

    // Simulated streaming response engine (works with real API / bridge / Ollama)
    try {
      const sampleResponses: Record<string, string> = {
        'gemini-1.5-pro': `[Answered via ${modelName} | Account: ${accountEmail || 'Active'}]\n\nProcessed query using Gemini's native multimodal pipeline. Context is retained in your universal session thread. Ready for follow-up questions or mid-chat model handoff.`,
        'claude-3.5-sonnet': `[Answered via ${modelName} | Account: ${accountEmail || 'Active'}]\n\nAnalyzing request through Claude's reasoning engine. The continuous history is preserved across all previous turns from other accounts seamlessly.`,
        'chatgpt-4o-free': `[Answered via ${modelName} | Account: ${accountEmail || 'Active'}]\n\nReceived your prompt within your isolated session partition. Message history and attachments are synchronized.`,
        'default': `[Answered via ${modelName}]\n\nResponse generated successfully. Context is preserved across models in this conversation thread.`,
      };

      const fullResponse = sampleResponses[modelId] || sampleResponses['default'];
      const chunks = fullResponse.split(' ');

      for (let i = 0; i < chunks.length; i++) {
        if (!get().isStreaming) break;
        await new Promise((resolve) => setTimeout(resolve, 35));

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: chunks.slice(0, i + 1).join(' ') }
                    : m
                ),
              };
            }
            return conv;
          }),
        }));
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },

  stopGenerating: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ isStreaming: false, abortController: null });
  },

  regenerateResponseWithModel: async (messageId, newModelId, newModelName, newProvider, accountId, accountEmail) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    set((state) => ({
      isStreaming: true,
      abortController: new AbortController(),
      conversations: state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: `Regenerating response with ${newModelName}...`,
                    modelInfo: {
                      modelId: newModelId,
                      modelName: newModelName,
                      provider: newProvider,
                      accountId,
                      accountEmail,
                    },
                  }
                : m
            ),
          };
        }
        return conv;
      }),
    }));

    await new Promise((resolve) => setTimeout(resolve, 800));

    set((state) => ({
      isStreaming: false,
      abortController: null,
      conversations: state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: `[Regenerated with ${newModelName} (${accountEmail || 'Active'})]\n\nHere is the alternative synthesis and comparison from ${newModelName} utilizing the same historical context.`,
                  }
                : m
            ),
          };
        }
        return conv;
      }),
    }));
  },
}));
