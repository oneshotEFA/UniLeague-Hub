import { TournamentStatus as Status } from "../../../generated/prisma";

export interface tournament {
  managerId: string;
  tournamentName: string;
  startingDate: Date;
  endingDate: Date;
  description: string;
  venue: string;
  sponsor?: string;
  status: Status;
  logo: Express.Multer.File;
}
export interface UpdateTournament {
  id: string;
  tournamentName?: string;
  startingDate?: string;
  endingDate?: string;
  description?: string;
  venue?: string;
  sponsor?: string;
  status?: Status;
  logo?: Express.Multer.File;
}
export interface fixtureMatchesType {
  homeTeam: string;
  awayTeam: string;
  scheduleDate: string;
  week: number;
}

export function parseSeason(season: string) {
  const [startYear, endYear] = season.split("/").map(Number);

  return {
    start: new Date(`${startYear}-01-01T00:00:00.000Z`),
    end: new Date(`${endYear}-12-31T23:59:59.999Z`),
  };
}
