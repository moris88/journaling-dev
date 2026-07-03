import {
	ChevronLeft,
	ChevronRight,
	Menu,
	Moon,
	Sparkles,
	Sun,
} from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '../ui/Button'

interface HeaderProps {
	onToggleSidebar: () => void
	onToggleTheme: () => void
	onToggleChat: () => void
	isChatOpen: boolean
	theme: 'light' | 'dark'
	title: string
	showNavigation?: boolean
	onPrev?: () => void
	onNext?: () => void
	canPrev?: boolean
	canNext?: boolean
}

export function Header({
	onToggleSidebar,
	onToggleTheme,
	onToggleChat,
	isChatOpen,
	theme,
	title,
	showNavigation,
	onPrev,
	onNext,
	canPrev,
	canNext,
}: HeaderProps) {
	return (
		<header className="flex h-14 shrink-0 items-center justify-between border-slate-200 border-b px-3 lg:h-16 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
			<div className="flex items-center gap-2 overflow-hidden lg:gap-4">
				<Button variant="ghost" size="icon" onClick={onToggleSidebar}>
					<Menu className="h-5 w-5" />
				</Button>
				{showNavigation && (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onPrev}
							disabled={!canPrev}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onNext}
							disabled={!canNext}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
				<h2 className="max-w-37.5 truncate font-semibold text-sm lg:max-w-none lg:text-lg">
					{title}
				</h2>
			</div>
			<div className="flex items-center gap-1 lg:gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onToggleTheme}
					className="text-slate-500 dark:text-slate-400"
				>
					{theme === 'dark' ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					)}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={onToggleChat}
					className={cn(
						'hidden lg:flex lg:border lg:border-slate-200 dark:border-slate-800',
						isChatOpen && 'bg-slate-100 dark:bg-slate-800',
					)}
				>
					<Sparkles className="h-4 w-4 text-blue-600 lg:mr-2" />
					<span className="hidden text-xs lg:inline dark:text-slate-400">
						Chat AI
					</span>
				</Button>
			</div>
		</header>
	)
}
