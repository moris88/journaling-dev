export type MediaType = 'image' | 'audio'
export type AIProvider = 'gemini' | 'anthropic' | 'openai'

export interface AIConfig {
	apiKey: string | null
	model: string
}

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
	mood?: string // Emoji mood
	date: string // ISO format (YYYY-MM-DD)
	createdAt: number
	updatedAt: number
	media: Media[]
	tags: string[]
}

export interface JournalState {
	entries: JournalEntry[]
	currentEntryId: string | null

	// AI Configs
	activeProvider: AIProvider
	aiConfigs: Record<AIProvider, AIConfig>

	chatMessages: { role: 'user' | 'ai'; content: string }[]

	// Actions
	addEntry: (
		entry: Omit<
			JournalEntry,
			'id' | 'createdAt' | 'updatedAt' | 'contentHistory'
		>,
	) => void
	updateEntry: (
		id: string,
		updates: Partial<JournalEntry>,
		saveToHistory?: boolean,
	) => void
	undoEntryUpdate: (id: string) => void
	deleteEntry: (id: string) => void

	setActiveProvider: (provider: AIProvider) => void
	setAIConfig: (provider: AIProvider, config: Partial<AIConfig>) => void

	setChatMessages: (
		messages: { role: 'user' | 'ai'; content: string }[],
	) => void
	clearChat: () => void
	setCurrentEntryId: (id: string | null) => void
	setEntries: (entries: JournalEntry[]) => void
}
