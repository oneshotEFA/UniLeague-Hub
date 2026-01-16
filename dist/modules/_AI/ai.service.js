"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const ai_config_1 = require("../../config/ai.config");
const db_config_1 = require("../../config/db.config");
// import { promises as fs } from "fs";
const common_1 = require("./utility/common");
const promptBuilder_1 = require("./utility/promptBuilder");
class AiService {
    static async generateRandomLeagueFixture(input) {
        const { teams, rounds = 2, matchesPerWeek = 4, startDate, daysBetweenWeeks = 7, } = input;
        const fixture = [];
        const teamList = [...teams];
        const isOdd = teamList.length % 2 !== 0;
        if (isOdd)
            teamList.push({ id: "BYE", name: "BYE" });
        const totalTeams = teamList.length;
        const weeksPerRound = totalTeams - 1;
        let weekIndex = 1;
        let currentDate = startDate ? new Date(startDate) : new Date();
        for (let r = 0; r < rounds; r++) {
            const teamsCopy = [...teamList];
            for (let week = 0; week < weeksPerRound; week++) {
                const matches = [];
                for (let i = 0; i < matchesPerWeek; i++) {
                    const home = teamsCopy[i];
                    const away = teamsCopy[totalTeams - 1 - i];
                    if (home.id !== "BYE" && away.id !== "BYE") {
                        matches.push({
                            homeTeamId: home.id,
                            awayTeamId: away.id,
                            homeTeamName: home.name,
                            awayTeamName: away.name,
                            date: currentDate.toISOString().split("T")[0],
                        });
                    }
                }
                fixture.push({ matchWeek: weekIndex++, matches });
                // Rotate teams for next week (except the first team)
                teamsCopy.splice(1, 0, teamsCopy.pop());
                currentDate.setDate(currentDate.getDate() + daysBetweenWeeks);
            }
        }
        const prompt = (0, promptBuilder_1.buildLeagueShufflePrompt)(fixture);
        return await (0, common_1.aiApiCall)(prompt);
    }
    static async generatePoster(input) {
        // Step 1: Download the images into memory buffers
        try {
            const res = await (0, common_1.downloadImages)(input.homeImageUrl, input.awayImageUrl);
            if (!res.ok) {
                console.log("hii");
                return {
                    ok: false,
                    data: null,
                };
            }
            const { homeBuffer, awayBuffer, homeMime, awayMime } = res;
            // Step 2: Build prompt
            const prompt = (0, promptBuilder_1.buildPosterPrompt)(input);
            console.log("ai api call started");
            // Step 3: Call Gemini with inline images
            const response = await ai_config_1.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: homeMime,
                                    data: homeBuffer?.toString("base64"),
                                },
                            },
                            {
                                inlineData: {
                                    mimeType: awayMime,
                                    data: awayBuffer?.toString("base64"),
                                },
                            },
                        ],
                    },
                ],
            });
            console.log("ai response extraction started");
            // Extract base64 output
            const raw = response?.text ||
                // 2. New Gemini format: candidates[0].content.parts[]
                response?.candidates?.[0]?.content?.parts
                    ?.map((p) => p.text || "")
                    .join("") ||
                // 3. Older fallback formats
                response?.candidates
                    ?.map((c) => c.outputText || "")
                    .join("") ||
                "";
            // 4. Validate
            if (!raw || raw.trim().length === 0) {
                const reason = response?.candidates?.[0]?.finishReason || "Unknown";
                throw new Error(`AI returned an empty response. Finish Reason: ${reason}`);
            }
            // Gemini returns pure base64 (no JSON), so decode
            const posterBase64 = raw.replace(/(\n|")/g, "").trim();
            const posterBuffer = Buffer.from(posterBase64, "base64");
            console.log("done");
            return {
                buffer: posterBuffer,
                base64: posterBase64,
            };
        }
        catch (error) {
            console.log("unecpted error cached:", error);
        }
    }
    static async generateGroupStageFixture(input) {
        try {
            var { teams, teamsPerGroup, rounds = 1 } = input;
            if (teams.length < teamsPerGroup) {
                throw new Error("Number of teams is less than teams per group.");
            }
            // 1. Shuffle input teams to randomize group placement
            const shuffled = [...teams].sort(() => Math.random() - 0.5);
            // 2. Split teams into groups
            const groups = [];
            let groupIndex = 0;
            for (let i = 0; i < shuffled.length; i += teamsPerGroup) {
                const groupTeams = shuffled.slice(i, i + teamsPerGroup);
                if (groupTeams.length < teamsPerGroup)
                    break;
                groups.push({
                    groupName: `Group ${String.fromCharCode(65 + groupIndex)}`,
                    teams: groupTeams,
                    fixtures: [],
                });
                groupIndex++;
            }
            // 3. Generate fixtures: each team plays each team in the group
            for (const group of groups) {
                const t = group.teams;
                for (let r = 0; r < rounds; r++) {
                    for (let i = 0; i < t.length; i++) {
                        for (let j = i + 1; j < t.length; j++) {
                            group.fixtures.push({
                                homeTeamId: t[i].id,
                                awayTeamId: t[j].id,
                                homeTeamName: t[i].name,
                                awayTeamName: t[j].name,
                                group: group.groupName,
                            });
                        }
                    }
                }
            }
            const prompt = (0, promptBuilder_1.buildGroupShufflePrompt)(groups);
            return await (0, common_1.aiApiCall)(prompt);
        }
        catch (error) {
            console.log("error:", error);
        }
    }
    static async generateKnockoutBracket(input) {
        let teams = [...input.teams];
        // Add BYE if odd number of teams
        if (teams.length % 2 !== 0) {
            teams.push({ id: "BYE", name: "BYE" });
        }
        // Shuffle once
        teams = teams.sort(() => Math.random() - 0.5);
        const totalTeams = teams.length;
        const totalRounds = Math.log2(totalTeams);
        const matches = [];
        let matchIdCounter = 1;
        // -------------------------
        // ROUND 1 — Initial matches
        // -------------------------
        const roundMatches = [];
        for (let i = 0; i < totalTeams; i += 2) {
            roundMatches.push({
                id: `M${matchIdCounter++}`,
                round: 1,
                homeTeamId: teams[i].name,
                awayTeamId: teams[i + 1].name,
            });
        }
        matches.push(...roundMatches);
        // -------------------------
        // NEXT ROUNDS (Quarter → Semi → Final)
        // -------------------------
        let previousRoundMatches = roundMatches;
        for (let round = 2; round <= totalRounds; round++) {
            const nextRound = [];
            for (let i = 0; i < previousRoundMatches.length; i += 2) {
                const match = {
                    id: `M${matchIdCounter++}`,
                    round,
                    homeTeamId: null,
                    awayTeamId: null,
                };
                // Always valid
                previousRoundMatches[i].nextMatchId = match.id;
                // SAFE: Only assign if exists (fixes your crash)
                if (previousRoundMatches[i + 1]) {
                    previousRoundMatches[i + 1].nextMatchId = match.id;
                }
                nextRound.push(match);
            }
            matches.push(...nextRound);
            previousRoundMatches = nextRound;
        }
        const prompt = (0, promptBuilder_1.buildKnockoutPrompt)(matches);
        return await (0, common_1.aiApiCall)(prompt);
    }
    static async generateTeamPower(teamId) {
        try {
            const stats = await (0, common_1.collectTeamStats)(teamId);
            if (!stats)
                return {
                    ok: false,
                    data: null,
                    error: "Not enough match data to evaluate team power.",
                };
            const prompt = (0, promptBuilder_1.buildTeamPowerPrompt)(stats);
            const power = await (0, common_1.aiApiCall)(prompt);
            const prePower = await db_config_1.prisma.team.findUnique({
                where: { id: teamId },
                select: { power: true },
            });
            const averagedPower = Math.round((prePower + power) / 2);
            await db_config_1.prisma.team.update({
                where: { id: teamId },
                data: { power: averagedPower },
            });
            if (!power || isNaN(Number(power))) {
                return {
                    ok: false,
                    data: null,
                    error: "AI returned an invalid power value.",
                };
            }
            return {
                ok: true,
                data: Number(power),
            };
        }
        catch (error) {
            return {
                ok: false,
                data: null,
                error: error.message,
            };
        }
    }
    static async predictMatchOutcome(matchId) {
        try {
            const teams = await db_config_1.prisma.match.findUnique({
                where: { id: matchId },
                select: {
                    homeTeam: { select: { id: true, teamName: true } },
                    awayTeam: { select: { id: true, teamName: true } },
                },
            });
            if (!teams) {
                return {
                    ok: false,
                    data: null,
                    error: "Match not found.",
                };
            }
            const homePower = await db_config_1.prisma.team.findUnique({
                where: { id: teams.homeTeam.id },
                select: { power: true },
            });
            const awayPower = await db_config_1.prisma.team.findUnique({
                where: { id: teams.awayTeam.id },
                select: { power: true },
            });
            const prompt = (0, promptBuilder_1.buildPredictionPrompt)({
                homeTeam: teams.homeTeam.teamName,
                awayTeam: teams.awayTeam.teamName,
                homePower: homePower ? homePower.power : 0,
                awayPower: awayPower ? awayPower.power : 0,
            });
            return await (0, common_1.aiApiCall)(prompt);
        }
        catch (error) {
            console.log("error:", error);
        }
    }
    static async generateWithPrompt(promptBuilder, input) {
        try {
            const prompt = promptBuilder(input);
            return await (0, common_1.aiApiCall)(prompt);
        }
        catch (error) {
            console.error("AI generation error:", error);
            throw error;
        }
    }
    static generateTransferAnnouncement(input) {
        return this.generateWithPrompt(promptBuilder_1.buildTransferAnnouncementPrompt, input);
    }
    static generateAnnouncement(input) {
        return this.generateWithPrompt(promptBuilder_1.buildAnnouncementPrompt, input);
    }
    static analysisError(input) {
        console.log("ai called error found");
        return this.generateWithPrompt(promptBuilder_1.buildErrorAnalysisPrompt, input);
    }
}
exports.AiService = AiService;
