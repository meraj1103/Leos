# Security & Privacy Policy

## Our Zero-Knowledge Guarantee

Leos is built with a **strict local-first, zero-knowledge architecture**:

1. **No Intermediary Server:** Leos has no central servers that receive, process, store, or log your prompts, completions, or file attachments.
2. **Direct Client-to-Provider Communications:** Network requests are dispatched directly from your local Chromium instance to the respective provider (Google, Anthropic, OpenAI) or local port (`localhost:11434` for Ollama).
3. **Partition Isolation:** Each linked Google account runs in an isolated Chromium storage partition (`persist:account_id`). Cookies, tokens, and local cache do not cross boundaries between accounts.
4. **Local Hardware Storage:** Tokens and credentials stored locally are encrypted on your device using OS-backed cryptographic primitives.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability or credential handling concern in Leos, please do **NOT** open a public issue. Instead, please report it privately by emailing:

- **Security Team Contact:** `security@leos-ai.dev` (or open a confidential GitHub Security Advisory)

Please include:
- A description of the issue.
- Step-by-step reproduction instructions.
- Potential impact assessment.

We take all disclosures seriously and aim to acknowledge receipt within 48 hours and release patches promptly.
