import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bold, 
  Italic, 
  List, 
  Code, 
  Terminal, 
  Eye, 
  Edit3,
  Camera,
  Mic,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/Button';

interface MarkdownEditorProps {
  value: string;
  aiLoading?: boolean;
  onChange: (value: string) => void;
  onDelete?: () => void;
  onMediaCapture?: (type: 'image' | 'audio') => void;
  onAiOptimize?: () => void;
}

export function MarkdownEditor({ value, aiLoading, onChange, onDelete, onMediaCapture, onAiOptimize }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selection = text.substring(start, end);
    const newValue = text.substring(0, start) + before + selection + after + text.substring(end);
    onChange(newValue);
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + before.length, end + before.length);
      }
    }, 0);
  };

  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('_', '_') },
    { icon: List, label: 'List', action: () => insertText('- ', '') },
    { icon: Code, label: 'Code', action: () => insertText('```javascript\n', '\n```') },
    { icon: Terminal, label: 'Terminal', action: () => insertText('```bash\n', '\n```') },
    { icon: Trash2, label: 'Clear', action: () => onDelete?.() },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-1.5 p-2 lg:flex-nowrap lg:overflow-x-auto lg:no-scrollbar">
          <div className="flex shrink-0 bg-white rounded-lg border border-slate-200 p-0.5">
            <Button 
              variant={mode === 'write' ? 'primary' : 'ghost'} 
              size="icon-sm" 
              onClick={() => setMode('write')}
              className="h-7 w-7 lg:h-8 lg:w-8"
              title="Scrivi"
            >
              <Edit3 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
            <Button 
              variant={mode === 'preview' ? 'primary' : 'ghost'} 
              size="icon-sm" 
              onClick={() => setMode('preview')}
              className="h-7 w-7 lg:h-8 lg:w-8"
              title="Anteprima"
            >
              <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block" />
          
          <div className="flex items-center gap-1 flex-wrap lg:flex-nowrap">
            {toolbarActions.map((item, i) => (
              <Button 
                key={i} 
                variant="ghost" 
                size="icon-sm" 
                onClick={item.action}
                className="h-8 w-8 lg:h-9 lg:w-9"
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 lg:h-9 lg:w-9" onClick={() => onMediaCapture?.('image')} title="Fotocamera">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 lg:h-9 lg:w-9" onClick={() => onMediaCapture?.('audio')} title="Vocale">
              <Mic className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAiOptimize} 
            className="text-blue-600 hover:bg-blue-50 h-8 lg:h-9 px-2 lg:px-3 text-[10px] lg:text-xs font-bold border border-blue-100 bg-white rounded-lg shadow-sm active:scale-95 transition-all lg:flex-none justify-center"
          >
             <Sparkles className="w-3.5 h-3.5 mr-1.5 lg:w-4 lg:h-4 lg:mr-2" />
             {aiLoading ? 'AI LOADING...' : 'AI OPTIMIZE'}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm leading-relaxed bg-transparent border-none focus:outline-none resize-none placeholder:text-slate-300"
            placeholder="Scrivi qui in Markdown... (es. # Titolo, - Lista, `codice`)"
          />
        ) : (
          <div className="w-full h-full overflow-y-auto p-6 prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || '*Nessun contenuto da visualizzare*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
