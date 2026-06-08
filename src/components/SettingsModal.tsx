import { Download, Upload, Key, Database, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useState } from 'react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  geminiApiKey: string | null;
  geminiModel: string;
  onSetApiKey: (key: string) => void;
  onSetModel: (model: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SettingsModal({ 
  open, 
  onClose, 
  geminiApiKey, 
  geminiModel,
  onSetApiKey, 
  onSetModel,
  onExport, 
  onImport 
}: SettingsModalProps) {
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [customModel, setCustomModel] = useState('');

  const modelOptions = [
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (SOTA, Ultra-Veloce)' },
    { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro (Massima Precisione)' },
    { value: 'gemini-3.1-flash', label: 'Gemini 3.1 Flash (Bilanciato)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Precedente)' },
    { value: 'custom', label: 'Altro (Inserisci ID modello)' },
  ];

  const handleModelChange = (val: string) => {
    if (val === 'custom') {
      setShowCustomModel(true);
    } else {
      setShowCustomModel(false);
      onSetModel(val);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Impostazioni DevJournal" size="md">
      <div className="p-6 space-y-8">
        {/* Gemini Configuration */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Cpu className="w-4 h-4" />
            <h3>Configurazione AI</h3>
          </div>
          
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* ... API KEY INPUT ... */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Key className="w-3 h-3" />
                Google Gemini API Key
              </label>
              <Input 
                type="password" 
                placeholder="Inserisci la tua API Key..."
                defaultValue={geminiApiKey || ''}
                onBlur={(e) => onSetApiKey(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
                <ShieldCheck className="w-3 h-3" />
                La chiave viene salvata esclusivamente nel localStorage.
              </p>
            </div>

            <div className="space-y-2">
              <Select 
                label="Modello Generativo"
                options={modelOptions}
                value={showCustomModel ? 'custom' : geminiModel}
                onChange={(e) => handleModelChange(e.target.value)}
              />
              
              {showCustomModel && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Input 
                    placeholder="Esempio: gemini-2.0-pro-exp-02-05"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    onBlur={() => customModel && onSetModel(customModel)}
                  />
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/models/gemini" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline mt-1 block px-1"
                  >
                    Vedi lista modelli ufficiali Google →
                  </a>
                </div>
              )}
              
              {!showCustomModel && (
                <p className="text-[10px] text-slate-400 px-1">
                  Corrente: <span className="font-mono">{geminiModel}</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Database className="w-4 h-4" />
            <h3>Gestione Dati Locali</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Esporta tutte le tue note, immagini e trascrizioni in un singolo file JSON.
              </p>
              <Button variant="outline" className="w-full gap-2" onClick={onExport}>
                <Download className="w-4 h-4" />
                Esporta Backup
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Importa un backup precedente. Attenzione: i dati attuali verranno sovrascritti.
              </p>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={onImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Importa Backup
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose}>Chiudi</Button>
        </div>
      </div>
    </Modal>
  );
}
