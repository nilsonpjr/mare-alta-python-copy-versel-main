import { GoogleGenAI } from "@google/genai";

// Safe access to process.env to prevent ReferenceError in browser environments without polyfills
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  async analyzeProblem(boatModel: string, engineModel: string, description: string): Promise<string> {
    if (!apiKey) {
      return "Configuração de API Key ausente. Não é possível realizar análise IA.";
    }

    try {
      const prompt = `
        Atue como um técnico especialista sênior certificado pela Mercury Marine.
        Analise o seguinte problema relatado para criar um pré-diagnóstico.
        
        Embarcação: ${boatModel}
        Motor: ${engineModel}
        Relato do Cliente: "${description}"
        
        Por favor, forneça:
        1. Possíveis causas (liste as 3 mais prováveis).
        2. Peças que provavelmente precisarão ser verificadas ou trocadas.
        3. Ações recomendadas para o técnico.
        
        Responda em formato HTML simples (sem tags html/body, apenas p, ul, li, strong) em Português do Brasil.
        Mantenha o tom profissional e técnico.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Não foi possível gerar uma análise.";
    } catch (error) {
      console.error("Erro na análise IA:", error);
      return "Erro ao conectar com o serviço de IA. Verifique sua conexão.";
    }
  },

  async optimizeRoute(locations: string[]): Promise<string> {
    if (!apiKey) {
      return "Sem API Key para otimização.";
    }
    
    try {
      const prompt = `
        Atue como um gerente de logística. Eu tenho uma equipe técnica que precisa visitar as seguintes marinas/locais hoje:
        ${locations.join(', ')}.
        
        Considerando que a saída é de Paranaguá (Centro), sugira a ordem de visita mais lógica para economizar tempo e combustível.
        Responda apenas com a lista ordenada numerada e uma breve justificativa de 1 linha.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Erro na otimização.";
    } catch (error) {
      return "Erro de conexão IA.";
    }
  }
};