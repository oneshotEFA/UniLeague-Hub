import axios from "axios";
import { ai } from "../../../config/ai";

export function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
export async function withRetry(fn: () => Promise<any>, retries = 2) {
  let lastError = null;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (i < retries) {
        console.log("AI failed, retrying...");
        continue;
      }
    }
  }

  throw lastError;
}
export async function downloadImages(homeUrl: string, awayUrl: string) {
  try {
    const homeRes = await axios.get(homeUrl, { responseType: "arraybuffer" });
    const awayRes = await axios.get(awayUrl, { responseType: "arraybuffer" });
    console.log("images donwloaded");
    return {
      ok: true,
      homeBuffer: Buffer.from(homeRes.data),
      awayBuffer: Buffer.from(awayRes.data),
      homeMime: homeRes.headers["content-type"] || "image/jpeg",
      awayMime: awayRes.headers["content-type"] || "image/jpeg",
    };
  } catch (error) {
    console.log("download error:", error);
    return {
      ok: false,
    };
  }
}

export const aiApiCall = async (prompt: any) => {
  try {
    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: [prompt],
      });

      // Extract raw text in a resilient way to support different SDK response shapes.
      const raw: string =
        // SDK may return a top-level text field
        (response as any)?.text ||
        // Or candidates might be at the top level
        (response as any)?.candidates?.[0]?.content
          ?.map((c: any) => c.text)
          .join("") ||
        // Or candidates might be nested under responseId (older/alternate shape)
        (response as any)?.responseId?.candidates?.[0]?.content
          ?.map((c: any) => c.text)
          .join("") ||
        // Fallback to empty string
        "";

      if (!raw) {
        const reason =
          (response as any)?.candidates?.[0]?.finishReason ||
          (response as any)?.responseId?.candidates?.[0]?.finishReason;
        if (reason === "SAFETY") {
          throw new Error(
            "AI failed due to Safety Filters. Review prompt content."
          );
        }

        throw new Error(
          `AI returned an empty response. Finish Reason: ${reason || "Unknown"}`
        );
      }

      const json = safeJsonParse(raw);

      if (!json) {
        throw new Error("AI returned invalid JSON.");
      }
      return json;
    });
  } catch (error) {
    throw new Error(`AI API call failed: ${(error as Error).message}`);
  }
};
