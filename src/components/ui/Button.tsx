import { tv, type VariantProps } from 'tailwind-variants'

import { cn } from '@/utils/cn'

export const buttonVariants = tv({
	base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
	variants: {
		variant: {
			primary:
				'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
			secondary:
				'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
			danger:
				'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
			ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
			outline:
				'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
			success:
				'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
		},
		size: {
			sm: 'h-8 px-3 text-xs',
			md: 'h-10 px-4 text-sm',
			lg: 'h-12 px-6 text-base',
			icon: 'h-9 w-9 p-0',
			'icon-sm': 'h-7 w-7 p-0',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
	},
})

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		ButtonVariants {
	children?: React.ReactNode
}

export function Button({
	variant,
	size,
	className,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		>
			{children}
		</button>
	)
}
