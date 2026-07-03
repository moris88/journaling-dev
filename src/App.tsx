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
	Cpu,
	History,
	Menu,
	Mic,
	Moon,
	Plus,
	RefreshCw,
	Send,
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
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Modal } from './components'
import { EmptyState } from './components/EmptyState'
import { MarkdownEditor } from './components/MarkdownEditor'
import { MediaCaptureModal } from './components/MediaCaptureModal'
import { SettingsModal } from './components/SettingsModal'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
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
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
					'fixed inset-y-0 left-0 z-50 w-72 border-slate-200 border-r bg-white transition-transform duration-300 lg:relative lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
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
				<header className="flex h-14 shrink-0 items-center justify-between border-slate-200 border-b px-3 lg:h-16 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
					<div className="flex items-center gap-2 overflow-hidden lg:gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:flex"
						>
							<Menu className="h-5 w-5" />
						</Button>
						{currentEntry && (
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => {
										const currentIndex = entries.findIndex(
											(e) => e.id === currentEntryId,
										)
										if (currentIndex > 0)
											setCurrentEntryId(entries[currentIndex - 1].id)
									}}
									disabled={
										entries.findIndex((e) => e.id === currentEntryId) <= 0
									}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => {
										const currentIndex = entries.findIndex(
											(e) => e.id === currentEntryId,
										)
										if (currentIndex < entries.length - 1)
											setCurrentEntryId(entries[currentIndex + 1].id)
									}}
									disabled={
										entries.findIndex((e) => e.id === currentEntryId) >=
										entries.length - 1
									}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						)}
						<h2 className="max-w-37.5 truncate font-semibold text-sm lg:max-w-none lg:text-lg">
							{currentEntry ? currentEntry.title : t('common.app_name')}
						</h2>
					</div>
					<div className="flex items-center gap-1 lg:gap-2">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
							className="text-slate-500 dark:text-slate-400"
							title={
								theme === 'dark'
									? t('common.light_mode')
									: t('common.dark_mode')
							}
						>
							{theme === 'dark' ? (
								<Sun className="h-4 w-4" />
							) : (
								<Moon className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsChatOpen(!isChatOpen)}
							className={cn(
								'hidden lg:flex lg:border lg:border-slate-200 dark:border-slate-800',
								isChatOpen && 'bg-slate-100 dark:bg-slate-800',
							)}
						>
							<Sparkles className="h-4 w-4 text-blue-600 lg:mr-2" />
							<span className="hidden text-xs lg:inline dark:text-slate-400">
								Chat AI
							</span>
						</Button>
					</div>
				</header>

				<div className="flex-1 overflow-y-auto p-2 lg:p-8">
					{currentEntry ? (
						<div className="mx-auto flex h-full max-w-4xl flex-col space-y-4 lg:space-y-6">
							<Card className="relative flex flex-1 flex-col overflow-hidden border-0 lg:border">
								<button
									type="button"
									onClick={() => setCurrentEntryId(null)}
									className="absolute top-2 right-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
								>
									<X className="h-5 w-5" />
								</button>
								<div className="shrink-0 border-slate-100 border-b px-4 py-3 lg:px-6 lg:py-4 dark:border-slate-800 dark:bg-slate-900">
									<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
										<div className="flex flex-1 flex-col gap-1">
											<span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
												{editorMode === 'write'
													? 'Imposta un titolo'
													: 'Titolo'}
											</span>
											<input
												type="text"
												value={currentEntry.title}
												onChange={(e) =>
													updateEntry(currentEntry.id, {
														title: e.target.value,
													})
												}
												className="border-none bg-transparent font-bold text-xl placeholder:text-slate-300 focus:outline-none lg:text-2xl"
												placeholder={t('editor.title_placeholder')}
											/>
										</div>
										<div className="flex flex-col gap-1">
											<span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
												{editorMode === 'write'
													? "Imposta uno stato d'animo"
													: "Stato d'animo"}
											</span>
											<div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-1.5 lg:rounded-full lg:border lg:bg-transparent dark:border-slate-800 dark:bg-slate-900">
												{[
													'😝',
													'😍',
													'😂',
													'😃',
													'🥳',
													'🤔',
													'😴',
													'🤯',
													'😢',
													'😡',
													'🤢',
													'🥵',
													'🥶',
												].map((emoji) => (
													<button
														key={emoji}
														type="button"
														onClick={() =>
															updateEntry(currentEntry.id, { mood: emoji })
														}
														className={cn(
															'flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all hover:bg-white hover:shadow-sm',
															currentEntry.mood === emoji
																? 'scale-110 bg-white shadow-md ring-2 ring-blue-100 dark:border-slate-800 dark:bg-slate-900'
																: 'opacity-50 grayscale hover:grayscale-0',
														)}
														title={t('editor.set_mood')}
													>
														{emoji}
													</button>
												))}
											</div>
										</div>
									</div>
								</div>
								<div className="flex-1 overflow-hidden">
									<MarkdownEditor
										value={currentEntry.content}
										aiLoading={isAiLoading}
										canUndo={currentEntry.contentHistory?.length > 0}
										canRedo={currentEntry.redoHistory?.length > 0}
										onChange={(val) =>
											updateEntry(currentEntry.id, { content: val })
										}
										onUndo={() => undoEntryUpdate(currentEntry.id)}
										onRedo={() => redoEntryUpdate(currentEntry.id)}
										onDelete={() => {
											setShowDeleteConfirm(true)
										}}
										onMediaCapture={(type) => {
											setCaptureType(type)
											setIsMediaModalOpen(true)
										}}
										onAiOptimize={handleAiOptimize}
										onModeChange={setEditorMode}
									/>
								</div>
							</Card>

							{/* Media Gallery */}
							{currentEntry.media.length > 0 && (
								<div className="grid shrink-0 grid-cols-2 gap-4 pb-8 md:grid-cols-4">
									{currentEntry.media.map((m) => (
										<div
											key={m.id}
											className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-slate-200"
										>
											{m.type === 'image' ? (
												<img
													src={m.url}
													alt="Capture"
													className="h-full w-full object-cover"
													onClick={() => setSelectedImage(m.url)}
													onKeyDown={(e) => {
														if (e.key === 'Enter') setSelectedImage(m.url)
													}}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
													<Mic className="h-6 w-6 text-slate-400" />
												</div>
											)}
											<button
												type="button"
												onClick={() => {
													const newMedia = currentEntry.media.filter(
														(media) => media.id !== m.id,
													)
													updateEntry(currentEntry.id, { media: newMedia })
												}}
												className="absolute top-2 right-2 rounded-md bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									))}
								</div>
							)}

							{/* Fullscreen Image Viewer */}
							{selectedImage && (
								<button
									type="button"
									className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
									onClick={() => setSelectedImage(null)}
								>
									<img
										src={selectedImage}
										alt="Full view"
										className="max-h-full max-w-full rounded-lg"
									/>
								</button>
							)}
						</div>
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

			{/* AI Chat Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 right-0 z-50 w-full border-slate-200 border-l bg-white shadow-2xl transition-transform duration-300 sm:w-80 lg:relative lg:translate-x-0 lg:shadow-none dark:border-slate-800 dark:bg-slate-900',
					!isChatOpen && 'translate-x-full lg:hidden',
				)}
			>
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-slate-100 border-b p-4 dark:border-slate-800 dark:bg-slate-900">
						<span className="flex items-center gap-2 font-semibold text-[10px] text-blue-600 uppercase tracking-wider">
							<Cpu className="h-4 w-4" />
							{activeProvider} {t('chat.title')}
						</span>
						<div className="flex items-center gap-1">
							{chatMessages.length > 0 && (
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() =>
										confirm(t('chat.clear_confirm')) && clearChat()
									}
									title={t('chat.clear')}
									className="text-slate-400 hover:text-red-500"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => setIsChatOpen(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
						{!currentAIConfig.apiKey && (
							<div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
								<p className="mb-2 font-medium text-xs text-yellow-800 uppercase tracking-wider">
									{t('chat.config_required')}
								</p>
								<p className="mb-2 text-[10px] text-yellow-600">
									{t('chat.config_desc', { provider: activeProvider })}
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full text-[10px]"
									onClick={() => setIsSettingsModalOpen(true)}
								>
									{t('chat.open_settings')}
								</Button>
							</div>
						)}

						<div className="rounded-lg bg-blue-50 p-3 text-blue-700 text-xs dark:bg-blue-950 dark:text-blue-400">
							{t('chat.welcome', { provider: activeProvider })}
						</div>

						{chatMessages.map((msg, i) => (
							<div
								key={i}
								className={cn(
									'max-w-[90%] rounded-lg p-3 text-xs',
									msg.role === 'user'
										? 'ml-auto bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
										: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
								)}
							>
								<div className="prose prose-sm prose-slate dark:prose-invert">
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={{
											code({ inline, className, children, ...props }: any) {
												const match = /language-(\w+)/.exec(className || '')
												return !inline && match ? (
													<SyntaxHighlighter
														style={vscDarkPlus as any}
														language={match[1]}
														PreTag="div"
														{...props}
													>
														{String(children).replace(/\n$/, '')}
													</SyntaxHighlighter>
												) : (
													<code className={className} {...props}>
														{children}
													</code>
												)
											},
										}}
									>
										{msg.content}
									</ReactMarkdown>
								</div>
							</div>
						))}

						{isAiLoading && (
							<div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
								<RefreshCw className="h-3 w-3 animate-spin" />
								{t('chat.processing', { provider: activeProvider })}
							</div>
						)}
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault()
							handleChatSubmit()
						}}
						className="border-slate-100 border-t p-4"
					>
						{/* Suggested Prompts */}
						<div className="mb-3 flex flex-wrap gap-2">
							{[
								t('chat.suggested.yesterday'),
								t('chat.suggested.help_writing'),
								t('chat.suggested.summarize'),
							].map((prompt) => (
								<button
									key={prompt}
									type="button"
									onClick={() => {
										setChatInput(prompt)
										setTimeout(() => handleChatSubmit(prompt), 0)
									}}
									disabled={!currentAIConfig.apiKey || isAiLoading}
									className="rounded-full border border-blue-100 bg-blue-50/50 px-2.5 py-1 text-[10px] text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
								>
									{prompt}
								</button>
							))}
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								placeholder={t('chat.placeholder', {
									provider: activeProvider,
								})}
								disabled={!currentAIConfig.apiKey || isAiLoading}
								className="flex-1 rounded-lg border-none bg-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
							/>
							<Button
								type="submit"
								size="icon-sm"
								disabled={!currentAIConfig.apiKey || isAiLoading}
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</form>
				</div>
			</aside>

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
