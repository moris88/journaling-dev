export type MediaType = 'image' | 'audio';

export interface Media {
  id: string;
  type: MediaType;
  url: string; // Base64 or Blob URL for local
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string; // Markdown
  date: string; // ISO format (YYYY-MM-DD)
  createdAt: number;
  updatedAt: number;
  media: Media[];
  tags: string[];
}

export interface JournalState {
  entries: JournalEntry[];
  currentEntryId: string | null;
  geminiApiKey: string | null;
  geminiModel: string;
  chatMessages: { role: 'user' | 'ai'; content: string }[];
  
  // Actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  setGeminiApiKey: (key: string | null) => void;
  setGeminiModel: (model: string) => void;
  setChatMessages: (messages: { role: 'user' | 'ai'; content: string }[]) => void;
  clearChat: () => void;
  setCurrentEntryId: (id: string | null) => void;
  setEntries: (entries: JournalEntry[]) => void;
}
