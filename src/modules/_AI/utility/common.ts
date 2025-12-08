import axios from "axios";
import { ai } from "../../../config/ai";
import sharp from "sharp";
import { prisma } from "../../../config/db";

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
    const [homeRes, awayRes] = await Promise.all([
      axios.get(homeUrl, { responseType: "arraybuffer" }),
      axios.get(awayUrl, { responseType: "arraybuffer" }),
    ]);

    console.log("images downloaded");

    const homeRaw = Buffer.from(homeRes.data);
    const awayRaw = Buffer.from(awayRes.data);

    // 🔥 MUST compress — this is what speeds everything up
    const homeBuffer = await sharp(homeRaw)
      .resize(720)
      .jpeg({ quality: 80 })
      .toBuffer();

    const awayBuffer = await sharp(awayRaw)
      .resize(720)
      .jpeg({ quality: 80 })
      .toBuffer();
    console.log("images downloaded and compressed");
    return {
      ok: true,
      homeBuffer,
      awayBuffer,
      homeMime: "image/jpeg",
      awayMime: "image/jpeg",
    };
  } catch (error) {
    console.log("download/compress error:", error);
    return { ok: false };
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
export async function collectTeamStats(teamId: string) {
  // 1. Get last 5 matches involving this team
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      status: "finished",
    },
    orderBy: { scheduledDate: "desc" },
    take: 5,
  });

  if (matches.length === 0) return null;

  let stats = {
    goalsFor: 0,
    goalsAgainst: 0,
    yellow: 0,
    red: 0,
    cleanSheets: 0,
    last15Goals: 0,
    points: 0,
    gdList: [] as number[],
    streak: 0,
  };

  for (const match of matches) {
    const teamIsHome = match.homeTeamId === teamId;

    // goals
    const gf = teamIsHome ? match.homeScore : match.awayScore;
    const ga = teamIsHome ? match.awayScore : match.homeScore;

    stats.goalsFor += gf;
    stats.goalsAgainst += ga;
    stats.gdList.push(gf - ga);

    // points
    if (gf > ga) stats.points += 3;
    else if (gf === ga) stats.points += 1;

    // streak
    if (gf > ga) stats.streak += 1;
    else stats.streak = 0;

    // clean sheet
    if (ga === 0) stats.cleanSheets += 1;

    // events
    const events = await prisma.matchEvent.findMany({
      where: { matchId: match.id, eventTeamId: teamId },
    });

    for (const ev of events) {
      if (ev.eventType === "Goal" && ev.minute >= 75) {
        stats.last15Goals += 1;
      }
      if (ev.eventType === "Yellow") stats.yellow += 1;
      if (ev.eventType === "Red") stats.red += 1;
    }
  }

  return stats;
}
