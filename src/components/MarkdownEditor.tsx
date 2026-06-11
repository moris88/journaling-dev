import {
	Bold,
	Camera,
	Code,
	Edit3,
	Eye,
	Italic,
	List,
	Mic,
	RotateCcw,
	Sparkles,
	Terminal,
	Trash2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Button } from './ui/Button'
import { useTranslation } from '../hooks/useTranslation'

interface MarkdownEditorProps {
	value: string
	aiLoading?: boolean
	canUndo?: boolean
	onChange: (value: string) => void
	onUndo?: () => void
	onDelete?: () => void
	onMediaCapture?: (type: 'image' | 'audio') => void
	onAiOptimize?: () => void
}

export function MarkdownEditor({
	value,
	aiLoading,
	canUndo,
	onChange,
	onUndo,
	onDelete,
	onMediaCapture,
	onAiOptimize,
}: MarkdownEditorProps) {
	const { t } = useTranslation()
	const [mode, setMode] = useState<'write' | 'preview'>('write')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const insertText = (before: string, after: string = '') => {
		if (!textareaRef.current) return
		const start = textareaRef.current.selectionStart
		const end = textareaRef.current.selectionEnd
		const text = textareaRef.current.value
		const selection = text.substring(start, end)
		const newValue =
			text.substring(0, start) +
			before +
			selection +
			after +
			text.substring(end)
		onChange(newValue)

		// Reset focus and selection
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus()
				textareaRef.current.setSelectionRange(
					start + before.length,
					end + before.length,
				)
			}
		}, 0)
	}

	const toolbarActions = [
		{ icon: Bold, label: t('editor.bold'), action: () => insertText('**', '**') },
		{ icon: Italic, label: t('editor.italic'), action: () => insertText('_', '_') },
		{ icon: List, label: t('editor.list'), action: () => insertText('- ', '') },
		{
			icon: Code,
			label: t('editor.code'),
			action: () => insertText('```javascript\n', '\n```'),
		},
		{
			icon: Terminal,
			label: t('editor.terminal'),
			action: () => insertText('```bash\n', '\n```'),
		},
	]

	return (
		<div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900">
			{/* Toolbar */}
			<div className="sticky top-0 z-20 shrink-0 border-slate-100 border-b bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
				<div className="lg:no-scrollbar flex flex-wrap items-center gap-1.5 p-2 lg:flex-nowrap lg:overflow-x-auto">
					<div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-950">
						<Button
							variant={mode === 'write' ? 'primary' : 'ghost'}
							size="icon-sm"
							onClick={() => setMode('write')}
							className="h-7 w-7 lg:h-8 lg:w-8"
							title={t('editor.write')}
						>
							<Edit3 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
						</Button>
						<Button
							variant={mode === 'preview' ? 'primary' : 'ghost'}
							size="icon-sm"
							onClick={() => setMode('preview')}
							className="h-7 w-7 lg:h-8 lg:w-8"
							title={t('editor.preview')}
						>
							<Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
						</Button>
					</div>

					<div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block dark:bg-slate-800" />

					<div className="flex flex-wrap items-center gap-1 lg:flex-nowrap">
						{toolbarActions.map((item, i) => (
							<Button
								key={i}
								variant="ghost"
								size="icon-sm"
								onClick={item.action}
								className="h-8 w-8 lg:h-9 lg:w-9"
								title={item.label}
							>
								<item.icon className="h-4 w-4" />
							</Button>
						))}
					</div>

					<div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block dark:bg-slate-800" />

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-8 w-8 lg:h-9 lg:w-9"
							onClick={() => onMediaCapture?.('image')}
							title={t('media.photo_tab')}
						>
							<Camera className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-8 w-8 lg:h-9 lg:w-9"
							onClick={() => onMediaCapture?.('audio')}
							title={t('media.audio_tab')}
						>
							<Mic className="h-4 w-4" />
						</Button>
					</div>

					<div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block dark:bg-slate-800" />

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-8 w-8 text-slate-500 lg:h-9 lg:w-9 dark:text-slate-400"
							onClick={onUndo}
							disabled={!canUndo}
							title={t('editor.undo_btn')}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-8 w-8 text-red-500 hover:bg-red-50 lg:h-9 lg:w-9 dark:hover:bg-red-950/30"
							onClick={onDelete}
							title={t('common.delete')}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>

					<div className="hidden h-6 w-px shrink-0 bg-slate-200 lg:block dark:bg-slate-800" />

					<Button
						variant="ghost"
						size="sm"
						onClick={onAiOptimize}
						className="h-8 justify-center rounded-lg border border-blue-100 bg-white px-2 font-bold text-[10px] text-blue-600 shadow-sm transition-all hover:bg-blue-50 active:scale-95 lg:h-9 lg:flex-none lg:px-3 lg:text-xs dark:border-blue-900 dark:bg-slate-950 dark:text-blue-400 dark:hover:bg-blue-950/50"
					>
						<Sparkles className="mr-1.5 h-3.5 w-3.5 lg:mr-2 lg:h-4 lg:w-4" />
						{aiLoading ? t('editor.optimizing').toUpperCase() : t('editor.optimize_btn').toUpperCase()}
					</Button>
				</div>
			</div>

			{/* Content Area */}
			<div className="relative flex-1 overflow-hidden">
				{mode === 'write' ? (
					<textarea
						ref={textareaRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="h-full w-full resize-none border-none bg-transparent p-6 font-mono text-slate-900 text-sm leading-relaxed placeholder:text-slate-300 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600"
						placeholder={t('editor.placeholder')}
					/>
				) : (
					<div className="prose prose-slate dark:prose-invert h-full w-full max-w-none overflow-y-auto p-6">
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
							{value || `*${t('sidebar.no_entries')}*`}
						</ReactMarkdown>
					</div>
				)}
			</div>
		</div>
	)
}