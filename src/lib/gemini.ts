import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemInstruction } from './agents/prompts';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Export as a streaming generator
export async function* generateAgentResponseStream(agentId: string, message: string, history: any[] = [], mode: 'efficiency' | 'deep' = 'efficiency') {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    // Sanitize history
    const cleanHistory = history.length > 0 && history[0].role === 'model'
        ? history.slice(1)
        : history;

    // Helper to try streaming with a specific model
    const tryStream = async function* (modelName: string, retries = 1) {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: getSystemInstruction(agentId, mode),
            // @ts-ignore
            tools: [{ googleSearch: {} }],
        });

        const chat = model.startChat({
            history: cleanHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        });

        let attempt = 0;
        while (attempt <= retries) {
            try {
                const result = await chat.sendMessageStream(message);

                // Keep track if we actually got chunks to confirm success
                let hasChunks = false;

                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        hasChunks = true;
                        yield chunkText;
                    }
                }

                if (hasChunks) return; // Success

            } catch (error: any) {
                attempt++;
                console.error(`Gemini Stream (${modelName}) Error (Attempt ${attempt}):`, error.message);

                if (error.message?.includes('429')) throw error; // Immediate fallback on rate limit
                if (attempt > retries) throw error;

                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    };

    try {
        console.log('Stream: Starting generation with gemini-2.5-flash...');
        yield* tryStream('gemini-2.5-flash', 2);
    } catch (error: any) {
        console.warn('Primary model failed, attempting fallback to gemini-1.5-flash:', error.message);
        try {
            yield* tryStream('gemini-1.5-flash', 2);
        } catch (fallbackError: any) {
            console.error('All models failed:', fallbackError.message);
            throw fallbackError;
        }
    }
}
