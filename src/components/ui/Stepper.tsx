import { CheckCircle } from 'iconoir-react'

import type { AppStep } from '@/types'
import { APP_STEPS } from '@/types'
import { cn } from '@/utils/cn'

interface StepperProps {
	activeStep: AppStep
	completedSteps: AppStep[]
	onStepChange: (step: AppStep) => void
}

export function Stepper({
	activeStep,
	completedSteps,
	onStepChange,
}: StepperProps) {
	const activeIndex = APP_STEPS.findIndex((s) => s.id === activeStep)

	return (
		<nav aria-label="Progresso" className="w-full">
			<ol className="flex items-center">
				{APP_STEPS.map((step, index) => {
					const isActive = step.id === activeStep
					const isCompleted = completedSteps.includes(step.id)
					const isClickable = isCompleted || index <= activeIndex
					const isLast = index === APP_STEPS.length - 1

					return (
						<li
							key={step.id}
							className={cn('flex items-center', !isLast && 'flex-1')}
						>
							<button
								type="button"
								onClick={() => isClickable && onStepChange(step.id)}
								disabled={!isClickable}
								aria-current={isActive ? 'step' : undefined}
								className={cn(
									'flex items-center gap-2 font-medium text-sm transition-colors',
									'disabled:cursor-not-allowed',
									isActive && 'text-blue-600',
									isCompleted &&
										!isActive &&
										'cursor-pointer text-green-600 hover:text-green-700',
									!isActive && !isCompleted && 'text-slate-400',
								)}
							>
								<span
									className={cn(
										'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold text-xs transition-colors',
										isActive && 'border-blue-600 bg-blue-600 text-white',
										isCompleted &&
											!isActive &&
											'border-green-500 bg-green-500 text-white',
										!isActive &&
											!isCompleted &&
											'border-slate-300 bg-white text-slate-400',
									)}
								>
									{isCompleted && !isActive ? (
										<CheckCircle className="h-4 w-4" />
									) : (
										index + 1
									)}
								</span>
								<span className="hidden whitespace-nowrap sm:block">
									{step.label}
								</span>
							</button>

							{!isLast && (
								<div
									className={cn(
										'mx-2 h-0.5 flex-1 rounded transition-colors',
										index < activeIndex ? 'bg-green-400' : 'bg-slate-200',
									)}
								/>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
