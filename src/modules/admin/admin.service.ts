import { prisma } from "../../config/db.config";
import { TournamentService } from "../tournaments/tournament.service";
import { tournament } from "../tournaments/utility";
import {
  fixtureMatchesType,
  parseSeason,
  UpdateTournament,
} from "../tournaments/utility";
export class AdminService {
  constructor(
    private prismaService = prisma,
    private tournamentService: TournamentService
  ) {}

  // create a tournament
  async createTournament(data: tournament) {
    try {
      if (!data) {
        return {
          ok: false,
          error: "data required",
        };
      }
      const tournament = await this.tournamentService.createTournament(data);
      return {
        ok: true,
        data: tournament,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // update a tournament
  async updateTournament(data: UpdateTournament) {
    try {
      if (!data) {
        return {
          ok: false,
          error: "data required",
        };
      }
      const update = await this.tournamentService.updateTournament(data);
      return {
        ok: true,
        data: update,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // deleting tournament
  async deleteTournament(id: string) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "id is required",
        };
      }
      const deletedTournament = await this.tournamentService.deleteTournament(
        id
      );
      return {
        ok: true,
        data: deletedTournament,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // get the teams in the tournament
  async getTeamsInTournament(tournamentId: string) {
    try {
      if (!tournamentId) {
        return {
          ok: false,
          error: "tournament id is required",
        };
      }
      const teams = await this.tournamentService.getTournamentTeams(
        tournamentId
      );
      return {
        ok: true,
        data: teams,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // assing manager to tournament
  async assignManagerToTournament(managerId: string, tournamentId: string) {
    try {
      if (!managerId || !tournamentId) {
        return {
          ok: false,
          error: "Both id is required",
        };
      }
      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return {
          ok: false,
          error: "no tournament by this id",
        };
      }
      const manager = await this.prismaService.admin.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return {
          ok: false,
          error: "no manager in this",
        };
      }
      const assignManager = await this.prismaService.tournament.update({
        where: { id: tournamentId },
        data: { managerId: managerId },
      });

      return {
        ok: true,
        data: assignManager,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // get tournament manager
  async getTournamentManagers() {
    try {
      const managers = await this.prismaService.tournament.findMany({
        include: { manager: true },
      });
      return {
        ok: true,
        data: managers,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  // remove tournament manager
  async removeTournamentManager(tournamentId: string, managerId: string) {
    try {
      if (!tournamentId || !managerId) {
        return {
          ok: false,
          error: "Both id is required",
        };
      }
      const tournament = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return {
          ok: false,
          error: "no tournament by this id",
        };
      }

      const manager = await this.prismaService.admin.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return {
          ok: false,
          error: "no manager in this",
        };
      }
      const removed = await this.prismaService.tournament.update({
        where: { id: tournamentId },
        data: { managerId: null },
      });
      return {
        ok: true,
        data: removed,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }

  //replace tor

  // get all admin
  async getAllAdmin() {
    try {
      const allAdmin = await this.prismaService.admin.findMany({
        where: { role: "tournamentManager" },
      });

      return {
        ok: true,
        count: allAdmin.length,
        data: allAdmin,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
