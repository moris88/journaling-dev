import { useJournalStore } from '../store/useJournalStore'
import en from '../locales/en.json'
import it from '../locales/it.json'

const translations = { en, it }

export function useTranslation() {
  const language = useJournalStore((state) => state.language)
  const setLanguage = useJournalStore((state) => state.setLanguage)

  const t = (path: string, variables?: Record<string, string>) => {
    const keys = path.split('.')
    let current: any = translations[language]

    for (const key of keys) {
      if (current[key] === undefined) {
        return path
      }
      current = current[key]
    }

    if (typeof current !== 'string') {
      return path
    }

    let result = current
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(`{${key}}`, value)
      })
    }

    return result
  }

  return { t, language, setLanguage }
}
