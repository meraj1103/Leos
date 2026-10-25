# Contributing to Leos

Thank you for your interest in contributing to **Leos**! We are building the open-source, privacy-first universal AI cockpit.

## Code of Conduct

Please maintain a welcoming, respectful, and collaborative environment. Be thoughtful, constructive, and kind.

## Development Workflow

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended, v20+ preferred)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Quickstart

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/Leos.git
   cd Leos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Run TypeScript check & build:**
   ```bash
   npm run build
   ```

## UI & Design Guidelines

1. **No Text Emojis in the UI:** 
   Leos uses professional, minimalist monochrome vector icons from `lucide-react`. Do not inject raw Unicode emojis into buttons, titles, or sidebars.
2. **Clean & Distraction-Free:**
   Keep the interface minimal, readable, and responsive. Mimic the ergonomics of top productivity tools.
3. **Local-First & Privacy Guarantees:**
   Never add network calls that transmit user chats or tokens to third-party telemetry services.

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit your changes with clear, descriptive messages.
3. Push to your branch and open a Pull Request against `main`.
4. Describe the problem your PR solves and attach screenshots or reproduction steps.
