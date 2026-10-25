import { create } from 'zustand';
import { MCPServerConfig } from '../types';

interface MCPState {
  servers: MCPServerConfig[];
  addServer: (server: Omit<MCPServerConfig, 'id'>) => void;
  toggleServer: (id: string) => void;
  removeServer: (id: string) => void;
  getActiveMCPContext: () => string;
}

const SAVED_MCP_KEY = 'leos-mcp-servers';

const DEFAULT_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp-filesystem',
    name: 'Local Filesystem',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    enabled: false,
    toolsCount: 6,
    status: 'disconnected',
  },
  {
    id: 'mcp-fetch',
    name: 'Web Scraper & Fetch',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    enabled: false,
    toolsCount: 2,
    status: 'disconnected',
  },
  {
    id: 'mcp-github',
    name: 'GitHub Repository Tools',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    enabled: false,
    toolsCount: 8,
    status: 'disconnected',
  },
];

function loadInitialServers(): MCPServerConfig[] {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(SAVED_MCP_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return DEFAULT_MCP_SERVERS;
}

function persistServers(servers: MCPServerConfig[]) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SAVED_MCP_KEY, JSON.stringify(servers));
    } catch (e) {
      console.warn('Could not save MCP servers:', e);
    }
  }
}

export const useMCPStore = create<MCPState>((set, get) => ({
  servers: loadInitialServers(),
  addServer: (serverData) =>
    set((state) => {
      const updated = [
        ...state.servers,
        {
          ...serverData,
          id: `mcp-${Date.now()}`,
        },
      ];
      persistServers(updated);
      return { servers: updated };
    }),
  toggleServer: (id) =>
    set((state) => {
      const updated = state.servers.map((s) =>
        s.id === id
          ? {
              ...s,
              enabled: !s.enabled,
              status: (!s.enabled ? 'connected' : 'disconnected') as MCPServerConfig['status'],
            }
          : s
      );
      persistServers(updated);
      return { servers: updated };
    }),
  removeServer: (id) =>
    set((state) => {
      const updated = state.servers.filter((s) => s.id !== id);
      persistServers(updated);
      return { servers: updated };
    }),
  getActiveMCPContext: () => {
    const active = get().servers.filter((s) => s.enabled);
    if (active.length === 0) return '';
    return active
      .map((s) => `${s.name} (${s.type}: ${s.command} ${s.args?.join(' ') || ''})`)
      .join(', ');
  },
}));
