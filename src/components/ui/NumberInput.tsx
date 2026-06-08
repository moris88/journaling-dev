import { cn } from '@/utils/cn'

export interface NumberInputProps {
	label?: string
	value: number
	onChange: (value: number) => void
	suffix?: string
	prefix?: string
	min?: number
	max?: number
	step?: number
	disabled?: boolean
	error?: string
	helper?: string
	id?: string
	className?: string
	placeholder?: string
}

export function NumberInput({
	label,
	value,
	onChange,
	suffix,
	prefix,
	min,
	max,
	step = 0.01,
	disabled,
	error,
	helper,
	id,
	className,
	placeholder = '0',
}: NumberInputProps) {
	const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="font-medium text-slate-700 text-sm" htmlFor={inputId}>
					{label}
				</label>
			)}
			<div className="relative flex items-center">
				{prefix && (
					<span className="pointer-events-none absolute left-3 select-none text-slate-500 text-sm">
						{prefix}
					</span>
				)}
				<input
					id={inputId}
					type="number"
					value={value || ''}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					placeholder={placeholder}
					onChange={(e) => {
						const parsed = parseFloat(e.target.value)
						onChange(Number.isNaN(parsed) ? 0 : parsed)
					}}
					className={cn(
						'w-full rounded-lg border bg-white px-3 py-2 text-slate-900 text-sm transition-colors',
						'placeholder:text-slate-400',
						'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
						'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
						'[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
						error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300',
						prefix && 'pl-8',
						suffix && 'pr-12',
						className,
					)}
				/>
				{suffix && (
					<span className="pointer-events-none absolute right-3 select-none text-slate-500 text-sm">
						{suffix}
					</span>
				)}
			</div>
			{error && <p className="text-red-600 text-xs">{error}</p>}
			{helper && !error && <p className="text-slate-500 text-xs">{helper}</p>}
		</div>
	)
}
