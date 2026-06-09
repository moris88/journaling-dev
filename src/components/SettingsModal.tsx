import { Cpu, Database, Download, Key, ShieldCheck, Upload } from 'lucide-react'
import type { AIConfig, AIProvider } from '../types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'

interface SettingsModalProps {
	open: boolean
	onClose: () => void
	activeProvider: AIProvider
	aiConfigs: Record<AIProvider, AIConfig>
	onSetActiveProvider: (provider: AIProvider) => void
	onSetAIConfig: (provider: AIProvider, config: Partial<AIConfig>) => void
	onExport: () => void
	onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SettingsModal({
	open,
	onClose,
	activeProvider,
	aiConfigs,
	onSetActiveProvider,
	onSetAIConfig,
	onExport,
	onImport,
}: SettingsModalProps) {
	const providers: { id: AIProvider; label: string }[] = [
		{ id: 'gemini', label: 'Google Gemini' },
		{ id: 'openai', label: 'OpenAI (ChatGPT)' },
		{ id: 'anthropic', label: 'Anthropic (Claude)' },
	]

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Impostazioni DevJournal"
			size="lg"
		>
			<div className="space-y-8 p-6">
				{/* AI Configuration */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 font-semibold text-blue-600">
						<Cpu className="h-4 w-4" />
						<h3>Configurazione AI</h3>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{providers.map((p) => (
							<button
								type="button"
								key={p.id}
								onClick={() => onSetActiveProvider(p.id)}
								className={`rounded-xl border-2 p-3 font-medium text-sm transition-all ${
									activeProvider === p.id
										? 'border-blue-600 bg-blue-50 text-blue-700'
										: 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
								}`}
							>
								{p.label}
							</button>
						))}
					</div>

					<div className="space-y-6 rounded-xl border border-slate-100 bg-slate-50 p-6">
						{providers.map((p) => (
							<div
								key={p.id}
								className={activeProvider === p.id ? 'space-y-4' : 'hidden'}
							>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label
											htmlFor={`${p.id}-api-key`}
											className="flex items-center gap-2 font-semibold text-slate-500 text-xs uppercase tracking-wider"
										>
											<Key className="h-3 w-3" />
											API Key {p.label}
										</label>
										<Input
											id={`${p.id}-api-key`}
											name={`${p.id}-api-key`}
											type="password"
											placeholder={`Inserisci la tua API Key per ${p.label}...`}
											defaultValue={aiConfigs[p.id].apiKey || ''}
											onBlur={(e) =>
												onSetAIConfig(p.id, { apiKey: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor={`${p.id}-model`}
											className="flex items-center gap-2 font-semibold text-slate-500 text-xs uppercase tracking-wider"
										>
											<Cpu className="h-3 w-3" />
											ID Modello
										</label>
										<Input
											id={`${p.id}-model`}
											name={`${p.id}-model`}
											placeholder="es: gpt-4o, claude-3-5-sonnet, gemini-1.5-pro"
											defaultValue={aiConfigs[p.id].model}
											onBlur={(e) =>
												onSetAIConfig(p.id, { model: e.target.value })
											}
										/>
									</div>
								</div>
								<p className="flex items-center gap-1 text-[10px] text-slate-400">
									<ShieldCheck className="h-3 w-3" />
									Le chiavi vengono salvate esclusivamente nel localStorage del
									tuo browser.
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Data Management */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 font-semibold text-blue-600">
						<Database className="h-4 w-4" />
						<h3>Gestione Dati Locali</h3>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
							<p className="mb-3 text-slate-500 text-xs leading-relaxed">
								Esporta tutte le tue note, immagini e trascrizioni in un singolo
								file JSON.
							</p>
							<Button
								variant="outline"
								className="w-full gap-2"
								onClick={onExport}
							>
								<Download className="h-4 w-4" />
								Esporta Backup
							</Button>
						</div>
						<div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
							<p className="mb-3 text-slate-500 text-xs leading-relaxed">
								Importa un backup precedente. Attenzione: i dati attuali
								verranno sovrascritti.
							</p>
							<div className="relative">
								<input
									type="file"
									accept=".json"
									onChange={onImport}
									className="absolute inset-0 cursor-pointer opacity-0"
								/>
								<Button variant="outline" className="w-full gap-2">
									<Upload className="h-4 w-4" />
									Importa Backup
								</Button>
							</div>
						</div>
					</div>
				</section>

				<div className="flex justify-end border-slate-100 border-t pt-4">
					<Button onClick={onClose} className="px-8">
						Chiudi
					</Button>
				</div>
			</div>
		</Modal>
	)
}
