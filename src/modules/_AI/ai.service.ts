import { ai } from "../../config/ai";
import {
  KnockoutInput,
  GroupInput,
  Group,
  LeagueInput,
  Match,
  MatchWeek,
  withRetry,
  KnockoutMatch,
  aiApiCall,
  buildKnockoutPrompt,
  buildGroupShufflePrompt,
  buildPoster,
  buildLeagueShufflePrompt,
} from "./utility";

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

        for (let i = 0; i < totalTeams / 2; i++) {
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
  static async generatePoster(input: any) {
    return withRetry(async () => {
      const prompt = buildPoster(input);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [prompt],
      });

      const raw = response.text;

      if (!raw) {
        throw new Error(
          "AI returned an empty response (raw text is undefined)."
        );
      }
      return raw;
    });
  }

  static async generateGroupStageFixture(input: GroupInput) {
    const { teams, teamsPerGroup, rounds = 1 } = input;

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
}
