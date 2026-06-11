import { Cpu, Database, Download, Key, Languages, ShieldCheck, Upload } from 'lucide-react'
import type { AIConfig, AIProvider, Language } from '../types'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { Select } from './ui/Select'
import { useTranslation } from '../hooks/useTranslation'

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
	const { t, language, setLanguage } = useTranslation()

	const providers: { id: AIProvider; label: string }[] = [
		{ id: 'gemini', label: 'Google Gemini' },
		{ id: 'openai', label: 'OpenAI (ChatGPT)' },
		{ id: 'anthropic', label: 'Anthropic (Claude)' },
	]

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={t('settings.title')}
			size="lg"
		>
			<div className="space-y-8 p-6">
				{/* Language Settings */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
						<Languages className="h-4 w-4" />
						<h3>{t('settings.language')}</h3>
					</div>
					<div className="max-w-xs">
						<Select
							value={language}
							onChange={(e) => setLanguage(e.target.value as Language)}
							options={[
								{ value: 'en', label: 'English' },
								{ value: 'it', label: 'Italiano' },
							]}
						/>
					</div>
				</section>

				{/* AI Configuration */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
						<Cpu className="h-4 w-4" />
						<h3>{t('settings.ai_config')}</h3>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{providers.map((p) => (
							<button
								type="button"
								key={p.id}
								onClick={() => onSetActiveProvider(p.id)}
								className={`rounded-xl border-2 p-3 font-medium text-sm transition-all ${
									activeProvider === p.id
										? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
										: 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-700'
								}`}
							>
								{p.label}
							</button>
						))}
					</div>

					<div className="space-y-6 rounded-xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/30">
						{providers.map((p) => (
							<div
								key={p.id}
								className={activeProvider === p.id ? 'space-y-4' : 'hidden'}
							>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label
											htmlFor={`${p.id}-api-key`}
											className="flex items-center gap-2 font-semibold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400"
										>
											<Key className="h-3 w-3" />
											API Key {p.label}
										</label>
										<Input
											id={`${p.id}-api-key`}
											name={`${p.id}-api-key`}
											type="password"
											placeholder={t('settings.api_key_placeholder', { provider: p.label })}
											defaultValue={aiConfigs[p.id].apiKey || ''}
											onBlur={(e) =>
												onSetAIConfig(p.id, { apiKey: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<label
											htmlFor={`${p.id}-model`}
											className="flex items-center gap-2 font-semibold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-400"
										>
											<Cpu className="h-3 w-3" />
											{t('settings.model_id')}
										</label>
										<Input
											id={`${p.id}-model`}
											name={`${p.id}-model`}
											placeholder={t('settings.model_placeholder')}
											defaultValue={aiConfigs[p.id].model}
											onBlur={(e) =>
												onSetAIConfig(p.id, { model: e.target.value })
											}
										/>
									</div>
								</div>
								<p className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
									<ShieldCheck className="h-3 w-3" />
									{t('settings.storage_warning')}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Data Management */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
						<Database className="h-4 w-4" />
						<h3>{t('settings.local_data')}</h3>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
							<p className="mb-3 text-slate-500 text-xs leading-relaxed dark:text-slate-400">
								{t('settings.export_desc')}
							</p>
							<Button
								variant="outline"
								className="w-full gap-2"
								onClick={onExport}
							>
								<Download className="h-4 w-4" />
								{t('settings.export_backup')}
							</Button>
						</div>
						<div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
							<p className="mb-3 text-slate-500 text-xs leading-relaxed dark:text-slate-400">
								{t('settings.import_desc')}
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
									{t('settings.import_backup')}
								</Button>
							</div>
						</div>
					</div>
				</section>

				<div className="flex justify-end border-slate-100 border-t pt-4 dark:border-slate-800">
					<Button onClick={onClose} className="px-8">
						{t('common.close')}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
