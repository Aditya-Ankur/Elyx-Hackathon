import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function explainMessage(
  conversationData,
  targetMessage,
  sender,
  context
) {
  try {
    console.log('=== EXPLAIN MESSAGE FUNCTION CALLED ===');
    console.log('Target message:', targetMessage);
    console.log('Sender:', sender);
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    const prompt = `
You are an AI assistant helping to explain healthcare communication messages. 

CONTEXT: Below is the full conversation timeline from Elyx Healthcare with their client Rohan Patel:

${conversationData}

SPECIFIC MESSAGE TO EXPLAIN:
Sender: ${sender}
Message: "${targetMessage}"

Please provide a clear, concise explanation of what this specific message means in the context of the healthcare journey. Keep it under 150 words. Use previous messages to draw conclusion as a basis for your explanation.
`;

    console.log('Sending request to Gemini...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    
    console.log('Explanation generated successfully');
    return text;
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
}

export { explainMessage };
export default explainMessage;