import { Status } from "../../../generated/prisma";

export interface tournament {
  managerId: string;
  tournamentName: string;
  startingDate: string;
  endingDate: string;
  description: string;
  venue: string;
  sponsor?: string;
  status: Status;
}
export interface UpdateTournament {
  id: string;
  tournamentName?: string;
  startingDate?: string;
  endingDate?: string;
  description?: string;
  venue?: string;
  sponsor?: string;
  status: Status;
}
