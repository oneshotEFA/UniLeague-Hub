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
export function getPastDaysRange(days: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

export function getNextDaysRange(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
