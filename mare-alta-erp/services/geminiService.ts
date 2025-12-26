import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client ONLY if key exists to avoid immediate crash, handle error gracefully in UI
let aiClient: GoogleGenAI | null = null;
if (API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
}

export const analyzeEngineIssue = async (
    engineModel: string,
    errorCode: string,
    symptoms: string,
    language: Language
): Promise<string> => {
    if (!aiClient) {
        return language === 'pt-BR' 
            ? "⚠️ Chave de API não configurada. Configure process.env.API_KEY." 
            : "⚠️ API Key not configured. Please set process.env.API_KEY.";
    }

    try {
        const prompt = `
        You are 'Mare Alta AI', an expert marine mechanic specialist for Mercury and Yamaha engines.
        
        Context: A mechanic is reporting an issue.
        Engine: ${engineModel}
        Error Code: ${errorCode}
        Symptoms: ${symptoms}
        Language: ${language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}

        Task:
        1. Identify the likely cause based on the error code and symptoms.
        2. Provide a step-by-step diagnostic procedure.
        3. Suggest potential parts that might need replacement.
        4. Keep the tone professional, technical, but concise.
        5. **IMPORTANT:** Respond entirely in ${language === 'pt-BR' ? 'Portuguese (pt-BR)' : 'English'}.
        
        Format using Markdown.
        `;

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a specialized technical assistant for marine mechanics.",
                temperature: 0.4,
            }
        });

        return response.text || (language === 'pt-BR' ? "Nenhum diagnóstico disponível." : "No diagnostic available.");
    } catch (error) {
        console.error("Gemini Error:", error);
        return language === 'pt-BR'
            ? "Erro ao conectar com Mare Alta AI. Verifique sua conexão."
            : "Error connecting to Mare Alta AI service. Please check your connection.";
    }
};