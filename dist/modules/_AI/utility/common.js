"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiApiCall = void 0;
exports.safeJsonParse = safeJsonParse;
exports.withRetry = withRetry;
exports.downloadImages = downloadImages;
exports.collectTeamStats = collectTeamStats;
const axios_1 = __importDefault(require("axios"));
const ai_config_1 = require("../../../config/ai.config");
const sharp_1 = __importDefault(require("sharp"));
const db_config_1 = require("../../../config/db.config");
function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
async function withRetry(fn, retries = 2) {
    let lastError = null;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err;
            if (i < retries) {
                console.log("AI failed, retrying...");
                continue;
            }
        }
    }
    throw lastError;
}
async function downloadImages(homeUrl, awayUrl) {
    try {
        const [homeRes, awayRes] = await Promise.all([
            axios_1.default.get(homeUrl, { responseType: "arraybuffer" }),
            axios_1.default.get(awayUrl, { responseType: "arraybuffer" }),
        ]);
        console.log("images downloaded");
        const homeRaw = Buffer.from(homeRes.data);
        const awayRaw = Buffer.from(awayRes.data);
        // 🔥 MUST compress — this is what speeds everything up
        const homeBuffer = await (0, sharp_1.default)(homeRaw)
            .resize(720)
            .jpeg({ quality: 80 })
            .toBuffer();
        const awayBuffer = await (0, sharp_1.default)(awayRaw)
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
    }
    catch (error) {
        console.log("download/compress error:", error);
        return { ok: false };
    }
}
const aiApiCall = async (prompt) => {
    try {
        return withRetry(async () => {
            const response = await ai_config_1.ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    responseMimeType: "application/json",
                },
                contents: [prompt],
            });
            // Extract raw text in a resilient way to support different SDK response shapes.
            const raw = 
            // SDK may return a top-level text field
            response?.text ||
                // Or candidates might be at the top level
                response?.candidates?.[0]?.content
                    ?.map((c) => c.text)
                    .join("") ||
                // Or candidates might be nested under responseId (older/alternate shape)
                response?.responseId?.candidates?.[0]?.content
                    ?.map((c) => c.text)
                    .join("") ||
                // Fallback to empty string
                "";
            if (!raw) {
                const reason = response?.candidates?.[0]?.finishReason ||
                    response?.responseId?.candidates?.[0]?.finishReason;
                if (reason === "SAFETY") {
                    throw new Error("AI failed due to Safety Filters. Review prompt content.");
                }
                throw new Error(`AI returned an empty response. Finish Reason: ${reason || "Unknown"}`);
            }
            const json = safeJsonParse(raw);
            if (!json) {
                throw new Error("AI returned invalid JSON.");
            }
            return json;
        });
    }
    catch (error) {
        throw new Error(`AI API call failed: ${error.message}`);
    }
};
exports.aiApiCall = aiApiCall;
async function collectTeamStats(teamId) {
    const matches = await db_config_1.prisma.match.findMany({
        where: {
            OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
            status: "FINISHED",
        },
        orderBy: { scheduledDate: "desc" },
        take: 5,
    });
    if (!matches.length)
        return null;
    const matchIds = matches.map((m) => m.id);
    const events = await db_config_1.prisma.matchEvent.findMany({
        where: { matchId: { in: matchIds }, eventTeamId: teamId },
    });
    let streak = 0;
    let lastStreak = true;
    const stats = matches.reduce((acc, m) => {
        const home = m.homeTeamId === teamId;
        const gf = home ? m.homeScore : m.awayScore;
        const ga = home ? m.awayScore : m.homeScore;
        acc.goalsFor += gf;
        acc.goalsAgainst += ga;
        acc.gdList.push(gf - ga);
        acc.points += gf > ga ? 3 : gf === ga ? 1 : 0;
        if (lastStreak && gf > ga)
            streak++;
        else
            lastStreak = false;
        if (ga === 0)
            acc.cleanSheets++;
        return acc;
    }, {
        goalsFor: 0,
        goalsAgainst: 0,
        yellow: 0,
        red: 0,
        cleanSheets: 0,
        last15Goals: 0,
        points: 0,
        gdList: [],
    });
    for (const ev of events) {
        if (ev.eventType === "Goal" && ev.minute >= 75)
            stats.last15Goals++;
        if (ev.eventType === "Yellow")
            stats.yellow++;
        if (ev.eventType === "Red")
            stats.red++;
    }
    return { ...stats, streak };
}
