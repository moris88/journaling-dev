import React, { useState } from 'react';
import { useJournalStore } from './store/useJournalStore';
import { 
  Menu, 
  Plus, 
  Settings2, 
  Terminal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Mic,
  Trash2,
  RefreshCw,
  Send,
  History,
  Layout,
  Cpu
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { cn } from './utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { MarkdownEditor } from './components/MarkdownEditor';
import { MediaCaptureModal } from './components/MediaCaptureModal';
import { SettingsModal } from './components/SettingsModal';
import { optimizeText, getGeminiResponse } from './utils/gemini';
import { exportToJson, importFromJson } from './utils/backup';
import { Modal } from './components';

export function App() {
  const { 
    entries, 
    currentEntryId, 
    setCurrentEntryId, 
    addEntry, 
    updateEntry,
    deleteEntry, 
    geminiApiKey, 
    setGeminiApiKey,
    geminiModel,
    setGeminiModel,
    chatMessages,
    setChatMessages,
    clearChat,
    setEntries 
  } = useJournalStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  
  // Modals State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [captureType, setCaptureType] = useState<'image' | 'audio'>('image');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentEntry = entries.find(e => e.id === currentEntryId);

  const handleCapture = (type: 'image' | 'audio', data: string) => {
    if (!currentEntry) return;
    
    if (type === 'image') {
      const newMedia = [
        ...currentEntry.media,
        { id: crypto.randomUUID(), type, url: data, timestamp: Date.now() }
      ];
      updateEntry(currentEntry.id, { media: newMedia });
    } else {
      // For audio (transcription), we append to content
      updateEntry(currentEntry.id, { 
        content: currentEntry.content + '\n\n' + '> [Trascrizione vocale]: ' + data 
      });
    }
  };

  const handleAiOptimize = async () => {
    if (!currentEntry || !geminiApiKey) {
      if (!geminiApiKey) alert("Per favore, inserisci la tua API Key di Gemini nelle impostazioni.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const optimized = await optimizeText(geminiApiKey, currentEntry.content, geminiModel);
      updateEntry(currentEntry.id, { content: optimized });
    } catch (err) {
      console.error(err);
      alert("Errore durante l'ottimizzazione AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !geminiApiKey) return;
    
    const userMsg = chatInput;
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user', content: userMsg } as const];
    setChatMessages(newMessages);
    setIsAiLoading(true);

    try {
      // Build context from all notes (or just recent ones to save tokens)
      const context = entries.slice(0, 10).map(e => `[${e.date}] ${e.title}: ${e.content}`).join('\n\n');
      const response = await getGeminiResponse(geminiApiKey, userMsg, context, geminiModel);
      setChatMessages([...newMessages, { role: 'ai', content: response } as const]);
    } catch (err) {
      console.error(err);
      setChatMessages([...newMessages, { role: 'ai', content: "Scusa, si è verificato un errore con Gemini." } as const]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExport = () => {
    exportToJson(entries, `dev-journal-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromJson(file);
      if (Array.isArray(importedData)) {
        if (confirm(`Sei sicuro di voler importare ${importedData.length} note? Questo sovrascriverà le note attuali.`)) {
          setEntries(importedData);
        }
      } else {
        alert("Il file non sembra contenere un backup valido.");
      }
    } catch (err) {
      alert("Errore durante l'importazione: " + (err as Error).message);
    }
  };

  const handleNewEntry = () => {
      addEntry({
        title: `Entry del ${format(new Date(), 'dd MMMM yyyy', { locale: it })}`,
        content: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        media: [],
        tags: ['journal']
      });
  };

  // Calendar logic
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:-ml-72"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
              <Terminal className="w-6 h-6" />
              <span>DevJournal</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4">
            <Button className="w-full justify-start gap-2" onClick={handleNewEntry}>
              <Plus className="w-4 h-4" />
              Nuova Nota
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Calendar Widget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase text-slate-400">Calendario</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setViewDate(subMonths(viewDate, 1))}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setViewDate(addMonths(viewDate, 1))}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-medium text-center mb-2">
                {format(viewDate, 'MMMM yyyy', { locale: it })}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-medium">
                {['D', 'L', 'M', 'M', 'G', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Add padding for start of month */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {calendarDays.map(day => {
                  const entry = entries.find(e => e.date === format(day, 'yyyy-MM-dd'));
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => entry && setCurrentEntryId(entry.id)}
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all relative",
                        isSameDay(day, new Date()) ? "border border-blue-600 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-100",
                        entry && "bg-blue-50 font-bold text-blue-700"
                      )}
                    >
                      {format(day, 'd')}
                      {entry && <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 px-1 mb-2">
                <History className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-semibold uppercase text-slate-400">Recenti</span>
              </div>
              {entries.slice(0, 5).map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setCurrentEntryId(entry.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                    currentEntryId === entry.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {entry.title}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-slate-500 text-sm"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Settings2 className="w-4 h-4" />
              Impostazioni
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-14 lg:h-16 border-b border-slate-200 flex items-center justify-between px-3 lg:px-8 bg-white shrink-0">
          <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:flex">
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-sm lg:text-lg truncate max-w-37.5 lg:max-w-none">
              {currentEntry ? currentEntry.title : 'DevJournal'}
            </h2>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsChatOpen(!isChatOpen)} 
              className={cn("hidden lg:flex lg:border lg:border-slate-200", isChatOpen && "bg-slate-100")}
            >
              <Sparkles className="w-4 h-4 lg:mr-2 text-blue-600" />
              <span className="hidden lg:inline text-xs">Chat AI</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 lg:p-8">
          {currentEntry ? (
            <div className="max-w-4xl mx-auto h-full flex flex-col space-y-4 lg:space-y-6">
              <Card className="flex-1 flex flex-col overflow-hidden border-0 lg:border">
                <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-slate-100 shrink-0">
                  <input 
                    type="text" 
                    value={currentEntry.title}
                    onChange={(e) => updateEntry(currentEntry.id, { title: e.target.value })}
                    className="text-xl lg:text-2xl font-bold w-full bg-transparent border-none focus:outline-none placeholder:text-slate-300"
                    placeholder="Titolo della nota..."
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <MarkdownEditor 
                    value={currentEntry.content}
                    aiLoading={isAiLoading}
                    onChange={(val) => updateEntry(currentEntry.id, { content: val })}
                    onDelete={() => {
                      setShowDeleteConfirm(true);
                    }}
                    onMediaCapture={(type) => {
                      setCaptureType(type);
                      setIsMediaModalOpen(true);
                    }}
                    onAiOptimize={handleAiOptimize}
                  />
                </div>
              </Card>
              
              {/* Media Gallery */}
              {currentEntry.media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 shrink-0">
                  {currentEntry.media.map(m => (
                    <div key={m.id} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                      {m.type === 'image' ? (
                        <img src={m.url} alt="Capture" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Mic className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          const newMedia = currentEntry.media.filter(media => media.id !== m.id);
                          updateEntry(currentEntry.id, { media: newMedia });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Layout className="w-16 h-16 opacity-20" />
              <p>Nessuna nota selezionata. Crea una nuova nota per iniziare.</p>
              <Button onClick={handleNewEntry}>Inizia a scrivere</Button>
            </div>
          )}
        </div>

        {/* Mobile Floating AI Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center transition-all duration-300 active:scale-95 lg:hidden",
            isChatOpen ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
          )}
          aria-label="Apri Chat AI"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      </main>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* AI Chat Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-white border-l border-slate-200 transition-transform duration-300 shadow-2xl lg:relative lg:translate-x-0 lg:shadow-none",
          !isChatOpen && "translate-x-full lg:hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-blue-600 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Gemini AI Assistant
            </span>
            <div className="flex items-center gap-1">
              {chatMessages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => confirm('Sei sicuro di voler pulire la cronologia della chat?') && clearChat()}
                  title="Pulisci chat"
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => setIsChatOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-4">
            {!geminiApiKey && (
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                <p className="text-yellow-800 text-xs mb-2 font-medium uppercase tracking-wider">Configurazione richiesta</p>
                <input 
                  type="password" 
                  placeholder="Inserisci API Key Gemini"
                  className="w-full text-xs p-2 rounded border border-yellow-200 focus:outline-none bg-white"
                  onBlur={(e) => setGeminiApiKey(e.target.value)}
                />
                <p className="text-[10px] text-yellow-600 mt-2">La chiave verrà salvata solo localmente nel tuo browser.</p>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-xs">
              Ciao! Sono Gemini. Chiedimi qualsiasi cosa sulle tue note o chiedimi di riassumere i tuoi progressi.
            </div>

            {chatMessages.map((msg, i) => (
              <div key={i} className={cn(
                "p-3 rounded-lg max-w-[90%] text-xs",
                msg.role === 'user' ? "ml-auto bg-slate-100 text-slate-800" : "bg-blue-50 text-blue-800"
              )}>
                <div className="prose prose-sm prose-slate">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            
            {isAiLoading && (
              <div className="flex items-center gap-2 text-slate-400 italic text-[10px]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Gemini sta elaborando...
              </div>
            )}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}
            className="p-4 border-t border-slate-100"
          >
            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chiedi a Gemini..."
                disabled={!geminiApiKey || isAiLoading}
                className="flex-1 bg-slate-100 border-none rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button type="submit" size="icon-sm" disabled={!geminiApiKey || isAiLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </aside>

      <SettingsModal 
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        geminiApiKey={geminiApiKey}
        geminiModel={geminiModel}
        onSetApiKey={setGeminiApiKey}
        onSetModel={setGeminiModel}
        onExport={handleExport}
        onImport={handleImport}
      />

      <MediaCaptureModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onCapture={handleCapture}
        initialType={captureType}
      />

      {showDeleteConfirm && currentEntry?.id && (
        <Modal
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Conferma eliminazione"
          children={
            <div className="p-4">
              <p>Sei sicuro di voler cancellare il contenuto di questa nota?</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Annulla</Button>
                <Button variant="danger" onClick={() => { deleteEntry(currentEntry.id); setShowDeleteConfirm(false); }}>Elimina</Button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
