import { cn } from '@/utils/cn'

interface SeparatorProps {
	className?: string
	label?: string
}

export function Separator({ className, label }: SeparatorProps) {
	if (label) {
		return (
			<div className={cn('my-2 flex items-center gap-3', className)}>
				<div className="h-px flex-1 bg-slate-200" />
				<span className="font-medium text-slate-500 text-xs uppercase tracking-wide">
					{label}
				</span>
				<div className="h-px flex-1 bg-slate-200" />
			</div>
		)
	}
	return <div className={cn('my-2 h-px bg-slate-200', className)} />
}
