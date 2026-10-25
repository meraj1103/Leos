import { create } from 'zustand';
import { LeosConversation, LeosMessage, LeosAttachment } from '../types';
import { dispatchRealAI } from '../services/aiDispatcher';

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

const SAVED_CHATS_KEY = 'leos-conversations';

function loadInitialConversations(): LeosConversation[] {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(SAVED_CHATS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return [
    {
      id: 'conv-1',
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    },
  ];
}

const INITIAL_CONVERSATIONS: LeosConversation[] = loadInitialConversations();

function persistConversations(convs: LeosConversation[]) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(convs));
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: INITIAL_CONVERSATIONS[0]?.id || 'conv-1',
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
    set((state) => {
      const updated = [newConv, ...state.conversations];
      persistConversations(updated);
      return {
        conversations: updated,
        activeConversationId: newId,
        activeAttachments: [],
      };
    });
  },

  deleteConversation: (id) =>
    set((state) => {
      let remaining = state.conversations.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        remaining = [
          {
            id: `conv-${Date.now()}`,
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          },
        ];
      }
      persistConversations(remaining);
      return {
        conversations: remaining,
        activeConversationId: remaining[0].id,
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

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    const existingHistory = currentConv
      ? currentConv.messages
          .filter((m) => m.content.trim())
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

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

    const controller = new AbortController();

    // Add user message & placeholder
    set((state) => {
      const updated = state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          const isFirstMessage = conv.messages.length === 0;
          return {
            ...conv,
            title: isFirstMessage ? content.slice(0, 35) : conv.title,
            updatedAt: Date.now(),
            messages: [...conv.messages, userMsg, assistantMsg],
          };
        }
        return conv;
      });
      persistConversations(updated);
      return {
        activeAttachments: [],
        isStreaming: true,
        abortController: controller,
        conversations: updated,
      };
    });

    try {
      let accumulated = '';
      await dispatchRealAI({
        modelId,
        modelName,
        provider,
        prompt: content,
        conversationHistory: existingHistory,
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulated += chunk;
          set((state) => ({
            conversations: state.conversations.map((conv) => {
              if (conv.id === activeConversationId) {
                return {
                  ...conv,
                  messages: conv.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  ),
                };
              }
              return conv;
            }),
          }));
        },
      });

      // Final persistence after streaming finishes
      persistConversations(get().conversations);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorText = `❌ Request failed: ${err.message || 'Unknown error'}`;
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: errorText } : m
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
    const { activeConversationId, conversations } = get();
    if (!activeConversationId) return;

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (!currentConv) return;

    // Find the user prompt right before this assistant message
    const msgIndex = currentConv.messages.findIndex((m) => m.id === messageId);
    const userPrompt = msgIndex > 0 ? currentConv.messages[msgIndex - 1].content : '';
    const existingHistory = currentConv.messages
      .slice(0, Math.max(0, msgIndex - 1))
      .filter((m) => m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();

    set((state) => ({
      isStreaming: true,
      abortController: controller,
      conversations: state.conversations.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: '',
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

    try {
      let accumulated = '';
      await dispatchRealAI({
        modelId: newModelId,
        modelName: newModelName,
        provider: newProvider,
        prompt: userPrompt || 'Regenerate response',
        conversationHistory: existingHistory,
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulated += chunk;
          set((state) => ({
            conversations: state.conversations.map((conv) => {
              if (conv.id === activeConversationId) {
                return {
                  ...conv,
                  messages: conv.messages.map((m) =>
                    m.id === messageId ? { ...m, content: accumulated } : m
                  ),
                };
              }
              return conv;
            }),
          }));
        },
      });

      persistConversations(get().conversations);
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },
}));
