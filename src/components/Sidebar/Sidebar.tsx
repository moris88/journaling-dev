import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	format,
	isSameDay,
	startOfMonth,
	subMonths,
} from 'date-fns'
import { enUS, it } from 'date-fns/locale'
import {
	ChevronLeft,
	ChevronRight,
	History,
	Plus,
	RefreshCw,
	Settings2,
	Sun,
	Terminal,
	Trash,
	Trash2,
	X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useJournalStore } from '@/store/useJournalStore'
import { cn } from '@/utils'
import { Button } from '../ui/Button'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
	onNewEntry: () => void
	onSettingsClick: () => void
}

export function Sidebar({
	isOpen,
	onClose,
	onNewEntry,
	onSettingsClick,
}: SidebarProps) {
	const {
		entries,
		currentEntryId,
		setCurrentEntryId,
		deleteEntry,
		deletedEntries,
		restoreEntry,
		permanentlyDeleteEntry,
		language,
	} = useJournalStore()

	const { t } = useTranslation()
	const dateLocale = language === 'it' ? it : enUS

	const [isTrashOpen, setIsTrashOpen] = useState(false)
	const [viewDate, setViewDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState<string | null>(
		format(new Date(), 'yyyy-MM-dd'),
	)

	const monthStart = startOfMonth(viewDate)
	const monthEnd = endOfMonth(monthStart)
	const calendarDays = eachDayOfInterval({
		start: monthStart,
		end: monthEnd,
	})

	const handleDateClick = (dateStr: string) => {
		setSelectedDate(dateStr)
		const entry = entries.find((e) => e.date === dateStr)
		if (entry) {
			setCurrentEntryId(entry.id)
		}
	}

	return (
		<aside
			className={cn(
				'fixed inset-y-0 left-0 z-50 w-72 border-slate-200 border-r bg-white transition-transform duration-300 lg:relative lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
				!isOpen && '-translate-x-full lg:-ml-72',
			)}
		>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-slate-100 border-b p-4">
					<div className="flex items-center gap-2 font-bold text-blue-600 text-lg">
						<Terminal className="h-6 w-6" />
						<span>DevJournal</span>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onClose}
						className="lg:hidden"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="p-4">
					<Button className="w-full justify-start gap-2" onClick={onNewEntry}>
						<Plus className="h-4 w-4" />
						{t('sidebar.new_entry')}
					</Button>
				</div>

				<nav className="flex-1 space-y-4 overflow-y-auto p-4">
					{/* Calendar Widget */}
					<div className="space-y-2">
						<div className="flex items-center justify-between px-1">
							<span className="font-semibold text-slate-400 text-xs uppercase">
								{t('sidebar.calendar')}
							</span>
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => setViewDate(new Date())}
								>
									<Sun className="h-3 w-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => setViewDate(subMonths(viewDate, 1))}
								>
									<ChevronLeft className="h-3 w-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => setViewDate(addMonths(viewDate, 1))}
								>
									<ChevronRight className="h-3 w-3" />
								</Button>
							</div>
						</div>
						<div className="mb-2 text-center font-medium text-sm">
							{format(viewDate, 'MMMM yyyy', { locale: dateLocale })}
						</div>
						<div className="grid grid-cols-7 gap-1 text-center font-medium text-[10px] text-slate-400">
							{(language === 'it'
								? ['D', 'L', 'M', 'M', 'G', 'V', 'S']
								: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
							).map((d, i) => (
								<div key={`${d}-${i}`}>{d}</div>
							))}
						</div>
						<div className="grid grid-cols-7 gap-1">
							{Array.from({ length: monthStart.getDay() }).map((_, i) => (
								<div key={`pad-${i}`} />
							))}
							{calendarDays.map((day) => {
								const dateStr = format(day, 'yyyy-MM-dd')
								const entry = entries.find((e) => e.date === dateStr)
								return (
									<button
										key={day.toISOString()}
										type="button"
										onClick={() => handleDateClick(dateStr)}
										className={cn(
											'relative flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all',
											isSameDay(day, new Date())
												? 'border border-blue-600 font-bold text-blue-600'
												: 'text-slate-600 hover:bg-slate-100',
											selectedDate === dateStr &&
												'bg-blue-600 font-bold text-white',
											entry &&
												selectedDate !== dateStr &&
												'bg-blue-50 font-bold text-blue-700',
										)}
									>
										{format(day, 'd')}
										{entry && (
											<div
												className={cn(
													'absolute bottom-1 h-1 w-1 rounded-full',
													selectedDate === dateStr ? 'bg-white' : 'bg-blue-600',
												)}
											/>
										)}
									</button>
								)
							})}
						</div>
					</div>

					{/* Entries List */}
					<div className="space-y-1">
						<div className="mb-2 flex items-center justify-between px-1">
							<div className="flex items-center gap-2">
								<History className="h-3 w-3 text-slate-400" />
								<span className="font-semibold text-slate-400 text-xs uppercase">
									{isTrashOpen
										? t('sidebar.trash')
										: selectedDate
											? format(new Date(selectedDate), 'dd MMM yyyy', {
													locale: dateLocale,
												})
											: t('common.recent')}
								</span>
							</div>
							{selectedDate && !isTrashOpen && (
								<button
									type="button"
									onClick={() => setSelectedDate(null)}
									className="text-[10px] text-blue-600 hover:underline"
								>
									{t('common.all')}
								</button>
							)}
							{isTrashOpen && (
								<button
									type="button"
									onClick={() => setIsTrashOpen(false)}
									className="text-[10px] text-blue-600 hover:underline"
								>
									{t('common.back')}
								</button>
							)}
						</div>
						{!isTrashOpen ? (
							(selectedDate
								? entries.filter((e) => e.date === selectedDate)
								: entries.slice(0, 10)
							).map((entry) => (
								<div
									key={entry.id}
									className={cn(
										'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
										currentEntryId === entry.id
											? 'bg-blue-600 text-white'
											: 'text-slate-600 hover:bg-slate-100',
									)}
								>
									<button
										type="button"
										onClick={() => {
											setCurrentEntryId(entry.id)
											setIsTrashOpen(false)
										}}
										className="flex flex-1 items-center justify-between truncate text-left"
									>
										<span className="truncate">{entry.title}</span>
										{entry.mood && (
											<span className="ml-2 shrink-0">{entry.mood}</span>
										)}
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation()
											deleteEntry(entry.id)
										}}
										className={cn(
											'ml-2 shrink-0 p-1 opacity-0 transition-opacity group-hover:opacity-100',
											currentEntryId === entry.id
												? 'text-white hover:text-red-200'
												: 'text-slate-400 hover:text-red-500',
										)}
										title={t('common.delete')}
									>
										<Trash2 className="h-3 w-3" />
									</button>
								</div>
							))
						) : (
							<div className="space-y-1">
								{deletedEntries.map((entry) => (
									<div
										key={entry.id}
										className="group flex items-center justify-between rounded-lg px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-100"
									>
										<span className="truncate">{entry.title}</span>
										<div className="flex shrink-0 gap-1">
											<button
												type="button"
												onClick={() => restoreEntry(entry.id)}
												className="p-1 text-slate-400 hover:text-blue-500"
												title={t('editor.restore')}
											>
												<RefreshCw className="h-3 w-3" />
											</button>
											<button
												type="button"
												onClick={() => permanentlyDeleteEntry(entry.id)}
												className="p-1 text-slate-400 hover:text-red-500"
												title={t('editor.permanent_delete')}
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</nav>

				<div className="border-slate-100 border-t p-4">
					<Button
						variant="ghost"
						className="w-full justify-start gap-2 text-slate-500 text-sm"
						onClick={() => setIsTrashOpen(true)}
					>
						<Trash className="h-4 w-4" />
						{t('sidebar.trash')}
					</Button>
					<Button
						variant="ghost"
						className="w-full justify-start gap-2 text-slate-500 text-sm"
						onClick={onSettingsClick}
					>
						<Settings2 className="h-4 w-4" />
						{t('settings.title')}
					</Button>
				</div>
			</div>
		</aside>
	)
}
