import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiResponse(apiKey: string, prompt: string, context?: string, modelName: string = "gemini-1.5-flash") {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const fullPrompt = context 
    ? `Contesto delle note: ${context}\n\nDomanda/Richiesta: ${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

export async function optimizeText(apiKey: string, text: string, modelName: string = "gemini-1.5-flash") {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Rielabora il seguente testo Markdown in modo che sia più professionale, chiaro e ben formattato per un diario di sviluppo. Mantieni il significato originale e i blocchi di codice se presenti:\n\n${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
