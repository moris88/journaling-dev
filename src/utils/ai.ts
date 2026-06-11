import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, Language } from '../types'
import en from '../locales/en.json'
import it from '../locales/it.json'

const locales = { en, it }

export async function getAIResponse(
	provider: AIProvider,
	apiKey: string,
	modelName: string,
	prompt: string,
	language: Language,
	context?: string,
) {
	const t = locales[language].ai
	const fullPrompt = context
		? `${t.chat_context_prefix}: ${context}\n\n${t.chat_query_prefix}: ${prompt}`
		: prompt

	switch (provider) {
		case 'gemini':
			return getGeminiResponse(apiKey, modelName, fullPrompt)
		case 'openai':
			return getOpenAIResponse(apiKey, modelName, fullPrompt)
		case 'anthropic':
			return getAnthropicResponse(apiKey, modelName, fullPrompt)
		default:
			throw new Error(`Provider ${provider} not supported`)
	}
}

export async function optimizeText(
	provider: AIProvider,
	apiKey: string,
	modelName: string,
	text: string,
	language: Language,
) {
	const prompt = locales[language].ai.optimize_prompt.replace('{text}', text)

	switch (provider) {
		case 'gemini':
			return getGeminiResponse(apiKey, modelName, prompt)
		case 'openai':
			return getOpenAIResponse(apiKey, modelName, prompt)
		case 'anthropic':
			return getAnthropicResponse(apiKey, modelName, prompt)
		default:
			throw new Error(`Provider ${provider} not supported`)
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
