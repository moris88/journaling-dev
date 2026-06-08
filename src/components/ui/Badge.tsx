import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/utils/cn'

const badgeVariants = tv({
	base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
	variants: {
		variant: {
			default: 'bg-slate-100 text-slate-700',
			blue: 'bg-blue-100 text-blue-700',
			green: 'bg-green-100 text-green-700',
			red: 'bg-red-100 text-red-700',
			amber: 'bg-amber-100 text-amber-700',
			purple: 'bg-purple-100 text-purple-700',
		},
	},
	defaultVariants: { variant: 'default' },
})

type BadgeVariants = VariantProps<typeof badgeVariants>

interface BadgeProps extends BadgeVariants {
	children: React.ReactNode
	className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ variant }), className)}>
			{children}
		</span>
	)
}
