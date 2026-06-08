import { cn } from '@/utils/cn'

export interface SelectOption {
	value: string
	label: string
}

export interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	error?: string
	options: SelectOption[]
	placeholder?: string
}

export function Select({
	label,
	error,
	options,
	placeholder,
	className,
	id,
	...props
}: SelectProps) {
	const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label
					className="font-medium text-slate-700 text-sm"
					htmlFor={selectId}
				>
					{label}
				</label>
			)}
			<select
				id={selectId}
				className={cn(
					'w-full appearance-none rounded-lg border bg-white px-3 py-2 text-slate-900 text-sm transition-colors',
					'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
					'disabled:cursor-not-allowed disabled:bg-slate-100',
					error ? 'border-red-500' : 'border-slate-300',
					className,
				)}
				{...props}
			>
				{placeholder && (
					<option disabled value="">
						{placeholder}
					</option>
				)}
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			{error && <p className="text-red-600 text-xs">{error}</p>}
		</div>
	)
}
