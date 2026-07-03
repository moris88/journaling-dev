export const HorizontalRuler = () => {
	return (
		<div className="flex h-6 items-end overflow-hidden border-slate-200 border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
			{Array.from({ length: 20 }).map((_, i) => (
				<div
					key={i}
					className="h-2 flex-1 border-slate-300 border-l dark:border-slate-700"
				/>
			))}
		</div>
	)
}

export const VerticalRuler = () => {
	return (
		<div className="flex w-6 flex-col overflow-hidden border-slate-200 border-r bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
			{Array.from({ length: 30 }).map((_, i) => (
				<div
					key={i}
					className="w-2 flex-1 border-slate-300 border-t dark:border-slate-700"
				/>
			))}
		</div>
	)
}
