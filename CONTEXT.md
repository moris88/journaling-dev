# 📓 DevJournal - Technical Context

This document provides a high-level technical overview of **DevJournal** for developers and AI assistants.

## 🎯 Project Overview
DevJournal is a **local-first**, AI-enhanced markdown journaling application designed for developers. It prioritizes privacy, speed, and seamless AI integration for thought organization and knowledge management.

## 🏗️ Architecture & Core Principles
- **Local-First:** All data (notes, media, API keys) is stored exclusively in the browser's `localStorage` and `IndexedDB` (via Base64/Blobs). No backend server is required for core functionality.
- **Privacy Centric:** API keys for AI providers are never sent to a middle-tier server; they are used directly from the client to the provider APIs.
- **Modern Tech Stack:** React 19, TypeScript, Tailwind CSS 4, and Vite.
- **State Management:** Zustand with `persist` middleware for automatic synchronization with `localStorage`.

## ✨ Core Features
1. **Markdown Editor:**
   - Custom implementation with split view (Write/Preview).
   - Syntax highlighting via `react-syntax-highlighter` (Prism).
   - Toolbar for common markdown patterns.
2. **AI Integration (`src/utils/ai.ts`):**
   - **Multi-Provider:** Supports Google Gemini, OpenAI, and Anthropic.
   - **AI Optimization:** One-click professional re-elaboration of notes using language-aware prompts.
   - **AI Chat:** Interactive assistant that uses the last 10 notes as context for grounding responses.
3. **Multimedia Support:**
   - **Media Capture:** Integrated camera and voice transcription.
   - **Transcription Fix:** Robust `SpeechRecognition` implementation that prevents mobile duplication bugs by reconstructing the final transcript.
4. **Internationalization (i18n):**
   - Built-in English and Italian support.
   - Language-aware AI prompts and date formatting (`date-fns`).
5. **Dark Mode:** Full system-wide support, including code blocks and all UI modals.

## 📁 Project Structure
- `src/components/ui/`: Atomic UI components (Button, Input, Modal, Select, etc.).
- `src/components/`: Complex components (MarkdownEditor, MediaCaptureModal, SettingsModal).
- `src/store/`: Zustand store for entries, theme, and i18n settings.
- `src/locales/`: JSON translation files for i18n.
- `src/utils/`: AI utilities, backup logic, and styling helpers.

## ⚙️ Development
- **Installation:** `pnpm install`
- **Development Server:** `pnpm dev`
- **Linting:** `pnpm lint` (Biome)

## 🔄 Data Lifecycle
1. User writes note/captures media.
2. Zustand state updates.
3. `persist` middleware saves to `localStorage`.
4. User can manually Export/Import the entire state as a JSON backup for portability.
