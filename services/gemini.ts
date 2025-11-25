import { IdentificationResult } from "../types";

// NOTE: We no longer import GoogleGenAI here. 
// The actual AI call happens on the server (api/identify.ts) to avoid CORS and firewall issues.

export const identifyImage = async (base64Image: string): Promise<IdentificationResult> => {
  try {
    // Call our own serverless function
    const response = await fetch('/api/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Server request failed');
    }

    const result = await response.json() as IdentificationResult;
    return result;

  } catch (error) {
    console.error("API Error:", error);
    throw new Error("识别失败，请检查网络或稍后重试。");
  }
};