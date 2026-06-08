import type React from 'react'

interface TooltipProps {
	content: string
	placement?: 'top' | 'bottom' | 'left' | 'right'
	children: React.ReactNode
}

const placements: Record<string, string> = {
	top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
	bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
	left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
	right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export function Tooltip({
	content,
	placement = 'top',
	children,
}: TooltipProps) {
	return (
		<div className="group/tooltip relative inline-flex">
			{children}
			<span
				className={`pointer-events-none absolute z-50 whitespace-nowrap rounded bg-gray-800 px-2 py-1 font-normal text-white text-xs opacity-0 shadow transition-opacity group-hover/tooltip:opacity-100 dark:bg-gray-700 ${placements[placement]}`}
				role="tooltip"
			>
				{content}
			</span>
		</div>
	)
}
