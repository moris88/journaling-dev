import { Cpu, RefreshCw, Send, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { useTranslation } from '@/hooks/useTranslation'
import type { AIConfig, AIProvider } from '@/types'
import { cn } from '@/utils'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ChatProps {
	isOpen: boolean
	onClose: () => void
	messages: { role: 'user' | 'ai'; content: string }[]
	onClear: () => void
	aiConfig: AIConfig
	activeProvider: AIProvider
	isAiLoading: boolean
	onSettingsClick: () => void
	onSubmit: (prompt: string) => void
	onSuggestedPrompt: (prompt: string) => void
}

export function Chat({
	isOpen,
	onClose,
	messages,
	onClear,
	aiConfig,
	activeProvider,
	isAiLoading,
	onSettingsClick,
	onSubmit,
	onSuggestedPrompt,
}: ChatProps) {
	const { t } = useTranslation()
	const [chatInput, setChatInput] = useState('')
	const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	return (
		<aside
			className={cn(
				'fixed inset-y-0 right-0 z-50 w-full border-slate-200 border-l bg-white shadow-2xl transition-transform duration-300 sm:w-80 lg:relative lg:translate-x-0 lg:shadow-none dark:border-slate-800 dark:bg-slate-900',
				!isOpen && 'translate-x-full lg:hidden',
			)}
		>
			<Modal
				open={isClearConfirmOpen}
				onClose={() => setIsClearConfirmOpen(false)}
				title={t('chat.clear_confirm')}
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => setIsClearConfirmOpen(false)}
						>
							{t('common.cancel')}
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								onClear()
								setIsClearConfirmOpen(false)
							}}
						>
							{t('common.confirm')}
						</Button>
					</>
				}
			>
				<p className="p-5 text-slate-600 text-sm dark:text-slate-400">
					{t('chat.clear_confirm')}
				</p>
			</Modal>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-slate-100 border-b p-4 dark:border-slate-800 dark:bg-slate-900">
					<span className="flex items-center gap-2 font-semibold text-[10px] text-blue-600 uppercase tracking-wider">
						<Cpu className="h-4 w-4" />
						{activeProvider} {t('chat.title')}
					</span>
					<div className="flex items-center gap-1">
						{messages.length > 0 && (
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => setIsClearConfirmOpen(true)}
								title={t('chat.clear')}
								className="text-slate-400 hover:text-red-500"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
						<Button variant="ghost" size="icon-sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
					{!aiConfig.apiKey && (
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
								onClick={onSettingsClick}
							>
								{t('chat.open_settings')}
							</Button>
						</div>
					)}

					<div className="rounded-lg bg-blue-50 p-3 text-blue-700 text-xs dark:bg-blue-950 dark:text-blue-400">
						{t('chat.welcome', { provider: activeProvider })}
					</div>

					{messages.map((msg, i) => (
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
					<div ref={messagesEndRef} />
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						onSubmit(chatInput)
						setChatInput('')
					}}
					className="border-slate-100 border-t p-4"
				>
					<div className="mb-3 flex flex-wrap gap-2">
						{[
							t('chat.suggested.yesterday'),
							t('chat.suggested.help_writing'),
							t('chat.suggested.summarize'),
						].map((prompt) => (
							<button
								key={prompt}
								type="button"
								onClick={() => onSuggestedPrompt(prompt)}
								disabled={!aiConfig.apiKey || isAiLoading}
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
							placeholder={t('chat.placeholder', { provider: activeProvider })}
							disabled={!aiConfig.apiKey || isAiLoading}
							className="flex-1 rounded-lg border-none bg-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
						/>
						<Button
							type="submit"
							size="icon-sm"
							disabled={!aiConfig.apiKey || isAiLoading}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</form>
			</div>
		</aside>
	)
}
