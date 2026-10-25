import React, { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Cpu, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  ChevronDown
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useModelStore } from '../stores/useModelStore';
import { useAccountStore } from '../stores/useAccountStore';
import { LeosModel } from '../types';
import { Logo } from './Logo';

export const ChatArea: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    isStreaming, 
    regenerateResponseWithModel 
  } = useChatStore();

  const { models, activeModelId, setActiveModel } = useModelStore();
  const { accounts, activeAccountId } = useAccountStore();
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeRegenMenuId, setActiveRegenMenuId] = useState<string | null>(null);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages, isStreaming]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = (messageId: string, model: LeosModel) => {
    setActiveRegenMenuId(null);
    regenerateResponseWithModel(
      messageId,
      model.id,
      model.name,
      model.provider,
      activeAccount.id,
      activeAccount.email
    );
  };

  // Empty state when thread has no messages
  if (!currentConv || currentConv.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-y-auto">
        <div className="w-12 h-12 rounded-2xl bg-leos-surface border border-leos-border flex items-center justify-center mb-3 shadow-md">
          <Logo className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-leos-text mb-1 tracking-tight">Leos AI Workspace</h2>
        <p className="text-xs text-leos-muted max-w-md mb-6 leading-relaxed">
          Welcome <span className="text-leos-text font-semibold">{activeAccount?.name}</span>. Switch models mid-chat, run offline local LLMs, and use Google Gemini tools.
        </p>

        {/* AI Models Showcase Carousel / Pills */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-leos-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-leos-accent" />
              <span>Available AI Engines (Click to Select)</span>
            </span>
            <span className="text-[10px] text-leos-muted font-mono">
              Active: <span className="text-leos-accent font-semibold">{models.find(m => m.id === activeModelId)?.name}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
            {models.map((m) => {
              const isActive = m.id === activeModelId;
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-leos-accent/15 border-leos-accent shadow-sm'
                      : 'bg-leos-surface border-leos-border hover:border-leos-borderLight hover:bg-leos-surfaceHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-leos-text truncate">{m.name}</span>
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-leos-accent shrink-0" />
                    ) : (
                      m.tag && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-leos-card border border-leos-border text-leos-muted">
                          {m.tag}
                        </span>
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-leos-muted block truncate">{m.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested Quick Starts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full text-left">
          <div 
            onClick={() => {
              const gemini = models.find(m => m.id.includes('gemini-2.0'));
              if (gemini) setActiveModel(gemini.id);
            }}
            className="p-3 bg-leos-surface hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <span className="text-xs font-semibold text-leos-text block mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Gemini 2.0 Flash</span>
            </span>
            <span className="text-[11px] text-leos-muted block">
              Real-time multimodal speed, coding, and vision analysis.
            </span>
          </div>

          <div 
            onClick={() => {
              const claude = models.find(m => m.id.includes('claude'));
              if (claude) setActiveModel(claude.id);
            }}
            className="p-3 bg-leos-surface hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <span className="text-xs font-semibold text-leos-text block mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Claude 3.5 Sonnet</span>
            </span>
            <span className="text-[11px] text-leos-muted block">
              Architectural logic, full-stack programming, and structured reasoning.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {currentConv.messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className="flex flex-col space-y-1.5 group">
              {/* Header: Role / Model metadata */}
              <div className="flex items-center gap-2 px-1 text-xs">
                {isUser ? (
                  <span className="font-semibold text-leos-text text-[11px]">You</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-leos-card border border-leos-border text-[11px] font-medium text-leos-text">
                      {msg.modelInfo?.provider === 'ollama' || msg.modelInfo?.provider === 'lmstudio' ? (
                        <Cpu className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-leos-accent" />
                      )}
                      <span>{msg.modelInfo?.modelName || 'Assistant'}</span>
                    </div>

                    {msg.modelInfo?.accountEmail && (
                      <span className="text-[10px] text-leos-muted font-mono truncate max-w-[150px]">
                        {msg.modelInfo.accountEmail}
                      </span>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-leos-muted ml-auto font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Attachments (if user attached any) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {msg.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-leos-surface border border-leos-border rounded-lg text-xs text-leos-text shadow-sm"
                    >
                      {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
                      {att.type === 'document' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
                      {att.type === 'url' && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-leos-surface border border-leos-border text-leos-text max-w-[85%] self-end'
                    : 'bg-transparent text-leos-text max-w-full'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>
              </div>

              {/* Assistant Message Actions: Copy & Regenerate with other model */}
              {!isUser && msg.content && (
                <div className="flex items-center gap-2 px-1 pt-1 text-xs text-leos-muted relative">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 p-1 hover:text-leos-text rounded transition-colors"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px]">Copy</span>
                  </button>

                  {/* Regenerate with Another Model Button */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveRegenMenuId(activeRegenMenuId === msg.id ? null : msg.id)
                      }
                      className="flex items-center gap-1 p-1 hover:text-leos-text rounded transition-colors"
                      title="Regenerate with an alternative model"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Regenerate with...</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Model Picker Popup */}
                    {activeRegenMenuId === msg.id && (
                      <div className="absolute left-0 top-full mt-1 w-64 bg-leos-surface border border-leos-border rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-leos-muted">
                          Switch & Regenerate
                        </div>
                        {models.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleRegenerate(msg.id, m)}
                            className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-leos-card cursor-pointer text-xs text-leos-text"
                          >
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] text-leos-muted font-mono">{m.provider}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
