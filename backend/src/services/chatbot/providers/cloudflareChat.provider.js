import {
  CHATBOT_SYSTEM_PROMPT
} from "../../../prompts/chatbot/provider.prompt.js";

export async function generateCloudflareChatReply(
  conversationHistory
) {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID;

  const apiToken =
    process.env.CLOUDFLARE_API_TOKEN;

  const model =
    process.env.CLOUDFLARE_MODEL;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              CHATBOT_SYSTEM_PROMPT
          },

          ...conversationHistory
        ],

        temperature: Number(
          process.env.CHAT_TEMPERATURE || 0.7
        ),

        max_tokens: Number(
          process.env.MAX_RESPONSE_TOKENS || 1024
        )
      })
    }
  );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.errors?.[0]?.message ||
        `Cloudflare request failed with status ${response.status}`
    );
  }

  const reply =
    data.result?.response?.trim();

  if (!reply) {
    throw new Error(
      "Cloudflare returned an empty response"
    );
  }

  return {
    reply,
    provider: "cloudflare",
    model
  };
}