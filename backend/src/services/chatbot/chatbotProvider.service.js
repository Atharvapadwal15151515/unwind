import {
  generateGroqChatReply
} from "./providers/groqChat.provider.js";

import {
  generateGeminiChatReply
} from "./providers/geminiChat.provider.js";

import {
  generateCloudflareChatReply
} from "./providers/cloudflareChat.provider.js";

const providerHandlers = {
  groq: async (conversationHistory) =>
    generateGroqChatReply(
      conversationHistory,
      process.env.GROQ_CHAT_MODEL
    ),

  groq_fast: async (conversationHistory) =>
    generateGroqChatReply(
      conversationHistory,
      process.env.GROQ_FAST_MODEL
    ),

  gemini: async (conversationHistory) =>
    generateGeminiChatReply(
      conversationHistory
    ),

  cloudflare: async (conversationHistory) =>
    generateCloudflareChatReply(
      conversationHistory
    )
};

export async function generateProviderReply(
  conversationHistory
) {
  if (
    !Array.isArray(conversationHistory) ||
    conversationHistory.length === 0
  ) {
    throw new Error(
      "Conversation history is required"
    );
  }

  const fallbackEnabled =
    process.env.ENABLE_AI_FALLBACK === "true";

  const fallbackOrder = (
    process.env.AI_FALLBACK_ORDER ||
    "groq,groq_fast,cloudflare,gemini"
  )
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  const providersToTry =
    fallbackEnabled
      ? fallbackOrder
      : [
          process.env.AI_PROVIDER ||
            "groq"
        ];

  const providerErrors = [];

  for (const providerName of providersToTry) {
    const providerHandler =
      providerHandlers[providerName];

    if (!providerHandler) {
      providerErrors.push({
        provider: providerName,
        error: "Unknown provider"
      });

      continue;
    }

    try {
      return await providerHandler(
        conversationHistory
      );
    } catch (error) {
      console.error(
        `${providerName} chatbot error:`,
        error.message
      );

      providerErrors.push({
        provider: providerName,
        error: error.message
      });
    }
  }

  const error = new Error(
    "All AI providers failed"
  );

  error.providerErrors =
    providerErrors;

  throw error;
}