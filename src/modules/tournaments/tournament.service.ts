import { error } from "console";
import { prisma } from "../../config/db";
import { tournament, UpdateTournament } from "./utility";

export class TournamentService {
  constructor(private prismaService = prisma) {}

  async getTournaments() {
    try {
      const res = await this.prismaService.tournament.findMany();
      if (!res || res.length === 0) {
        return {
          ok: false,
          error: "No tournaments found",
        };
      }
      return {
        ok: true,
        data: res,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  async getTournament(id: string) {
    try {
      const res = await this.prismaService.tournament.findFirst({
        where: { id },
      });
      if (!res) {
        return {
          ok: false,
          error: "smtg went wrong",
        };
      }
      return {
        ok: true,
        data: res,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createTournament(data: tournament) {
    try {
      const res = await this.prismaService.tournament.create({
        data,
        select: {
          id: true,
          tournamentName: true,
          manager: { select: { fullName: true } },
        },
      });
      return {
        ok: true,
        data: res,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async deleteTournament(id: string) {
    try {
      const res = await this.prismaService.tournament.delete({ where: { id } });
      return {
        ok: true,
        data: res, // Optionally return the deleted tournament
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateTournament(data: UpdateTournament) {
    try {
      const { id, ...update } = data;

      // Validate tournament exists first
      const existing = await this.prismaService.tournament.findUnique({
        where: { id },
      });
      if (!existing) {
        return {
          ok: false,
          error: "Tournament not found",
        };
      }

      const filteredUpdate = this.cleanData(update);

      // Optional: Add business logic validation
      if (filteredUpdate.startingDate && filteredUpdate.endingDate) {
        if (
          new Date(filteredUpdate.startingDate) >
          new Date(filteredUpdate.endingDate)
        ) {
          return {
            ok: false,
            error: "Starting date cannot be after ending date",
          };
        }
      }

      const res = await this.prismaService.tournament.update({
        where: { id },
        data: filteredUpdate,
      });

      return {
        ok: true,
        data: res,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  private cleanData(update: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(update).filter(([_, v]) => v !== undefined)
    );
  }
}
