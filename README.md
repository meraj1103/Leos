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

## Installation & Downloads

### 💻 Laptop / Desktop (Windows 10 / 11)
**Option 1: Pre-Built Standalone App (Zero Setup)**
1. Run `release\win-unpacked\Leos.exe` directly or download `Leos-Setup-1.0.0.exe` from [Releases](https://github.com/meraj1103/Leos/releases).
2. It launches instantly with zero setup or configuration required.

**Option 2: 1-Click Windows Launcher (`start-laptop.bat`)**
* Simply double-click [`start-laptop.bat`](./start-laptop.bat) in the project folder. It automatically detects your environment, installs dependencies if needed, and launches Leos in one click!

---

### 📱 Android (Phones & Tablets)

#### Option 1: 1-Tap Home Screen App (PWA — Recommended, Instant)
1. Double-click [`share-to-mobile.bat`](./share-to-mobile.bat) on your laptop (or run `npm run share`).
2. On your Android device (connected to the same Wi-Fi), open Chrome and enter the displayed local IP URL (e.g. `http://192.168.1.X:5173`).
3. Tap the glowing **"Install App"** button at the top (or tap Chrome Menu `⋮` ➔ **"Add to Home screen" / "Install Leos"**).
4. Leos is now installed in your Android app drawer with full offline caching and standalone full-screen window support!

#### Option 2: Standalone APK
1. Download **`Leos.apk`** from [Releases](https://github.com/meraj1103/Leos/releases).
2. Tap the APK on your device to install.

---

### 🛠️ Developer Setup (Build from Source)

```bash
# Clone the repository
git clone https://github.com/meraj1103/Leos.git
cd Leos

# Install dependencies
npm install

# Run the local web dev server
npm start

# Share on your local network (for mobile/tablet access)
npm run share

# Build the Windows one-click installer (.exe)
npm run build:win
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
