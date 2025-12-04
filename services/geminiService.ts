import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION_SAMN } from "../constants";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return aiInstance;
};

// Chat Session
let chatSession: Chat | null = null;

export const initChatSession = async (): Promise<Chat> => {
  const ai = getAI();
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SAMN,
      temperature: 0.7,
    }
  });
  return chatSession;
};

export const sendMessageToSamn = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initChatSession();
  }
  
  if (!chatSession) throw new Error("Failed to initialize chat");

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I apologize, I'm having trouble processing that right now.";
  } catch (error) {
    console.error("SAMN AI Error:", error);
    return "Something went wrong. Please check your internet connection or try again.";
  }
};

export const generateToolContent = async (
  toolName: string, 
  inputs: Record<string, string>, 
  attachmentBase64?: string, 
  shouldGenerateImage?: boolean
): Promise<string> => {
  const ai = getAI();
  
  // Decide model based on task
  // Use gemini-2.5-flash-image for image generation or if we are analyzing an image
  const modelName = (shouldGenerateImage || attachmentBase64) 
    ? 'gemini-2.5-flash-image' 
    : 'gemini-2.5-flash';

  let promptText = `
    ACT AS THE ${toolName.toUpperCase()} MODULE FOR SAMONYA AI BUSINESS BUILDER.
    
    USER INPUTS:
    ${Object.entries(inputs).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

    INSTRUCTIONS:
    - Generate business-ready, professional output.
    - Format with Markdown (Headers, Bullet points, Bold text).
    - Do NOT output code blocks unless specifically requested.
    - Be creative and specific to the Kenyan/African market if applicable based on inputs.
    - Structure the response clearly.
  `;

  if (attachmentBase64) {
    promptText += "\n\nNOTE: The user has attached an image (e.g., an existing logo). Use it for context, refinement, or inspiration as requested.";
  }

  if (shouldGenerateImage) {
    promptText += "\n\nCRITICAL: You MUST generate a high-quality visual image based on the requirements. Return the image in the response.";
  }

  const parts: Part[] = [{ text: promptText }];

  // Add image attachment if present
  if (attachmentBase64) {
    // Strip header "data:image/png;base64," if present to get raw base64
    const base64Data = attachmentBase64.split(',')[1];
    const mimeType = attachmentBase64.split(';')[0].split(':')[1] || 'image/png';
    
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: "You are a specialized business content generator for Samonya AIMS Market.",
        temperature: 0.8,
        // If generating an image, we can specify aspect ratio, but default 1:1 is good for logos
        imageConfig: shouldGenerateImage ? { aspectRatio: "1:1" } : undefined
      }
    });

    let finalText = "";
    
    // Process response parts to find text and images
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          finalText += part.text + "\n";
        }
        if (part.inlineData) {
          const mime = part.inlineData.mimeType || 'image/png';
          const data = part.inlineData.data;
          // Append a special marker for the frontend to render the image
          finalText += `\nIMAGE_BASE64:data:${mime};base64,${data}\n`;
        }
      }
    } else if (response.text) {
      finalText = response.text;
    }

    return finalText || "No content generated.";

  } catch (error) {
    console.error("Tool Generation Error:", error);
    return "Error generating content. Please try again. If uploading an image, ensure it is a valid format.";
  }
};