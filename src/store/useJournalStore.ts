import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { JournalEntry, JournalState } from '../types'

export const useJournalStore = create<JournalState>()(
	persist(
		(set) => ({
			entries: [],
			deletedEntries: [],
			currentEntryId: null,
			theme: 'light',
			language: navigator.language.startsWith('it') ? 'it' : 'en',
			activeProvider: 'gemini',
			aiConfigs: {
				gemini: { apiKey: null, model: 'gemini-2.5-flash' },
				anthropic: { apiKey: null, model: '' },
				openai: { apiKey: null, model: '' },
			},
			chatMessages: [],

			addEntry: (entryData) => {
				const newEntry: JournalEntry = {
					...entryData,
					id: crypto.randomUUID(),
					contentHistory: [],
					redoHistory: [],
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
								redoHistory: [], // Clear redo history on new edit
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
						const currentRedoHistory = entry.redoHistory || []
						if (entry.id === id && currentHistory.length > 0) {
							const [previousContent, ...remainingHistory] = currentHistory
							return {
								...entry,
								content: previousContent,
								contentHistory: remainingHistory,
								redoHistory: [entry.content, ...currentRedoHistory],
								updatedAt: Date.now(),
							}
						}
						return entry
					}),
				}))
			},

			redoEntryUpdate: (id) => {
				set((state) => ({
					entries: state.entries.map((entry) => {
						const currentRedoHistory = entry.redoHistory || []
						if (entry.id === id && currentRedoHistory.length > 0) {
							const [nextContent, ...remainingRedo] = currentRedoHistory
							return {
								...entry,
								content: nextContent,
								contentHistory: [entry.content, ...entry.contentHistory],
								redoHistory: remainingRedo,
								updatedAt: Date.now(),
							}
						}
						return entry
					}),
				}))
			},

			deleteEntry: (id) => {
				set((state) => {
					const entryToDelete = state.entries.find((e) => e.id === id)
					if (!entryToDelete) return state
					return {
						entries: state.entries.filter((entry) => entry.id !== id),
						deletedEntries: [entryToDelete, ...state.deletedEntries],
						currentEntryId:
							state.currentEntryId === id ? null : state.currentEntryId,
					}
				})
			},

			restoreEntry: (id) => {
				set((state) => {
					const entryToRestore = state.deletedEntries.find((e) => e.id === id)
					if (!entryToRestore) return state
					return {
						entries: [entryToRestore, ...state.entries],
						deletedEntries: state.deletedEntries.filter((e) => e.id !== id),
					}
				})
			},

			permanentlyDeleteEntry: (id) => {
				set((state) => ({
					deletedEntries: state.deletedEntries.filter((e) => e.id !== id),
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

			setTheme: (theme) => set({ theme }),

			setLanguage: (language) => set({ language }),

			setEntries: (entries) => set({ entries }),
		}),
		{
			name: 'journal-storage',
			storage: createJSONStorage(() => localStorage),
			merge: (persistedState, currentState) => ({
				...currentState,
				...(persistedState as any),
				deletedEntries: (persistedState as any).deletedEntries || [],
			}),
		},
	),
)
