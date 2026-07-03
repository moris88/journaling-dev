# Technical Documentation for journaling-dev

## Project Overview

This project is a React-based journal application built with TypeScript, Vite, and Tailwind CSS. It utilizes Zustand for state management and local storage persistence.

## Build and Run

- **Build**: `npm run build` (runs `tsc -b` for type checking and `vite build` for production bundling).
- **Development**: `npm run dev` (starts a vite development server at port 3000).
- **Type Checking**: `npm run typecheck` (runs `tsc --noEmit`).
- **Linting/Formatting**: Use `npm run lint` or `npm run format`.

## Technology Stack

- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS, CSS modules/Vanilla CSS
- **State Management**: Zustand
- **Date Handling**: `date-fns`
- **Speech Recognition**: `react-speech-recognition`
- **Markdown Rendering**: `react-markdown`, `react-syntax-highlighter`
- **AI Integration**: `@google/generative-ai`

## Key Architecture

- **State Management**: The application state is primarily managed via `src/store/useJournalStore.ts` using Zustand's `persist` middleware to save data to local storage.
- **Data Structure**: Journal entries are defined in `src/types/index.ts` as `JournalEntry`.
- **Components**: UI components are located in `src/components/ui/`, and feature-specific components are in `src/components/`.
- **Utils**: Helper functions for AI (`src/utils/ai.ts`) and backup/restore (`src/utils/backup.ts`) are separated.
