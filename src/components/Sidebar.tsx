import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Puzzle, 
  Settings, 
  Users, 
  Search
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useAccountStore } from '../stores/useAccountStore';

interface SidebarProps {
  isOpen: boolean;
  onOpenAccounts: () => void;
  onOpenMCP: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onOpenAccounts,
  onOpenMCP,
  onOpenSettings,
}) => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    createNewConversation, 
    deleteConversation 
  } = useChatStore();

  const { accounts, activeAccountId } = useAccountStore();
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  if (!isOpen) return null;

  return (
    <aside className="w-64 h-full bg-leos-surface border-r border-leos-border flex flex-col select-none shrink-0 transition-all duration-200">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-leos-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Leos" className="w-7 h-7 rounded-lg" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-wide text-leos-text">Leos</span>
            <span className="text-[10px] text-leos-muted font-mono tracking-tight">UNIVERSAL COCKPIT</span>
          </div>
        </div>
        <button
          onClick={createNewConversation}
          title="New Conversation"
          className="p-1.5 rounded-md hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={createNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-leos-card hover:bg-leos-surfaceHover border border-leos-border hover:border-leos-borderLight rounded-lg text-xs font-medium text-leos-text transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-leos-accent" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-leos-dark/60 rounded-md border border-leos-border text-xs text-leos-muted">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search threads..."
            className="w-full bg-transparent border-none outline-none text-xs text-leos-text placeholder:text-leos-muted"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <div className="px-2 py-1.5 text-[11px] font-medium text-leos-muted uppercase tracking-wider">
          Conversations
        </div>
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                isActive
                  ? 'bg-leos-surfaceHover text-leos-text font-medium border-l-2 border-leos-accent'
                  : 'text-leos-muted hover:bg-leos-card hover:text-leos-text'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-1">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-leos-muted" />
                <span className="truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-leos-surface hover:text-red-400 text-leos-muted transition-opacity"
                title="Delete thread"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Tools & Accounts Bar */}
      <div className="p-2 border-t border-leos-border space-y-1 bg-leos-dark/30">
        {/* MCP Tools Link */}
        <button
          onClick={onOpenMCP}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover transition-colors"
        >
          <div className="flex items-center gap-2">
            <Puzzle className="w-3.5 h-3.5 text-leos-accent" />
            <span>MCP Tools</span>
          </div>
          <span className="text-[10px] font-mono bg-leos-border/50 px-1.5 py-0.5 rounded text-leos-muted">Active</span>
        </button>

        {/* Settings Link */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        {/* Active Account Pill */}
        <div
          onClick={onOpenAccounts}
          className="mt-1.5 p-2 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-leos-accent to-amber-600 flex items-center justify-center text-[10px] font-semibold text-black shrink-0">
              {activeAccount?.name ? activeAccount.name.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-leos-text truncate leading-tight">
                {activeAccount?.name || 'Account'}
              </span>
              <span className="text-[10px] text-leos-muted truncate">
                {activeAccount?.email || 'Connected'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-leos-muted">
            <span className="text-[10px] font-mono bg-leos-border px-1 rounded">
              {accounts.length}
            </span>
            <Users className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
};
