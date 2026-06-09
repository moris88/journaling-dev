import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider } from '../types'

export async function getAIResponse(
	provider: AIProvider,
	apiKey: string,
	modelName: string,
	prompt: string,
	context?: string,
) {
	const fullPrompt = context
		? `Contesto delle note: ${context}\n\nDomanda/Richiesta: ${prompt}`
		: prompt

	switch (provider) {
		case 'gemini':
			return getGeminiResponse(apiKey, modelName, fullPrompt)
		case 'openai':
			return getOpenAIResponse(apiKey, modelName, fullPrompt)
		case 'anthropic':
			return getAnthropicResponse(apiKey, modelName, fullPrompt)
		default:
			throw new Error(`Provider ${provider} non supportato`)
	}
}

export async function optimizeText(
	provider: AIProvider,
	apiKey: string,
	modelName: string,
	text: string,
) {
	const prompt = `Ti devi impersonare come un Autore biografo, rielabora il seguente testo in modo che sia più professionale, chiaro e ben formattato per un diario personale, modifica tutto se non è già fatto in formattazione markdown, mantieni il significato originale e i blocchi di codice se presenti, inserisci solamente le modifiche necessarie, senza stravolgere il testo originale, non inserire commenti e non fare il resoconto finale delle modifiche:\n\n${text}`

	switch (provider) {
		case 'gemini':
			return getGeminiResponse(apiKey, modelName, prompt)
		case 'openai':
			return getOpenAIResponse(apiKey, modelName, prompt)
		case 'anthropic':
			return getAnthropicResponse(apiKey, modelName, prompt)
		default:
			throw new Error(`Provider ${provider} non supportato`)
	}
}

async function getGeminiResponse(
	apiKey: string,
	modelName: string,
	prompt: string,
) {
	const genAI = new GoogleGenerativeAI(apiKey)
	const model = genAI.getGenerativeModel({ model: modelName })
	const result = await model.generateContent(prompt)
	const response = await result.response
	return response.text()
}

async function getOpenAIResponse(
	apiKey: string,
	modelName: string,
	prompt: string,
) {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: modelName,
			messages: [{ role: 'user', content: prompt }],
		}),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.error?.message || 'Errore OpenAI')
	}

	const data = await response.json()
	return data.choices[0].message.content
}

async function getAnthropicResponse(
	apiKey: string,
	modelName: string,
	prompt: string,
) {
	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
			'dangerously-allow-browser': 'true', // In a production app, this should be handled server-side
		},
		body: JSON.stringify({
			model: modelName,
			max_tokens: 4096,
			messages: [{ role: 'user', content: prompt }],
		}),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.error?.message || 'Errore Anthropic')
	}

	const data = await response.json()
	return data.content[0].text
}
