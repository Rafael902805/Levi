import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // Ideally user should provide key in a real app, assuming env or pre-config here
    // For this demo, we assume the environment variable or a safe fallback logic exists
    // The prompt guidelines say process.env.API_KEY is available.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const GeminiService = {
    generateExpirationMessage: async (clientName: string, daysLeft: number, paymentLink: string): Promise<string> => {
        try {
            const ai = getClient();
            const prompt = `
                Crie uma mensagem curta, profissional e amigável para WhatsApp.
                Objetivo: Avisar o cliente ${clientName} que sua assinatura expira em ${daysLeft} dias.
                Ação: Pedir para renovar clicando no link: ${paymentLink}.
                Tom: Educado, urgente mas sem ser agressivo. Use emojis.
                Retorne apenas o texto da mensagem.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            return response.text || "Olá! Sua assinatura está vencendo. Por favor entre em contato.";
        } catch (error) {
            console.error("Gemini Error:", error);
            return `Olá ${clientName}, sua assinatura vence em ${daysLeft} dias. Acesse: ${paymentLink}`;
        }
    },

    analyzeAppDescription: async (appName: string): Promise<string> => {
        try {
            const ai = getClient();
            const prompt = `Escreva uma descrição curta (máximo 20 palavras) e atraente em Português para um aplicativo Android chamado "${appName}". Foco em entretenimento ou utilidade.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            return response.text || "Aplicativo de entretenimento.";
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Descrição indisponível no momento.";
        }
    }
};
