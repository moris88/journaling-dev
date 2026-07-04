import { Mic, Trash2, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { JournalEntry, MediaType } from '@/types'
import { cn } from '@/utils'
import { MarkdownEditor } from '../MarkdownEditor'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'

const MAX_TITLE_LENGTH = 50
const MAX_CONTENT_LENGTH = 5000
const MAX_MEDIA_COUNT = 2

interface EditorProps {
	entry: JournalEntry
	aiLoading: boolean
	editorMode: 'write' | 'preview'
	onUpdate: (updates: Partial<JournalEntry>) => void
	onUndo: () => void
	onRedo: () => void
	onDelete: () => void
	onMediaCapture: (type: MediaType) => void
	onAiOptimize: () => void
	onModeChange: (mode: 'write' | 'preview') => void
	onClose: () => void
	onRemoveMedia: (mediaId: string) => void
	onViewImage: (url: string) => void
}

export function Editor({
	entry,
	aiLoading,
	editorMode,
	onUpdate,
	onUndo,
	onRedo,
	onDelete,
	onMediaCapture,
	onAiOptimize,
	onModeChange,
	onClose,
	onRemoveMedia,
	onViewImage,
}: EditorProps) {
	const { t } = useTranslation()

	const titleExceeded = entry.title.length > MAX_TITLE_LENGTH
	const contentExceeded = entry.content.length > MAX_CONTENT_LENGTH
	const mediaExceeded = entry.media.length > MAX_MEDIA_COUNT

	return (
		<div className="mx-auto flex h-full max-w-4xl flex-col space-y-4 lg:space-y-6">
			{(titleExceeded || contentExceeded || mediaExceeded) && (
				<Alert variant="warning" title="Limiti superati">
					{titleExceeded && (
						<p>Il titolo non può superare i {MAX_TITLE_LENGTH} caratteri.</p>
					)}
					{contentExceeded && (
						<p>
							Il contenuto non può superare i {MAX_CONTENT_LENGTH} caratteri.
						</p>
					)}
					{mediaExceeded && (
						<p>Puoi aggiungere un massimo di {MAX_MEDIA_COUNT} immagini.</p>
					)}
				</Alert>
			)}
			<Card className="relative flex flex-1 flex-col overflow-hidden border-0 lg:border">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-2 right-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
				>
					<X className="h-5 w-5" />
				</button>
				<div className="shrink-0 border-slate-100 border-b px-4 py-3 lg:px-6 lg:py-4 dark:border-slate-800 dark:bg-slate-900">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
						<div className="flex flex-1 flex-col gap-1">
							<span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
								{editorMode === 'write' ? 'Imposta un titolo' : 'Titolo'} (
								{entry.title.length}/{MAX_TITLE_LENGTH})
							</span>
							<input
								type="text"
								value={entry.title}
								onChange={(e) => onUpdate({ title: e.target.value })}
								className={cn(
									'border-none bg-transparent font-bold text-xl placeholder:text-slate-300 focus:outline-none lg:text-2xl',
									titleExceeded && 'text-red-500',
								)}
								placeholder={t('editor.title_placeholder')}
							/>
							{editorMode === 'write' && (
								<span className="text-[9px] text-slate-400">
									Max {MAX_TITLE_LENGTH} caratteri.
								</span>
							)}
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
										onClick={() => onUpdate({ mood: emoji })}
										className={cn(
											'flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all hover:bg-white hover:shadow-sm',
											entry.mood === emoji
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
						value={entry.content}
						aiLoading={aiLoading}
						canUndo={entry.contentHistory?.length > 0}
						canRedo={entry.redoHistory?.length > 0}
						onChange={(val) => onUpdate({ content: val })}
						onUndo={onUndo}
						onRedo={onRedo}
						onDelete={onDelete}
						onMediaCapture={(type) => {
							if (
								type === 'image' &&
								entry.media.filter((m) => m.type === 'image').length >=
									MAX_MEDIA_COUNT
							) {
								return // Prevent adding more images
							}
							onMediaCapture(type)
						}}
						onAiOptimize={onAiOptimize}
						onModeChange={onModeChange}
					/>
					<div className="px-4 py-2 text-right text-[10px] text-slate-400">
						{editorMode === 'write' && (
							<span className="mr-4">
								Max {MAX_CONTENT_LENGTH} caratteri, {MAX_MEDIA_COUNT} immagini.
							</span>
						)}
						{entry.content.length}/{MAX_CONTENT_LENGTH}
					</div>
				</div>
			</Card>

			{entry.media.length > 0 && (
				<div className="grid shrink-0 grid-cols-2 gap-4 pb-8 md:grid-cols-4">
					{entry.media.map((m) => (
						<button
							key={m.id}
							type="button"
							className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-slate-200"
							onClick={() => m.type === 'image' && onViewImage(m.url)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									m.type === 'image' && onViewImage(m.url)
								}
							}}
							aria-label="Visualizza immagine"
						>
							{m.type === 'image' ? (
								<img
									src={m.url}
									alt="Capture"
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
									<Mic className="h-6 w-6 text-slate-400" />
								</div>
							)}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									onRemoveMedia(m.id)
								}}
								className="absolute top-2 right-2 rounded-md bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								<Trash2 className="h-3 w-3" />
							</button>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
