import { cn } from '@/utils/cn'

interface CardProps {
	children: React.ReactNode
	className?: string
}

interface CardHeaderProps {
	children: React.ReactNode
	className?: string
	actions?: React.ReactNode
}

export function Card({ children, className }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-xl border border-slate-200 bg-white shadow-sm',
				className,
			)}
		>
			{children}
		</div>
	)
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-4 border-slate-100 border-b px-5 py-4',
				className,
			)}
		>
			<div className="flex-1">{children}</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-2">{actions}</div>
			)}
		</div>
	)
}

export function CardContent({ children, className }: CardProps) {
	return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
	return (
		<h3 className={cn('font-semibold text-base text-slate-900', className)}>
			{children}
		</h3>
	)
}

export function CardDescription({ children, className }: CardProps) {
	return <p className={cn('text-slate-500 text-sm', className)}>{children}</p>
}

export function CardFooter({ children, className }: CardProps) {
	return (
		<div
			className={cn(
				'flex flex-wrap items-center justify-end gap-3 border-slate-100 border-t px-5 py-3',
				className,
			)}
		>
			{children}
		</div>
	)
}
