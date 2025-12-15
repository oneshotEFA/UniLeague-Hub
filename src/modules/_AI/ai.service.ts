import { ai } from "../../config/ai";
import { prisma } from "../../config/db";
// import { promises as fs } from "fs";
import { aiApiCall, collectTeamStats, downloadImages } from "./utility/common";
import {
  buildAnnouncementPrompt,
  buildGroupShufflePrompt,
  buildKnockoutPrompt,
  buildLeagueShufflePrompt,
  buildPosterPrompt,
  buildPredictionPrompt,
  buildTeamPowerPrompt,
  buildTransferAnnouncementPrompt,
} from "./utility/promptBuilder";
import {
  Group,
  GroupInput,
  KnockoutInput,
  KnockoutMatch,
  LeagueInput,
  Match,
  MatchWeek,
  PosterInput,
  TournamentAnnouncementInput,
  TransferAnnouncementInput,
} from "./utility/type";

export class FixtureAI {
  static async generateRandomLeagueFixture(input: LeagueInput) {
    const {
      teams,
      rounds = 2,
      matchesPerWeek = 4,
      startDate,
      daysBetweenWeeks = 7,
    } = input;
    const fixture: MatchWeek[] = [];
    const teamList = [...teams];
    const isOdd = teamList.length % 2 !== 0;
    if (isOdd) teamList.push({ id: "BYE", name: "BYE" });

    const totalTeams = teamList.length;
    const weeksPerRound = totalTeams - 1;
    let weekIndex = 1;
    let currentDate = startDate ? new Date(startDate) : new Date();

    for (let r = 0; r < rounds; r++) {
      const teamsCopy = [...teamList];

      for (let week = 0; week < weeksPerRound; week++) {
        const matches: Match[] = [];

        for (let i = 0; i < matchesPerWeek; i++) {
          const home = teamsCopy[i];
          const away = teamsCopy[totalTeams - 1 - i];

          if (home.id !== "BYE" && away.id !== "BYE") {
            matches.push({
              homeTeamId: home.name,
              awayTeamId: away.name,
              date: currentDate.toISOString().split("T")[0],
            });
          }
        }

        fixture.push({ matchWeek: weekIndex++, matches });

        // Rotate teams for next week (except the first team)
        teamsCopy.splice(1, 0, teamsCopy.pop()!);

        currentDate.setDate(currentDate.getDate() + daysBetweenWeeks);
      }
    }
    const prompt = buildLeagueShufflePrompt(fixture);

    return await aiApiCall(prompt);
  }
  static async generatePoster(input: PosterInput) {
    // Step 1: Download the images into memory buffers
    try {
      const res = await downloadImages(input.homeImageUrl, input.awayImageUrl);
      if (!res.ok) {
        console.log("hii");
        return {
          ok: false,
          data: null,
        };
      }
      const { homeBuffer, awayBuffer, homeMime, awayMime } = res;
      // Step 2: Build prompt
      const prompt = buildPosterPrompt(input);
      console.log("ai api call started");
      // Step 3: Call Gemini with inline images
      const response = await ai.models.generateContent({
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
      const raw =
        (response as any)?.text ||
        // 2. New Gemini format: candidates[0].content.parts[]
        (response as any)?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || "")
          .join("") ||
        // 3. Older fallback formats
        (response as any)?.candidates
          ?.map((c: any) => c.outputText || "")
          .join("") ||
        "";

      // 4. Validate
      if (!raw || raw.trim().length === 0) {
        const reason =
          (response as any)?.candidates?.[0]?.finishReason || "Unknown";

        throw new Error(
          `AI returned an empty response. Finish Reason: ${reason}`
        );
      }

      // Gemini returns pure base64 (no JSON), so decode
      const posterBase64 = raw.replace(/(\n|")/g, "").trim();
      const posterBuffer = Buffer.from(posterBase64, "base64");
      console.log("done");

      return {
        buffer: posterBuffer,
        base64: posterBase64,
      };
    } catch (error) {
      console.log("unecpted error cached:", error);
    }
  }

  static async generateGroupStageFixture(input: GroupInput) {
    try {
      var { teams, teamsPerGroup, rounds = 1 } = input;

      if (teams.length < teamsPerGroup) {
        throw new Error("Number of teams is less than teams per group.");
      }

      // 1. Shuffle input teams to randomize group placement
      const shuffled = [...teams].sort(() => Math.random() - 0.5);

      // 2. Split teams into groups
      const groups: Group[] = [];
      let groupIndex = 0;

      for (let i = 0; i < shuffled.length; i += teamsPerGroup) {
        const groupTeams = shuffled.slice(i, i + teamsPerGroup);
        if (groupTeams.length < teamsPerGroup) break;

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
                group: group.groupName,
              });
            }
          }
        }
      }

      const prompt = buildGroupShufflePrompt(groups);

      return await aiApiCall(prompt);
    } catch (error) {
      console.log("error:", error);
    }
  }

  static async generateKnockoutBracket(input: KnockoutInput) {
    let teams = [...input.teams];

    // Add BYE if odd number of teams
    if (teams.length % 2 !== 0) {
      teams.push({ id: "BYE", name: "BYE" });
    }

    // Shuffle once
    teams = teams.sort(() => Math.random() - 0.5);

    const totalTeams = teams.length;
    const totalRounds = Math.log2(totalTeams);

    const matches: KnockoutMatch[] = [];
    let matchIdCounter = 1;

    // -------------------------
    // ROUND 1 — Initial matches
    // -------------------------
    const roundMatches: KnockoutMatch[] = [];

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
      const nextRound: KnockoutMatch[] = [];

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

    const prompt = buildKnockoutPrompt(matches);
    return await aiApiCall(prompt);
  }
  static async generateTeamPower(teamId: string) {
    try {
      const stats = await collectTeamStats(teamId);
      if (!stats)
        return {
          ok: false,
          data: null,
          error: "Not enough match data to evaluate team power.",
        };
      const prompt = buildTeamPowerPrompt(stats);
      const power = await aiApiCall(prompt);
      const prePower = await prisma.team.findUnique({
        where: { id: teamId },
        select: { power: true },
      });
      const averagedPower = Math.round((prePower + power) / 2);
      await prisma.team.update({
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
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: (error as Error).message,
      };
    }
  }
  static async predictMatchOutcome(matchId: string) {
    try {
      const teams = await prisma.match.findUnique({
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
      const homePower = await prisma.team.findUnique({
        where: { id: teams.homeTeam.id },
        select: { power: true },
      });
      const awayPower = await prisma.team.findUnique({
        where: { id: teams.awayTeam.id },
        select: { power: true },
      });

      const prompt = buildPredictionPrompt({
        homeTeam: teams.homeTeam.teamName,
        awayTeam: teams.awayTeam.teamName,
        homePower: homePower ? homePower.power : 0,
        awayPower: awayPower ? awayPower.power : 0,
      });
      return await aiApiCall(prompt);
    } catch (error) {
      console.log("error:", error);
    }
  }
  private static async generateWithPrompt<T>(
    promptBuilder: (input: T) => string,
    input: T
  ) {
    try {
      const prompt = promptBuilder(input);
      return await aiApiCall(prompt);
    } catch (error) {
      console.error("AI generation error:", error);
      throw error;
    }
  }

  static generateTransferAnnouncement(input: TransferAnnouncementInput) {
    return this.generateWithPrompt(buildTransferAnnouncementPrompt, input);
  }

  static generateAnnouncement(input: TournamentAnnouncementInput) {
    return this.generateWithPrompt(buildAnnouncementPrompt, input);
  }
}
