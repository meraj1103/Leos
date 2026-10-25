import React, { useState } from 'react';
import { 
  X, 
  Puzzle, 
  Plus, 
  Terminal, 
  HardDrive, 
  Cloud, 
  Globe, 
  GitBranch,
  Trash2
} from 'lucide-react';
import { useMCPStore } from '../stores/useMCPStore';

interface MCPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MCPModal: React.FC<MCPModalProps> = ({ isOpen, onClose }) => {
  const { servers, toggleServer, addServer, removeServer } = useMCPStore();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [customArgs, setCustomArgs] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCommand.trim()) return;

    addServer({
      name: customName.trim(),
      type: 'stdio',
      command: customCommand.trim(),
      args: customArgs.trim().split(' ').filter(Boolean),
      enabled: true,
      toolsCount: 1,
      status: 'connected',
    });

    setCustomName('');
    setCustomCommand('');
    setCustomArgs('');
    setIsAddingCustom(false);
  };

  const getServerIcon = (name: string) => {
    if (name.toLowerCase().includes('filesystem')) return <HardDrive className="w-4 h-4 text-amber-400" />;
    if (name.toLowerCase().includes('drive')) return <Cloud className="w-4 h-4 text-blue-400" />;
    if (name.toLowerCase().includes('github')) return <GitBranch className="w-4 h-4 text-purple-400" />;
    return <Globe className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-leos-surface border border-leos-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-leos-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Puzzle className="w-5 h-5 text-leos-accent" />
            <div>
              <h3 className="text-sm font-semibold text-leos-text">Model Context Protocol (MCP)</h3>
              <p className="text-[11px] text-leos-muted">Universal tools bridged across Gemini, Claude, and Local LLMs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-leos-muted hover:text-leos-text hover:bg-leos-surfaceHover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server List */}
        <div className="p-4 overflow-y-auto max-h-72 space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className="p-3 bg-leos-card border border-leos-border hover:border-leos-borderLight rounded-xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-leos-surface border border-leos-border flex items-center justify-center shrink-0">
                  {getServerIcon(server.name)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-leos-text">{server.name}</span>
                    <span className="text-[10px] font-mono text-leos-muted bg-leos-border/50 px-1.5 py-0.2 rounded">
                      {server.toolsCount} tools
                    </span>
                  </div>
                  <span className="text-[10px] text-leos-muted font-mono mt-0.5">
                    {server.command} {server.args?.join(' ')}
                  </span>
                </div>
              </div>

              {/* Toggle Switch & Remove */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleServer(server.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    server.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-leos-surface text-leos-muted border border-leos-border'
                  }`}
                >
                  {server.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => removeServer(server.id)}
                  className="p-1 rounded text-leos-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove MCP server"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Server Section */}
        {isAddingCustom ? (
          <form onSubmit={handleAdd} className="p-4 border-t border-leos-border bg-leos-dark/30 space-y-2.5">
            <div className="text-xs font-semibold text-leos-text">Add Custom MCP Server</div>
            <input
              type="text"
              placeholder="Server Name (e.g. SQLite Database)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Command (e.g. npx, python)"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                required
                className="px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted"
              />
              <input
                type="text"
                placeholder="Args (space separated)"
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-leos-surface border border-leos-border text-xs text-leos-text outline-none placeholder:text-leos-muted"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-3 py-1 rounded-lg text-xs text-leos-muted hover:text-leos-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-leos-accent text-black text-xs font-semibold shadow-sm"
              >
                Connect Server
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 border-t border-leos-border bg-leos-dark/30">
            <button
              onClick={() => setIsAddingCustom(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-leos-border hover:border-leos-borderLight text-xs text-leos-muted hover:text-leos-text transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom MCP Server</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-leos-dark border-t border-leos-border flex items-center gap-2 text-[10px] text-leos-muted font-mono">
          <Terminal className="w-3.5 h-3.5 text-leos-accent shrink-0" />
          <span>MCP tools are automatically translated to Gemini, Claude, and OpenAI tool schemas.</span>
        </div>
      </div>
    </div>
  );
};
