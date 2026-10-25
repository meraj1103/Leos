<div align="center">

# Leos

**The Universal, Privacy-First AI Cockpit**

Multi-Account Google Sync • Gemini, Claude & ChatGPT Free Tiers • Local Desktop LLMs • Universal MCP Integration • Voice Conversations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Zero-Knowledge Privacy](https://img.shields.io/badge/Privacy-Zero--Knowledge-green.svg)](./SECURITY.md)
[![Cross-Platform](https://img.shields.io/badge/Platform-Desktop%20%7C%20Web-orange.svg)]()

</div>

---

## What is Leos?

**Leos** is an open-source, local-first cockpit that lets you connect **multiple Google accounts** (Personal, Work, Academic) and access all your AI models from one clean, unified workspace without constantly signing in and out.

Instead of paying for expensive API tokens or juggling multiple browser windows, Leos leverages **isolated Chromium session partitions** to run official web free tiers (Gemini, ChatGPT, Claude) alongside **local offline LLMs** (Ollama, LM Studio) and cloud APIs—all in one distraction-free interface.

---

## Key Features

- **Multi-Account Partition Sandbox:** Link 3+ Google accounts simultaneously. Cookies and sessions stay isolated in secure hardware-backed partitions (`persist:account_id`). Never log out again.
- **Universal Model Roster:** Seamlessly switch between **Gemini 1.5/2.0**, **Claude 3.5**, **ChatGPT**, **DeepSeek**, **Groq**, and **Local Desktop LLMs (Ollama / LM Studio)**.
- **Continuous Cross-Model Chat:** Start a conversation with Gemini, switch mid-thread to Claude, and ask a local offline model to summarize—all in one uninterrupted thread.
- **Model Context Protocol (MCP) Support:** Connect standard MCP servers (Local Filesystem, Google Drive, GitHub, SQLite) to **any** model across any account.
- **Two-Way Voice Conversations:** 
  - Voice dictation via real-time speech-to-text.
  - Hands-free two-way conversation mode with natural text-to-speech feedback.
- **Multimodal Pipeline:** Upload documents (PDF, Word, Code, CSV), photos, and live URLs. Text is parsed client-side for maximum compatibility.
- **Zero-Knowledge Privacy:** 100% local-first. Your prompts and credentials never pass through an intermediary Leos server.
- **Professional Minimalist UI:** Designed with crisp vector iconography (no distracting emojis) and clean, high-performance typography inspired by Gemini and ChatGPT.

---

## Architecture Overview

```
                                      LEOS COCKPIT
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  [ Session Partition 1 ]        [ Session Partition 2 ]        [ Session Partition 3 ]  │
│  • Personal Google Account      • Work Google Account          • Academic Account       │
│  • Gemini Free Tier             • Claude Free Tier             • ChatGPT Free Tier      │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                 UNIVERSAL ENGINE                                        │
│  • Continuous Chat History      • Multimodal File Ingestion   • Universal MCP Bridge   │
│  • Voice Dictation & TTS        • Adaptive Context Compression • Local LLMs (Ollama)    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Supported Model Providers

| Category | Providers | Notes |
| :--- | :--- | :--- |
| **Web Sessions** | Gemini, Claude, ChatGPT | Isolated Chromium webview partitions. Zero API cost. |
| **Local Desktop** | Ollama, LM Studio, vLLM | Auto-discovered on `localhost`. 100% offline & private. |
| **Cloud APIs** | DeepSeek, Groq, Mistral, OpenRouter | Optional BYO API keys with enterprise zero-retention flags. |

---

## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Leos.git
cd Leos

# Install dependencies
npm install

# Run the development environment
npm run dev
```

### Packaging for Desktop

```bash
# Build desktop executable for Windows, macOS, or Linux
npm run build
```

---

## Model Context Protocol (MCP) Configuration

Configure custom MCP servers by creating or editing `mcp-servers.json` in your Leos settings directory:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/YourName/Documents"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

---

## Privacy & Security

Leos is committed to zero-knowledge privacy:
- **No telemetry on chat prompts or completions.**
- **No intermediary proxy servers.**
- **Local credentials encrypted via OS-backed storage.**

See our full [Security Policy](./SECURITY.md) for detailed information.

---

## Contributing

We welcome community contributions, bug reports, and feature requests. Please review our [Contributing Guidelines](./CONTRIBUTING.md) before opening a pull request.

---

## License

This project is licensed under the [MIT License](./LICENSE).
