import { MatchStatus } from "../../../generated/prisma";

export interface match {
  tournamentId: string;
  scheduledDate: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  referee?: string;
  matchWeek?: number;
}

export interface UpdateMatchSchedule {
  scheduledDate?: string;
  venue?: string;
  referee?: string;
  matchWeek?: number;
}

export interface EndMatchData {
  homeScore?: number;
  awayScore?: number;
}
