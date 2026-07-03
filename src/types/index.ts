export type MediaType = 'image' | 'audio'
export type AIProvider = 'gemini' | 'anthropic' | 'openai'

export interface AIConfig {
	apiKey: string | null
	model: string
}

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'it'

export interface Media {
	id: string
	type: MediaType
	url: string // Base64 or Blob URL for local
	timestamp: number
}

export interface JournalEntry {
	id: string
	title: string
	content: string // Markdown
	contentHistory: string[] // History of content for undo
	redoHistory: string[] // History of content for redo
	mood?: string // Emoji mood
	date: string // ISO format (YYYY-MM-DD)
	createdAt: number
	updatedAt: number
	media: Media[]
	tags: string[]
}

export interface JournalState {
	entries: JournalEntry[]
	deletedEntries: JournalEntry[] // Add this
	currentEntryId: string | null
	theme: Theme
	language: Language

	// AI Configs
	activeProvider: AIProvider
	aiConfigs: Record<AIProvider, AIConfig>

	chatMessages: { role: 'user' | 'ai'; content: string }[]

	// Actions
	addEntry: (
		entry: Omit<
			JournalEntry,
			'id' | 'createdAt' | 'updatedAt' | 'contentHistory' | 'redoHistory'
		>,
	) => void
	updateEntry: (
		id: string,
		updates: Partial<JournalEntry>,
		saveToHistory?: boolean,
	) => void
	undoEntryUpdate: (id: string) => void
	redoEntryUpdate: (id: string) => void
	deleteEntry: (id: string) => void
	restoreEntry: (id: string) => void // Add this
	permanentlyDeleteEntry: (id: string) => void // Add this

	setActiveProvider: (provider: AIProvider) => void
	setAIConfig: (provider: AIProvider, config: Partial<AIConfig>) => void

	setChatMessages: (
		messages: { role: 'user' | 'ai'; content: string }[],
	) => void
	clearChat: () => void
	setCurrentEntryId: (id: string | null) => void
	setTheme: (theme: Theme) => void
	setLanguage: (language: Language) => void
	setEntries: (entries: JournalEntry[]) => void
}
