import { Layout } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from './ui/Button'

interface EmptyStateProps {
	language: 'it' | 'en'
	onNewEntry: () => void
}

export function EmptyState({ language, onNewEntry }: EmptyStateProps) {
	const { t } = useTranslation()

	const quotes = {
		it: [
			'Scrivere è un modo per fermare il tempo e osservare la propria vita.',
			'Il journaling è il dialogo più sincero che puoi avere con te stesso.',
			'Ogni parola scritta è un piccolo passo verso una maggiore consapevolezza.',
			'Non scrivere per essere letto, scrivi per essere capito da te stesso.',
			'Le pagine bianche sono il posto migliore dove gettare i propri dubbi.',
			'Scrivere trasforma il caos dei pensieri in ordine nelle idee.',
			'Il diario è il custode fedele della tua evoluzione personale.',
			'Fai pace con il tuo passato lasciandolo scorrere sulla carta.',
			'Ciò che viene scritto viene visto, e ciò che viene visto può essere compreso.',
			'Il journaling non è solo memoria, è la cura di sé in forma scritta.',
		],
		en: [
			'Writing is a way to stop time and observe your own life.',
			'Journaling is the most honest dialogue you can have with yourself.',
			'Every written word is a small step towards greater awareness.',
			"Don't write to be read; write to be understood by yourself.",
			'Blank pages are the best place to cast away your doubts.',
			'Writing transforms the chaos of thoughts into order in ideas.',
			'The journal is the faithful keeper of your personal evolution.',
			'Make peace with your past by letting it flow onto paper.',
			'What is written is seen, and what is seen can be understood.',
			'Journaling is not just memory; it is self-care in written form.',
		],
	}

	const quote = quotes[language][Math.floor(Math.random() * 10)]

	return (
		<div className="flex h-full flex-col items-center justify-center space-y-4 px-8 text-center text-slate-400">
			<Layout className="h-16 w-16 opacity-20" />
			<p className="text-lg text-slate-500 italic">"{quote}"</p>
			<Button onClick={onNewEntry}>{t('sidebar.new_entry')}</Button>
		</div>
	)
}
