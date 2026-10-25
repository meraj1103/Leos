import { create } from 'zustand';
import { MCPServerConfig } from '../types';

interface MCPState {
  servers: MCPServerConfig[];
  addServer: (server: Omit<MCPServerConfig, 'id'>) => void;
  toggleServer: (id: string) => void;
  removeServer: (id: string) => void;
}

const DEFAULT_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp-filesystem',
    name: 'Local Filesystem',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    enabled: true,
    toolsCount: 6,
    status: 'connected',
  },
  {
    id: 'mcp-google-drive',
    name: 'Google Drive Connector',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-drive'],
    enabled: true,
    toolsCount: 4,
    status: 'connected',
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
  {
    id: 'mcp-fetch',
    name: 'Web Scraper & Fetch',
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    enabled: true,
    toolsCount: 2,
    status: 'connected',
  },
];

export const useMCPStore = create<MCPState>((set) => ({
  servers: DEFAULT_MCP_SERVERS,
  addServer: (serverData) =>
    set((state) => ({
      servers: [
        ...state.servers,
        {
          ...serverData,
          id: `mcp-${Date.now()}`,
        },
      ],
    })),
  toggleServer: (id) =>
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === id
          ? {
              ...s,
              enabled: !s.enabled,
              status: !s.enabled ? 'connected' : 'disconnected',
            }
          : s
      ),
    })),
  removeServer: (id) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== id),
    })),
}));
