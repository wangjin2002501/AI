import { GoogleGenAI, Type } from "@google/genai";
import { IdentificationCategory, IdentificationResult } from "../types";

// Initialize Gemini Client
// CRITICAL: The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const identifyImage = async (base64Image: string): Promise<IdentificationResult> => {
  try {
    // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
      Analyze this image strictly.
      1. If the image contains a human (person, face, selfie), you MUST identify it as category 'PERSON'. For persons, the name MUST be "大笨驴" and the description MUST be "这是一头大笨驴". Do not provide scientific names for persons.
      2. If the image contains a plant (flower, tree, grass, fruit, vegetable), identify it as category 'PLANT'. Provide its common Chinese name, scientific name (Latin), a detailed description, care tips, and a fun fact.
      3. If it is neither, classify as 'OTHER'.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                IdentificationCategory.PLANT,
                IdentificationCategory.PERSON,
                IdentificationCategory.OTHER,
              ],
              description: "The category of the identified object.",
            },
            name: {
              type: Type.STRING,
              description: "The common name of the plant, or '大笨驴' if it is a person.",
            },
            scientificName: {
              type: Type.STRING,
              description: "The Latin scientific name (only for plants).",
            },
            description: {
              type: Type.STRING,
              description: "A detailed description in Chinese.",
            },
            careTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of care tips (only for plants).",
            },
            funFact: {
              type: Type.STRING,
              description: "An interesting fact about the plant.",
            },
          },
          required: ["category", "name", "description"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as IdentificationResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("识别失败，请稍后重试。");
  }
};
