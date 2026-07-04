import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	isSameDay,
	startOfMonth,
	subMonths,
} from 'date-fns'
import { enUS, it } from 'date-fns/locale'
import {
	ChevronLeft,
	ChevronRight,
	History,
	Plus,
	RefreshCw,
	Settings2,
	Sparkles,
	Sun,
	Terminal,
	Trash,
	Trash2,
	X,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Modal } from './components'
import { Chat } from './components/Chat/Chat'
import { Editor } from './components/Editor/Editor'
import { EmptyState } from './components/EmptyState'
import { Header } from './components/Layout/Header'
import { MediaCaptureModal } from './components/MediaCaptureModal'
import { SettingsModal } from './components/SettingsModal'
import { Button } from './components/ui/Button'
import { useTranslation } from './hooks/useTranslation'
import { useJournalStore } from './store/useJournalStore'
import { cn } from './utils'
import { getAIResponse, optimizeText } from './utils/ai'
import { exportToJson, importFromJson } from './utils/backup'

export function App() {
	const {
		entries,
		currentEntryId,
		setCurrentEntryId,
		addEntry,
		updateEntry,
		undoEntryUpdate,
		redoEntryUpdate,
		deleteEntry,
		restoreEntry,
		permanentlyDeleteEntry,
		deletedEntries,
		theme,
		setTheme,
		language,
		activeProvider,
		aiConfigs,
		setActiveProvider,
		setAIConfig,
		chatMessages,
		setChatMessages,
		clearChat,
		setEntries,
	} = useJournalStore()

	const { t } = useTranslation()
	const dateLocale = language === 'it' ? it : enUS

	useEffect(() => {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [theme])

	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [isChatOpen, setIsChatOpen] = useState(false)
	const [viewDate, setViewDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState<string | null>(
		format(new Date(), 'yyyy-MM-dd'),
	)
	const [isTrashOpen, setIsTrashOpen] = useState(false) // Add this

	// Modals State
	const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [captureType, setCaptureType] = useState<'image' | 'audio'>('image')
	const [_selectedImage, setSelectedImage] = useState<string | null>(null)

	// Chat State
	const [chatInput, setChatInput] = useState('')
	const [isAiLoading, setIsAiLoading] = useState(false)
	const [editorMode, setEditorMode] = useState<'write' | 'preview'>('preview')

	const currentEntry = entries.find((e) => e.id === currentEntryId)
	const currentAIConfig = aiConfigs[activeProvider]

	const handleDateClick = (dateStr: string) => {
		setSelectedDate(dateStr)
		const entry = entries.find((e) => e.date === dateStr)
		if (entry) {
			setCurrentEntryId(entry.id)
		}
	}

	const handleCapture = (type: 'image' | 'audio', data: string) => {
		if (!currentEntry) return

		if (type === 'image') {
			const newMedia = [
				...currentEntry.media,
				{ id: crypto.randomUUID(), type, url: data, timestamp: Date.now() },
			]
			updateEntry(currentEntry.id, { media: newMedia })
		} else {
			// For audio (transcription), we append to content
			updateEntry(
				currentEntry.id,
				{
					content: `${currentEntry.content}\n\n> [${t('media.transcription_prefix')}]: ${data}`,
				},
				true,
			)
		}
	}

	const handleAiOptimize = async () => {
		if (!currentEntry || !currentAIConfig.apiKey) {
			if (!currentAIConfig.apiKey)
				alert(t('settings.api_key_required', { provider: activeProvider }))
			return
		}

		setIsAiLoading(true)
		try {
			const optimized = await optimizeText(
				activeProvider,
				currentAIConfig.apiKey,
				currentAIConfig.model,
				currentEntry.content,
				language,
			)
			updateEntry(currentEntry.id, { content: optimized }, true)
		} catch (err) {
			console.error(err)
			alert(`${t('common.error')} AI: ${(err as Error).message}`)
		} finally {
			setIsAiLoading(false)
		}
	}

	const handleChatSubmit = async (overridePrompt?: string) => {
		const promptToUse = overridePrompt || chatInput
		if (!promptToUse.trim() || !currentAIConfig.apiKey) return

		const userMsg = promptToUse
		setChatInput('')
		const newMessages = [
			...chatMessages,
			{ role: 'user', content: userMsg } as const,
		]
		setChatMessages(newMessages)
		setIsAiLoading(true)

		try {
			// Build context from all notes (or just recent ones to save tokens)
			const context = entries
				.slice(0, 10)
				.map((e) => `[${e.date}] ${e.title}: ${e.content}`)
				.join('\n\n')
			const response = await getAIResponse(
				activeProvider,
				currentAIConfig.apiKey,
				currentAIConfig.model,
				userMsg,
				language,
				context,
			)
			setChatMessages([
				...newMessages,
				{ role: 'ai', content: response } as const,
			])
		} catch (err) {
			console.error(err)
			setChatMessages([
				...newMessages,
				{
					role: 'ai',
					content: t('chat.error', { provider: activeProvider }),
				} as const,
			])
		} finally {
			setIsAiLoading(false)
		}
	}

	const handleExport = () => {
		exportToJson(
			entries,
			`dev-journal-backup-${format(new Date(), 'yyyy-MM-dd')}.json`,
		)
	}

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const importedData = await importFromJson(file)
			if (Array.isArray(importedData)) {
				if (
					confirm(
						t('settings.import_confirm', {
							count: String(importedData.length),
						}),
					)
				) {
					setEntries(importedData)
				}
			} else {
				alert(t('settings.invalid_backup'))
			}
		} catch (err) {
			alert(`${t('common.error')}: ${(err as Error).message}`)
		}
	}

	const handleNewEntry = () => {
		const dateStr = format(new Date(), 'yyyy-MM-dd')
		const titleDate = format(new Date(), 'dd MMMM yyyy', { locale: dateLocale })
		addEntry({
			title: t('editor.entry_title_prefix', { date: titleDate }),
			content: '',
			date: dateStr,
			media: [],
			tags: ['journal'],
		})
	}

	// Calendar logic
	const monthStart = startOfMonth(viewDate)
	const monthEnd = endOfMonth(monthStart)
	const calendarDays = eachDayOfInterval({
		start: monthStart,
		end: monthEnd,
	})

	return (
		<div className="relative flex h-dvh w-full overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-full border-slate-200 border-r bg-white transition-transform duration-300 lg:relative lg:w-72 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
					!isSidebarOpen && '-translate-x-full lg:-ml-72',
				)}
			>
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-slate-100 border-b p-4">
						<div className="flex items-center gap-2 font-bold text-blue-600 text-lg">
							<Terminal className="h-6 w-6" />
							<span>DevJournal</span>
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => setIsSidebarOpen(false)}
							className="lg:hidden"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="p-4">
						<Button
							className="w-full justify-start gap-2"
							onClick={handleNewEntry}
						>
							<Plus className="h-4 w-4" />
							{t('sidebar.new_entry')}
						</Button>
					</div>

					<nav className="flex-1 space-y-4 overflow-y-auto p-4">
						{/* Calendar Widget */}
						<div className="space-y-2">
							<div className="flex items-center justify-between px-1">
								<span className="font-semibold text-slate-400 text-xs uppercase">
									{t('sidebar.calendar')}
								</span>
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => setViewDate(new Date())}
									>
										<Sun className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => setViewDate(subMonths(viewDate, 1))}
									>
										<ChevronLeft className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => setViewDate(addMonths(viewDate, 1))}
									>
										<ChevronRight className="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div className="mb-2 text-center font-medium text-sm">
								{format(viewDate, 'MMMM yyyy', { locale: dateLocale })}
							</div>
							<div className="grid grid-cols-7 gap-1 text-center font-medium text-[10px] text-slate-400">
								{(language === 'it'
									? ['D', 'L', 'M', 'M', 'G', 'V', 'S']
									: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
								).map((d, i) => (
									<div key={`${d}-${i}`}>{d}</div>
								))}
							</div>
							<div className="grid grid-cols-7 gap-1">
								{/* Add padding for start of month */}
								{Array.from({ length: monthStart.getDay() }).map((_, i) => (
									<div key={`pad-${i}`} />
								))}
								{calendarDays.map((day) => {
									const dateStr = format(day, 'yyyy-MM-dd')
									const entry = entries.find((e) => e.date === dateStr)
									return (
										<button
											key={day.toISOString()}
											type="button"
											onClick={() => handleDateClick(dateStr)}
											className={cn(
												'relative flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all',
												isSameDay(day, new Date())
													? 'border border-blue-600 font-bold text-blue-600'
													: 'text-slate-600 hover:bg-slate-100',
												selectedDate === dateStr &&
													'bg-blue-600 font-bold text-white',
												entry &&
													selectedDate !== dateStr &&
													'bg-blue-50 font-bold text-blue-700',
											)}
										>
											{format(day, 'd')}
											{entry && (
												<div
													className={cn(
														'absolute bottom-1 h-1 w-1 rounded-full',
														selectedDate === dateStr
															? 'bg-white'
															: 'bg-blue-600',
													)}
												/>
											)}
										</button>
									)
								})}
							</div>
						</div>

						<div className="space-y-1">
							<div className="mb-2 flex items-center justify-between px-1">
								<div className="flex items-center gap-2">
									<History className="h-3 w-3 text-slate-400" />
									<span className="font-semibold text-slate-400 text-xs uppercase">
										{isTrashOpen
											? t('sidebar.trash')
											: selectedDate
												? format(new Date(selectedDate), 'dd MMM yyyy', {
														locale: dateLocale,
													})
												: t('common.recent')}
									</span>
								</div>
								{selectedDate && !isTrashOpen && (
									<button
										type="button"
										onClick={() => setSelectedDate(null)}
										className="text-[10px] text-blue-600 hover:underline"
									>
										{t('common.all')}
									</button>
								)}
								{isTrashOpen && (
									<button
										type="button"
										onClick={() => setIsTrashOpen(false)}
										className="text-[10px] text-blue-600 hover:underline"
									>
										{t('common.back')}
									</button>
								)}
							</div>
							{!isTrashOpen ? (
								(selectedDate
									? entries.filter((e) => e.date === selectedDate)
									: entries.slice(0, 10)
								).map((entry) => (
									<div
										key={entry.id}
										className={cn(
											'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
											currentEntryId === entry.id
												? 'bg-blue-600 text-white'
												: 'text-slate-600 hover:bg-slate-100',
										)}
									>
										<button
											type="button"
											onClick={() => {
												setCurrentEntryId(entry.id)
												setIsTrashOpen(false)
											}}
											className="flex flex-1 items-center justify-between truncate text-left"
										>
											<span className="truncate">{entry.title}</span>
											{entry.mood && (
												<span className="ml-2 shrink-0">{entry.mood}</span>
											)}
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation()
												deleteEntry(entry.id)
											}}
											className={cn(
												'ml-2 shrink-0 p-1 opacity-0 transition-opacity group-hover:opacity-100',
												currentEntryId === entry.id
													? 'text-white hover:text-red-200'
													: 'text-slate-400 hover:text-red-500',
											)}
											title={t('common.delete')}
										>
											<Trash2 className="h-3 w-3" />
										</button>
									</div>
								))
							) : (
								<div className="space-y-1">
									{deletedEntries.map((entry) => (
										<div
											key={entry.id}
											className="group flex items-center justify-between rounded-lg px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-100"
										>
											<span className="truncate">{entry.title}</span>
											<div className="flex shrink-0 gap-1">
												<button
													type="button"
													onClick={() => restoreEntry(entry.id)}
													className="p-1 text-slate-400 hover:text-blue-500"
													title={t('editor.restore')}
												>
													<RefreshCw className="h-3 w-3" />
												</button>
												<button
													type="button"
													onClick={() => permanentlyDeleteEntry(entry.id)}
													className="p-1 text-slate-400 hover:text-red-500"
													title={t('editor.permanent_delete')}
												>
													<Trash2 className="h-3 w-3" />
												</button>
											</div>
										</div>
									))}
								</div>
							)}
							{selectedDate &&
								entries.filter((e) => e.date === selectedDate).length === 0 && (
									<div className="py-4 text-center">
										<p className="text-slate-400 text-xs italic">
											{t('sidebar.no_entries_day')}
										</p>
										<Button
											variant="ghost"
											size="sm"
											className="mt-2 h-7 text-[10px]"
											onClick={() => {
												const titleDate = format(
													new Date(selectedDate),
													'dd MMMM yyyy',
													{ locale: dateLocale },
												)
												addEntry({
													title: t('editor.entry_title_prefix', {
														date: titleDate,
													}),
													content: '',
													date: selectedDate,
													media: [],
													tags: ['journal'],
												})
											}}
										>
											{t('sidebar.create_note')}
										</Button>
									</div>
								)}
						</div>
					</nav>

					<div className="border-slate-100 border-t p-4">
						<Button
							variant="ghost"
							className="w-full justify-start gap-2 text-slate-500 text-sm"
							onClick={() => setIsTrashOpen(true)}
						>
							<Trash className="h-4 w-4" />
							{t('sidebar.trash')}
						</Button>
						<Button
							variant="ghost"
							className="w-full justify-start gap-2 text-slate-500 text-sm"
							onClick={() => setIsSettingsModalOpen(true)}
						>
							<Settings2 className="h-4 w-4" />
							{t('settings.title')}
						</Button>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex min-w-0 flex-1 flex-col">
				<Header
					onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
					onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					onToggleChat={() => setIsChatOpen(!isChatOpen)}
					isChatOpen={isChatOpen}
					theme={theme}
					title={currentEntry ? currentEntry.title : t('common.app_name')}
					showNavigation={!!currentEntry}
					onPrev={() => {
						const currentIndex = entries.findIndex(
							(e) => e.id === currentEntryId,
						)
						if (currentIndex > 0)
							setCurrentEntryId(entries[currentIndex - 1].id)
					}}
					onNext={() => {
						const currentIndex = entries.findIndex(
							(e) => e.id === currentEntryId,
						)
						if (currentIndex < entries.length - 1)
							setCurrentEntryId(entries[currentIndex + 1].id)
					}}
					canPrev={entries.findIndex((e) => e.id === currentEntryId) > 0}
					canNext={
						entries.findIndex((e) => e.id === currentEntryId) <
						entries.length - 1
					}
				/>

				<div className="flex-1 overflow-y-auto p-2 lg:p-8">
					{currentEntry ? (
						<Editor
							entry={currentEntry}
							aiLoading={isAiLoading}
							editorMode={editorMode}
							onUpdate={(updates) => updateEntry(currentEntry.id, updates)}
							onUndo={() => undoEntryUpdate(currentEntry.id)}
							onRedo={() => redoEntryUpdate(currentEntry.id)}
							onDelete={() => setShowDeleteConfirm(true)}
							onMediaCapture={(type) => {
								setCaptureType(type)
								setIsMediaModalOpen(true)
							}}
							onAiOptimize={handleAiOptimize}
							onModeChange={setEditorMode}
							onClose={() => setCurrentEntryId(null)}
							onRemoveMedia={(mediaId) => {
								const newMedia = currentEntry.media.filter(
									(m) => m.id !== mediaId,
								)
								updateEntry(currentEntry.id, { media: newMedia })
							}}
							onViewImage={setSelectedImage}
						/>
					) : (
						<EmptyState language={language} onNewEntry={handleNewEntry} />
					)}
				</div>

				{/* Mobile Floating AI Button */}
				<button
					type="button"
					onClick={() => setIsChatOpen(true)}
					className={cn(
						'fixed right-6 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all duration-300 active:scale-95 lg:hidden',
						isChatOpen
							? 'translate-y-20 opacity-0'
							: 'translate-y-0 opacity-100',
					)}
					aria-label="Apri Chat AI"
				>
					<Sparkles className="h-6 w-6" />
				</button>
			</main>

			{/* Mobile Chat Overlay */}
			{isChatOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
					onClick={() => setIsChatOpen(false)}
				/>
			)}

			{/* Image Viewer Modal */}
			{_selectedImage && (
				<Modal
					open={!!_selectedImage}
					onClose={() => setSelectedImage(null)}
					title="Immagine"
					size="lg"
				>
					<div className="flex items-center justify-center p-4">
						<img
							src={_selectedImage}
							alt="Full screen preview"
							className="max-h-[80vh] w-auto rounded-lg"
						/>
					</div>
				</Modal>
			)}

			<Chat
				isOpen={isChatOpen}
				onClose={() => setIsChatOpen(false)}
				messages={chatMessages}
				onClear={clearChat}
				aiConfig={currentAIConfig}
				activeProvider={activeProvider}
				isAiLoading={isAiLoading}
				onSettingsClick={() => setIsSettingsModalOpen(true)}
				onSubmit={handleChatSubmit}
				onSuggestedPrompt={handleChatSubmit}
			/>

			<SettingsModal
				open={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
				activeProvider={activeProvider}
				aiConfigs={aiConfigs}
				onSetActiveProvider={setActiveProvider}
				onSetAIConfig={setAIConfig}
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
					title={t('editor.delete_confirm_title')}
				>
					<div className="p-4">
						<p>{t('editor.delete_confirm_desc')}</p>
						<div className="mt-4 flex justify-end gap-2">
							<Button
								variant="ghost"
								onClick={() => setShowDeleteConfirm(false)}
							>
								{t('common.cancel')}
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									deleteEntry(currentEntry.id)
									setShowDeleteConfirm(false)
								}}
							>
								{t('common.delete')}
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	)
}
