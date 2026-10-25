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

export const ChatArea: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    isStreaming, 
    regenerateResponseWithModel 
  } = useChatStore();

  const { models } = useModelStore();
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-leos-surface border border-leos-border flex items-center justify-center mb-4 shadow-sm">
          <img src="/logo.svg" alt="Leos" className="w-8 h-8 rounded-xl" />
        </div>
        <h2 className="text-lg font-semibold text-leos-text mb-1 tracking-tight">Leos Workspace</h2>
        <p className="text-xs text-leos-muted max-w-md mb-8 leading-relaxed">
          Switch models mid-conversation, run local models privately, and connect your Google accounts in one unified cockpit.
        </p>

        {/* Suggested Quick Starts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
          <div className="p-3 bg-leos-surface hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight rounded-xl text-left cursor-pointer transition-all shadow-sm">
            <span className="text-xs font-medium text-leos-text block mb-1">
              Cross-Model Compare
            </span>
            <span className="text-[11px] text-leos-muted block">
              Ask Gemini, then regenerate with Claude or a local model.
            </span>
          </div>

          <div className="p-3 bg-leos-surface hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight rounded-xl text-left cursor-pointer transition-all shadow-sm">
            <span className="text-xs font-medium text-leos-text block mb-1">
              Multi-Account Isolation
            </span>
            <span className="text-[11px] text-leos-muted block">
              Manage personal and work sessions with dedicated partitions.
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
