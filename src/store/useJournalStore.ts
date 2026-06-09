import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { JournalEntry, JournalState } from '../types'

export const useJournalStore = create<JournalState>()(
	persist(
		(set) => ({
			entries: [],
			currentEntryId: null,
			activeProvider: 'gemini',
			aiConfigs: {
				gemini: { apiKey: null, model: 'gemini-1.5-flash' },
				anthropic: { apiKey: null, model: 'claude-3-5-sonnet-20240620' },
				openai: { apiKey: null, model: 'gpt-4o' },
			},
			chatMessages: [],

			addEntry: (entryData) => {
				const newEntry: JournalEntry = {
					...entryData,
					id: crypto.randomUUID(),
					contentHistory: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
				}
				set((state) => ({
					entries: [newEntry, ...state.entries],
					currentEntryId: newEntry.id,
				}))
			},

			updateEntry: (id, updates, saveToHistory = false) => {
				set((state) => ({
					entries: state.entries.map((entry) => {
						if (entry.id === id) {
							const currentHistory = entry.contentHistory || []
							const newHistory = saveToHistory
								? [entry.content, ...currentHistory].slice(0, 50) // Keep last 50 versions
								: currentHistory

							return {
								...entry,
								...updates,
								contentHistory: newHistory,
								updatedAt: Date.now(),
							}
						}
						return entry
					}),
				}))
			},

			undoEntryUpdate: (id) => {
				set((state) => ({
					entries: state.entries.map((entry) => {
						const currentHistory = entry.contentHistory || []
						if (entry.id === id && currentHistory.length > 0) {
							const [previousContent, ...remainingHistory] = currentHistory
							return {
								...entry,
								content: previousContent,
								contentHistory: remainingHistory,
								updatedAt: Date.now(),
							}
						}
						return entry
					}),
				}))
			},

			deleteEntry: (id) => {
				set((state) => ({
					entries: state.entries.filter((entry) => entry.id !== id),
					currentEntryId:
						state.currentEntryId === id ? null : state.currentEntryId,
				}))
			},

			setActiveProvider: (provider) => set({ activeProvider: provider }),

			setAIConfig: (provider, config) =>
				set((state) => ({
					aiConfigs: {
						...state.aiConfigs,
						[provider]: { ...state.aiConfigs[provider], ...config },
					},
				})),

			setChatMessages: (messages) => set({ chatMessages: messages }),

			clearChat: () => set({ chatMessages: [] }),

			setCurrentEntryId: (id) => set({ currentEntryId: id }),

			setEntries: (entries) => set({ entries }),
		}),
		{
			name: 'journal-storage',
			storage: createJSONStorage(() => localStorage),
		},
	),
)
