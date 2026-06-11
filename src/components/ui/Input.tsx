import { cn } from '@/utils/cn'

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	helper?: string
	suffix?: string
	prefix?: string
}

export function Input({
	label,
	error,
	helper,
	suffix,
	prefix,
	className,
	id,
	...props
}: InputProps) {
	const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label
					className="font-medium text-slate-700 text-sm dark:text-slate-300"
					htmlFor={inputId}
				>
					{label}
				</label>
			)}
			<div className="relative flex items-center">
				{prefix && (
					<span className="absolute left-3 select-none text-slate-500 text-sm dark:text-slate-400">
						{prefix}
					</span>
				)}
				<input
					id={inputId}
					className={cn(
						'w-full rounded-lg border bg-white px-3 py-2 text-slate-900 text-sm transition-colors dark:bg-slate-800 dark:text-slate-100',
						'placeholder:text-slate-400 dark:placeholder:text-slate-500',
						'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
						'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-600',
						error
							? 'border-red-500 focus:ring-red-500'
							: 'border-slate-300 dark:border-slate-700',
						prefix && 'pl-7',
						suffix && 'pr-12',
						className,
					)}
					{...props}
				/>
				{suffix && (
					<span className="absolute right-3 select-none text-slate-500 text-sm dark:text-slate-400">
						{suffix}
					</span>
				)}
			</div>
			{error && <p className="text-red-600 text-xs">{error}</p>}
			{helper && !error && (
				<p className="text-slate-500 text-xs dark:text-slate-400">{helper}</p>
			)}
		</div>
	)
}
