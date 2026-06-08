import {
	CheckCircle,
	InfoCircle,
	TriangleFlag,
	WarningTriangle,
} from 'iconoir-react'

import { cn } from '@/utils/cn'

type AlertVariant = 'info' | 'warning' | 'error' | 'success'

interface AlertProps {
	variant?: AlertVariant
	title?: string
	children: React.ReactNode
	className?: string
}

const config: Record<
	AlertVariant,
	{ icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
	info: {
		icon: InfoCircle,
		classes: 'bg-blue-50 border-blue-200 text-blue-800',
	},
	warning: {
		icon: WarningTriangle,
		classes: 'bg-amber-50 border-amber-200 text-amber-800',
	},
	error: {
		icon: TriangleFlag,
		classes: 'bg-red-50 border-red-200 text-red-800',
	},
	success: {
		icon: CheckCircle,
		classes: 'bg-green-50 border-green-200 text-green-800',
	},
}

export function Alert({
	variant = 'info',
	title,
	children,
	className,
}: AlertProps) {
	const { icon: Icon, classes } = config[variant]
	return (
		<div
			className={cn(
				'flex items-center gap-3 rounded-lg border p-4',
				classes,
				className,
			)}
		>
			<Icon className="mt-0.5 h-5 w-5 shrink-0" />
			<div className="flex-1 text-sm">
				{title && <p className="mb-1 font-semibold">{title}</p>}
				<div>{children}</div>
			</div>
		</div>
	)
}
