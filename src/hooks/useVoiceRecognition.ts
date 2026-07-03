import 'regenerator-runtime/runtime'
import { useSpeechRecognition } from 'react-speech-recognition'
import { useTranslation } from '../hooks/useTranslation'

export function useVoiceRecognition() {
	const { t } = useTranslation()
	const {
		transcript,
		listening,
		resetTranscript,
		browserSupportsSpeechRecognition,
	} = useSpeechRecognition()

	const start = () => {
		if (!browserSupportsSpeechRecognition) {
			alert(t('media.no_speech_support'))
			return
		}

		import('react-speech-recognition').then((module) => {
			module.default.startListening({
				language: t('media.audio_lang') || 'it-IT',
				continuous: true,
			})
		})
	}

	const stop = () => {
		import('react-speech-recognition').then((module) => {
			module.default.stopListening()
		})
	}

	const reset = () => {
		resetTranscript()
	}

	return {
		isRecording: listening,
		transcription: transcript,
		start,
		stop,
		reset,
	}
}
