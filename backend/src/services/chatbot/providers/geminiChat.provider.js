import { GoogleGenAI } from "@google/genai";

import {
  CHATBOT_SYSTEM_PROMPT
} from "../../../prompts/chatbot/provider.prompt.js";

const geminiClient =
  new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY
  });

export async function generateGeminiChatReply(
  conversationHistory
) {
  const contents =
    conversationHistory.map(
      (message) => ({
        role:
          message.role ===
          "assistant"
            ? "model"
            : "user",

        parts: [
          {
            text:
              message.content
          }
        ]
      })
    );

  const response =
    await geminiClient.models.generateContent({
      model:
        process.env.GEMINI_MODEL,

      contents,

      config: {
        systemInstruction:
          CHATBOT_SYSTEM_PROMPT,

        temperature: Number(
          process.env
            .CHAT_TEMPERATURE ||
            0.7
        ),

        maxOutputTokens: Number(
          process.env
            .MAX_RESPONSE_TOKENS ||
            1024
        )
      }
    });

  const reply =
    response.text?.trim();

  if (!reply) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  return {
    reply,
    provider: "gemini",
    model:
      process.env.GEMINI_MODEL
  };
}