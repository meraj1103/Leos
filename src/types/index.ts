/**
 * Leos Universal AI Cockpit - Type Definitions
 * Version 1.0.0
 */

export type ModelProvider = 
  | 'google' 
  | 'anthropic' 
  | 'openai' 
  | 'deepseek' 
  | 'groq' 
  | 'ollama' 
  | 'lmstudio' 
  | 'openrouter';

export type AccountType = 'personal' | 'work' | 'student' | 'custom';

export interface LeosAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: AccountType;
  partition: string; // e.g., 'persist:account_1'
  isActive: boolean;
  connectedModels: string[]; // Model IDs available to this account
  tokenStatus: 'healthy' | 'warning' | 'limited';
}

export interface LeosModel {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number; // in tokens
  supportsVision: boolean;
  supportsVoice: boolean;
  supportsTools: boolean;
  isLocal: boolean;
  description: string;
  tag?: string; // e.g. "Free Web", "2M Context", "Local GPU"
}

export interface LeosAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'url';
  size?: number;
  url?: string;
  content?: string; // Base64 for images, parsed text for docs
  mimeType?: string;
}

export interface LeosMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: LeosAttachment[];
  modelInfo?: {
    modelId: string;
    modelName: string;
    provider: ModelProvider;
    accountId?: string;
    accountEmail?: string;
  };
  mcpToolCalls?: {
    toolName: string;
    args: Record<string, unknown>;
    result?: string;
  }[];
}

export interface LeosConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: LeosMessage[];
  pinned?: boolean;
}

export interface LeosSkill {
  id: string;
  name: string;
  description: string;
  iconName: string;
  systemPrompt: string;
  enabled: boolean;
  category: 'coding' | 'writing' | 'research' | 'custom';
}

export interface MCPServerConfig {
  id: string;
  name: string;
  type: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  url?: string;
  enabled: boolean;
  toolsCount: number;
  status: 'connected' | 'disconnected' | 'error';
}
