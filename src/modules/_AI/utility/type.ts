export interface MatchWeek {
  matchWeek: number;
  matches: Match[];
}
export interface Match {
  homeTeamId: string;
  awayTeamId: string;
  group?: string;
  date?: string;
}

export interface KnockoutMatch {
  id: string;
  round: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  nextMatchId?: string; // path for the winner
}

export interface KnockoutInput {
  teams: TeamInput[];
}
export interface LeagueFixtureOutput {
  fixtures: MatchWeek[];
}
export interface TeamInput {
  id: string;
  name: string;
}
export interface Group {
  groupName: string;
  teams: TeamInput[];
  fixtures: Match[];
}

export interface GroupInput {
  teams: TeamInput[];
  teamsPerGroup: number;
  rounds?: number; // default: 1 (single round-robin)
}
export interface LeagueInput {
  teams: TeamInput[];
  rounds?: number;
  matchesPerWeek: number;
  startDate: string;
  daysBetweenWeeks: number;
}

export interface GroupStageInput {
  teams: TeamInput[];
  teamsPerGroup: number;
  rounds?: number;
  startDate: string;
  daysBetweenWeeks: number;
}

export interface KnockoutInput {
  qualifiedTeams: TeamInput[];
  matchRules: {
    useHomeAwayLegs: boolean;
    finalIsSingleMatch: boolean;
  };
  startDate: string;
  daysBetweenRounds: number;
}

export type PosterInput = {
  homeTeam: string;
  awayTeam: string;
  homeImageUrl: string;
  awayImageUrl: string;
};
