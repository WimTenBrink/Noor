



import { GoogleGenAI } from "@google/genai";
import { LogEntry, LogLevel } from '../types';

export const generateImage = async (
    apiKey: string,
    prompt: string,
    model: string,
    log: (entry: Omit<LogEntry, 'timestamp'>) => void,
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '4:3'
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is required.");
    }
    // Explicitly use the provided user API key for the client
    const ai = new GoogleGenAI({ apiKey });
    
    const requestPayload = {
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    };

    log({
        level: LogLevel.IMAGEN,
        source: 'Imagen',
        header: `Request to ${model}`,
        details: { request: requestPayload }
    });

    try {
        const response = await ai.models.generateImages(requestPayload);

        log({
            level: LogLevel.IMAGEN,
            source: 'Imagen',
            header: `Response from ${model}`,
            details: { response: response }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen API did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error: any) {
        log({
            level: LogLevel.ERROR,
            source: 'Imagen',
            header: `Error from Imagen API`,
            details: { error: error.message, stack: error.stack }
        });
        throw error;
    }
};
