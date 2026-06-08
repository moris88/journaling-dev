import { Xmark } from 'iconoir-react'
import { useEffect } from 'react'

import { cn } from '@/utils/cn'
import { Button } from './Button'

interface ModalProps {
	open: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
	footer?: React.ReactNode
}

const sizeClasses = {
	sm: 'max-w-sm',
	md: 'max-w-lg',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
	full: 'max-w-[95vw]',
}

export function Modal({
	open,
	onClose,
	title,
	children,
	size = 'md',
	footer,
}: ModalProps) {
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		if (open) {
			document.addEventListener('keydown', handleKey)
			document.body.style.overflow = 'hidden'
		}
		return () => {
			document.removeEventListener('keydown', handleKey)
			document.body.style.overflow = ''
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				className={cn(
					'relative z-10 flex w-full flex-col rounded-xl bg-white shadow-xl',
					'max-h-[90vh]',
					sizeClasses[size],
				)}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
			>
				<div className="flex shrink-0 items-center justify-between border-slate-100 border-b px-5 py-4">
					<h2
						id="modal-title"
						className="font-semibold text-base text-slate-900"
					>
						{title}
					</h2>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onClose}
						aria-label="Chiudi"
					>
						<Xmark className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex-1 overflow-auto">{children}</div>
				{footer && (
					<div className="flex shrink-0 items-center justify-end gap-3 border-slate-100 border-t px-5 py-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	)
}
