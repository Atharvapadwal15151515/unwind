import {
  CHATBOT_SYSTEM_PROMPT
} from "../../../prompts/chatbot/provider.prompt.js";

export async function createCloudflareChatStream(
  conversationHistory,
  signal
) {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID;

  const apiToken =
    process.env.CLOUDFLARE_API_TOKEN;

  const model =
    process.env.CLOUDFLARE_MODEL;

  if (signal?.aborted) {
    const abortError =
      new Error(
        "Cloudflare streaming request aborted"
      );

    abortError.name =
      "AbortError";

    throw abortError;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiToken}`,

        "Content-Type":
          "application/json"
      },

      signal,

      body: JSON.stringify({
        stream: true,

        messages: [
          {
            role: "system",
            content:
              CHATBOT_SYSTEM_PROMPT
          },

          ...conversationHistory
        ],

        temperature: Number(
          process.env.CHAT_TEMPERATURE ||
            0.7
        ),

        max_tokens: Number(
          process.env.MAX_RESPONSE_TOKENS ||
            1024
        )
      })
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Cloudflare stream request failed (${response.status}): ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Cloudflare returned an empty stream"
    );
  }

  async function* streamGenerator() {
    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    try {
      while (true) {
        if (signal?.aborted) {
          await reader.cancel();

          const abortError =
            new Error(
              "Cloudflare streaming request aborted"
            );

          abortError.name =
            "AbortError";

          throw abortError;
        }

        const {
          value,
          done
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true
          }
        );

        const lines =
          buffer.split("\n");

        buffer =
          lines.pop() || "";

        for (const line of lines) {
          if (signal?.aborted) {
            await reader.cancel();

            const abortError =
              new Error(
                "Cloudflare streaming request aborted"
              );

            abortError.name =
              "AbortError";

            throw abortError;
          }

          const trimmedLine =
            line.trim();

          if (
            !trimmedLine ||
            !trimmedLine.startsWith(
              "data:"
            )
          ) {
            continue;
          }

          const dataText =
            trimmedLine
              .slice(5)
              .trim();

          if (
            dataText === "[DONE]"
          ) {
            return;
          }

          try {
            const data =
              JSON.parse(dataText);

            const text =
              data.response ||
              data.result?.response ||
              data.choices?.[0]
                ?.delta?.content ||
              "";

            if (text) {
              yield text;
            }
          } catch {
            if (dataText) {
              yield dataText;
            }
          }
        }
      }

      const finalChunk =
        decoder.decode();

      if (finalChunk) {
        buffer += finalChunk;
      }

      if (
        buffer.trim() &&
        !signal?.aborted
      ) {
        const finalLine =
          buffer.trim();

        if (
          finalLine.startsWith(
            "data:"
          )
        ) {
          const dataText =
            finalLine
              .slice(5)
              .trim();

          if (
            dataText &&
            dataText !== "[DONE]"
          ) {
            try {
              const data =
                JSON.parse(dataText);

              const text =
                data.response ||
                data.result?.response ||
                data.choices?.[0]
                  ?.delta?.content ||
                "";

              if (text) {
                yield text;
              }
            } catch {
              yield dataText;
            }
          }
        }
      }
    } catch (error) {
      if (
        signal?.aborted ||
        error?.name === "AbortError"
      ) {
        const abortError =
          new Error(
            "Cloudflare streaming request aborted"
          );

        abortError.name =
          "AbortError";

        throw abortError;
      }

      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  return streamGenerator();
}