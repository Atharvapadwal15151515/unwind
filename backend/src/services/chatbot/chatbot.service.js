import {
  findMatchingIntent
} from "./chatbotIntent.service.js";

import {
  generateProviderReply
} from "./chatbotProvider.service.js";

import {
  evaluateChatbotSafety
} from "./chatbotSafety.service.js";

import {
  getConversationContext
} from "./chatbotMessage.service.js";

import {
  CHATBOT_CRISIS_RESPONSE_TEMPLATE
} from "../../prompts/chatbot/crisis.prompt.js";

/*
|--------------------------------------------------------------------------
| Chatbot Fallback Response
|--------------------------------------------------------------------------
*/

const CHATBOT_FALLBACK_RESPONSE =
  "I’m having trouble responding properly right now. Please try again in a moment 🌿";

/*
|--------------------------------------------------------------------------
| Build Base Response
|--------------------------------------------------------------------------
*/

function buildChatbotResponse({
  reply,
  intent = "unknown",
  matchedPattern = null,
  matchScore = null,
  source,
  provider = null,
  model = null,
  safetyLevel = "safe"
}) {
  return {
    reply,
    intent,
    matchedPattern,
    matchScore,
    source,
    provider,
    model,
    safetyLevel
  };
}

/*
|--------------------------------------------------------------------------
| Generate Chatbot Reply
|--------------------------------------------------------------------------
*/

export async function generateChatbotReply(
  userId,
  conversationId,
  message
) {
  const normalizedMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  if (!normalizedMessage) {
    throw new Error(
      "Chatbot message is required"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Safety Evaluation
  |--------------------------------------------------------------------------
  */

  const safetyResult =
    evaluateChatbotSafety(
      normalizedMessage
    );

  if (!safetyResult.safe) {
    return buildChatbotResponse({
      reply:
        CHATBOT_CRISIS_RESPONSE_TEMPLATE,

      intent: "crisis",

      matchedPattern:
        safetyResult.matchedKeyword,

      matchScore: 100,

      source: "safety",

      safetyLevel:
        safetyResult.level
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Predefined Response
  |--------------------------------------------------------------------------
  */

  const predefinedEnabled =
    process.env
      .ENABLE_PREDEFINED_RESPONSES !==
    "false";

  if (predefinedEnabled) {
    const matchedIntent =
      findMatchingIntent(
        normalizedMessage
      );

    if (matchedIntent) {
      return buildChatbotResponse({
        reply:
          matchedIntent.reply,

        intent:
          matchedIntent.intent,

        matchedPattern:
          matchedIntent.matchedPattern,

        matchScore:
          Number(
            matchedIntent.score.toFixed(2)
          ),

        source: "predefined",

        safetyLevel:
          safetyResult.level
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | AI Responses Disabled
  |--------------------------------------------------------------------------
  */

  const aiEnabled =
    process.env.ENABLE_AI_RESPONSES !==
    "false";

  if (!aiEnabled) {
    return buildChatbotResponse({
      reply:
        "I don’t have a predefined response for that yet. Please try one of the suggested messages 🌿",

      intent: "unknown",

      source: "fallback",

      safetyLevel:
        safetyResult.level
    });
  }

  /*
  |--------------------------------------------------------------------------
  | AI Provider Response
  |--------------------------------------------------------------------------
  */
/*
|--------------------------------------------------------------------------
| Conversation Context
|--------------------------------------------------------------------------
*/

const conversationHistory =
  await getConversationContext(
    userId,
    conversationId
  );

conversationHistory.push({
  role: "user",
  content: normalizedMessage
});
  try {
    const aiResponse =
  await generateProviderReply(
    conversationHistory
  );

    return buildChatbotResponse({
      reply:
        aiResponse.reply,

      intent: "unknown",

      source: "ai",

      provider:
        aiResponse.provider,

      model:
        aiResponse.model,

      safetyLevel:
        safetyResult.level
    });
  } catch (error) {
    console.error(
      "All chatbot providers failed:",
      error.message
    );

    if (
      Array.isArray(
        error.providerErrors
      )
    ) {
      for (
        const providerError
        of error.providerErrors
      ) {
        console.error(
          `[${providerError.provider}]`,
          providerError.error
        );
      }
    }

    return buildChatbotResponse({
      reply:
        CHATBOT_FALLBACK_RESPONSE,

      intent: "unknown",

      source: "fallback",

      safetyLevel:
        safetyResult.level
    });
  }
}