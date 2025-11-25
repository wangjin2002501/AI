import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image } = request.body;

    if (!image) {
      return response.status(400).json({ error: 'Image data is required' });
    }

    if (!process.env.API_KEY) {
      return response.status(500).json({ error: 'Server configuration error: API_KEY is missing' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const MODEL_NAME = "gemini-2.5-flash";

    // Clean base64 string if needed
    const base64Data = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image;

    const prompt = `
      Analyze this image strictly.
      1. If the image contains a human (person, face, selfie), you MUST identify it as category 'PERSON'. For persons, the name MUST be "大笨驴" and the description MUST be "这是一头大笨驴". Do not provide scientific names for persons.
      2. If the image contains a plant (flower, tree, grass, fruit, vegetable), identify it as category 'PLANT'. Provide its common Chinese name, scientific name (Latin), a detailed description, care tips, and a fun fact.
      3. If it is neither, classify as 'OTHER'.
    `;

    const result = await ai.models.generateContent({
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
              enum: ['PLANT', 'PERSON', 'OTHER'],
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

    if (!result.text) {
      throw new Error("No response text from AI");
    }

    const parsedResult = JSON.parse(result.text);
    return response.status(200).json(parsedResult);

  } catch (error) {
    console.error("Server API Error:", error);
    return response.status(500).json({ 
      error: 'Identification failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}