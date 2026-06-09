# 📓 DevJournal

DevJournal is a sophisticated, local-first markdown journal designed specifically for developers. It combines the simplicity of markdown with the power of modern AI to help you document your daily progress, optimize your thoughts, and interact with your personal knowledge base.

![DevJournal Screenshot](https://raw.githubusercontent.com/your-username/journaling-dev/main/public/vite.svg)

## ✨ Features

- **📝 Markdown-First Editor:** Rich text editing with full Markdown support, **syntax highlighting for code blocks**, and live preview.
- **🤖 Multi-Provider AI Integration:** Use your favorite AI models from **Google Gemini**, **Anthropic (Claude)**, or **OpenAI (ChatGPT)**.
- **⚡ AI Optimization:** Professionally re-elaborate your notes with a single click while maintaining your original intent.
- **🕒 Revision History & Undo:** Never lose a thought. DevJournal maintains a history of your notes, allowing you to revert changes effortlessly, especially after AI transformations.
- **📸 Multimedia Support:** Capture images and record audio transcriptions directly into your journal entries.
- **📅 Calendar Navigation:** Intuitive calendar view to browse your entries chronologically.
- **💬 AI Chat Assistant:** Chat with your journal entries. Ask questions about your past thoughts, summarize progress, or brainstorm new ideas.
- **🔒 Private & Local-First:** Your data stays on your machine. All notes and API keys are stored securely in your browser's local storage.
- **💾 Backup & Portability:** Easily export and import your entire journal as a single JSON file.
- **📱 Responsive Design:** Optimized for both desktop and mobile use.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/journaling-dev.git
   cd journaling-dev
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

To enable AI features, go to the **Settings** menu and enter your API keys for the desired providers:

- **Google Gemini:** Get your key at [AI Studio](https://aistudio.google.com/).
- **OpenAI:** Get your key at [OpenAI Dashboard](https://platform.openai.com/).
- **Anthropic:** Get your key at [Anthropic Console](https://console.anthropic.com/).

You can also specify custom model IDs (e.g., `gpt-4o`, `claude-3-5-sonnet`, `gemini-1.5-pro`) for each provider.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Icons:** Lucide React
- **Markdown:** React Markdown, Remark GFM
- **Date Handling:** date-fns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Crafted with ❤️ for developers who love to write.
