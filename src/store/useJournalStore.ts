import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JournalEntry, JournalState } from '../types';

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      currentEntryId: null,
      geminiApiKey: null,
      geminiModel: 'gemini-3.5-flash',
      chatMessages: [],

      addEntry: (entryData) => {
        const newEntry: JournalEntry = {
          ...entryData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
          currentEntryId: newEntry.id,
        }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: Date.now() }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
          currentEntryId: state.currentEntryId === id ? null : state.currentEntryId,
        }));
      },

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      
      setGeminiModel: (model) => set({ geminiModel: model }),

      setChatMessages: (messages) => set({ chatMessages: messages }),

      clearChat: () => set({ chatMessages: [] }),
      
      setCurrentEntryId: (id) => set({ currentEntryId: id }),

      setEntries: (entries) => set({ entries }),
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
