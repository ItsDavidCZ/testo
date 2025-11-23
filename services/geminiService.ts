import { GoogleGenAI, Type } from "@google/genai";
import { ImageAnalysis } from '../types';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to retry operations on transient failures
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    // Retry on network/fetch errors or 503 Service Unavailable
    const msg = error.message?.toLowerCase() || "";
    const shouldRetry = msg.includes("fetch") || msg.includes("network") || msg.includes("503") || msg.includes("overloaded");
    
    if (shouldRetry) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const analyzeImageQuality = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<ImageAnalysis> => {
  try {
    const ai = getGeminiClient();
    
    // We will ask Gemini to output JSON directly using the responseSchema
    const prompt = `Analyze this image for technical quality suitable for a high-end social media portfolio. 
    Rate Sharpness, Lighting, and Composition on a scale of 1-10. 
    Provide 3 specific, actionable suggestions to improve the image (e.g., "Increase contrast", "Reduce noise in shadows"). 
    Assess its viral potential in one short sentence.`;

    const response = await retry(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                {
                    inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                    }
                },
                {
                    text: prompt
                }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sharpnessScore: { type: Type.NUMBER, description: "Score from 1-10" },
                    lightingScore: { type: Type.NUMBER, description: "Score from 1-10" },
                    compositionScore: { type: Type.NUMBER, description: "Score from 1-10" },
                    suggestions: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of 3 improvement suggestions"
                    },
                    viralPotential: { type: Type.STRING, description: "Short assessment of viral potential" }
                },
                required: ["sharpnessScore", "lightingScore", "compositionScore", "suggestions", "viralPotential"]
                }
            }
        });
    });

    if (response.text) {
      return JSON.parse(response.text) as ImageAnalysis;
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const enhanceImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<{ data: string, mimeType: string }> => {
    try {
        const ai = getGeminiClient();
        
        // Use gemini-2.5-flash-image for general image editing/generation tasks
        // Simplified prompt to avoid confusing the model with conflicting resolution requests
        const response = await retry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        },
                        {
                            text: "Enhance the clarity, sharpness, and lighting of this image. Remove noise and artifacts to make it look high-quality and professional. Return the processed image."
                        }
                    ]
                }
            });
        });

        // Find the image part in the response
        let enhancedImageData = null;
        let enhancedImageMime = 'image/png'; // Default expectation
        let textExplanation = "";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    enhancedImageData = part.inlineData.data;
                    if (part.inlineData.mimeType) {
                        enhancedImageMime = part.inlineData.mimeType;
                    }
                    break;
                }
                if (part.text) {
                    textExplanation += part.text;
                }
            }
        }

        if (!enhancedImageData) {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("The image enhancement was blocked by safety filters.");
            }
            
            // If the model returned text instead of an image, use that as the error message
            if (textExplanation) {
                 // Truncate if too long
                 const reason = textExplanation.length > 150 ? textExplanation.substring(0, 150) + "..." : textExplanation;
                 throw new Error(reason);
            }
            
            throw new Error("No enhanced image was generated by the model. Please try a different image.");
        }

        return { data: enhancedImageData, mimeType: enhancedImageMime };

    } catch (error) {
        console.error("Error enhancing image:", error);
        throw error;
    }
};