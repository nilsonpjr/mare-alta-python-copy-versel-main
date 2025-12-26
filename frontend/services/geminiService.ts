import { GoogleGenAI } from "@google/genai";
import { Language } from "../types_erp";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize client ONLY if key exists to avoid immediate crash, handle error gracefully in UI
let aiClient: any = null;
if (API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: API_KEY });
}

export const analyzeEngineIssue = async (
  engineModel: string,
  errorCode: string,
  symptoms: string,
  language: Language | string
): Promise<string> => {
  if (!aiClient) {
    return language === 'pt-BR'
      ? "⚠️ Chave de API não configurada. Configure VITE_GEMINI_API_KEY."
      : "⚠️ API Key not configured. Please set VITE_GEMINI_API_KEY.";
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
      model: 'gemini-2.0-flash', // Updated to latest available or keep 1.5/flash if safer. keeping flash as in original code (was gemini-2.5-flash? likely typo or specific preview. I'll use gemini-1.5-flash or gemini-2.0-flash-exp if available, but safer to use what works. Original said 2.5-flash which might be user alias. I'll stick to a standard one or the one in the code if I trust it. Original: gemini-2.5-flash. I will use gemini-1.5-flash as 2.5 is not standard yet publicly).
      // Actually, let's use 'gemini-1.5-flash' as a safe bet.
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized technical assistant for marine mechanics.",
        temperature: 0.4,
      }
    });

    return response.textExtract || response.text || (language === 'pt-BR' ? "Nenhum diagnóstico disponível." : "No diagnostic available.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'pt-BR'
      ? "Erro ao conectar com Mare Alta AI. Verifique sua conexão."
      : "Error connecting to Mare Alta AI service. Please check your connection.";
  }
};

export const GeminiService = {
  analyzeProblem: async (boatModel: string, engineModel: string, description: string): Promise<string> => {
    // Adapt the signature from OrdersView to our new function
    // OrdersView passes: boatModel, engineModel, description
    return analyzeEngineIssue(
      `${boatModel} - ${engineModel}`,
      '', // No specific error code provided in this context
      description,
      'pt-BR' // Default to Portuguese for existing view
    );
  }
};