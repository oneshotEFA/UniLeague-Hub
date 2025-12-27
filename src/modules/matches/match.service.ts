/*  createMatch()
- updateMatchSchedule()
- startMatch()
- postponeMatch()
- endMatch()
- getMatchById()
- getMatchesByTournament()
- getMatchesByTeam()
- getTodayMatches()
- getLiveMatches() */
import { prisma } from "../../config/db.config";
import { match, UpdateMatchSchedule } from "./mtype";
import { eventBus } from "../../events/event-bus";
import { MATCH_FINISHED, TEAMPOWER } from "../../events/events";

export class MatchService {
  constructor(private prismaService = prisma) {}

  private formatDate(dateStr: string | Date): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return typeof dateStr === "string" ? dateStr : dateStr.toISOString();
      }
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (error) {
      return typeof dateStr === "string" ? dateStr : dateStr.toISOString();
    }
  }

  async createMatch(data: match) {
    try {
      const matchData = await this.prismaService.match.create({
        data: {
          ...data,
          status: "SCHEDULED",
          homeScore: 0,
          awayScore: 0,
        },
      });
      return {
        ok: true,
        data: {
          ...matchData,
          scheduledDate: this.formatDate(
            matchData.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateMatchSchedule(id: string, data: UpdateMatchSchedule) {
    try {
      const match = await this.prismaService.match.update({
        where: { id },
        data,
      });
      return {
        ok: true,
        data: {
          ...match,
          scheduledDate: this.formatDate(
            match.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async startMatch(id: string) {
    try {
      const match = await this.prismaService.match.update({
        where: { id },
        data: { status: "LIVE" },
      });
      return {
        ok: true,
        data: {
          ...match,
          scheduledDate: this.formatDate(
            match.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async postponeMatch(id: string) {
    try {
      const match = await this.prismaService.match.update({
        where: { id },
        data: { status: "POSTPONED" },
      });
      return {
        ok: true,
        data: {
          ...match,
          scheduledDate: this.formatDate(
            match.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async endMatch(id: string, homeScore?: number, awayScore?: number) {
    try {
      const updateData: any = { status: "FINISHED" };
      if (homeScore !== undefined) updateData.homeScore = homeScore;
      if (awayScore !== undefined) updateData.awayScore = awayScore;
      const match = await this.prismaService.match.update({
        where: { id },
        data: updateData,
      });
      // Emit event to update standings
      eventBus.emit(MATCH_FINISHED, {
        tournamentId: match.tournamentId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      });
      eventBus.emit(TEAMPOWER, {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
      });
      return {
        ok: true,
        data: {
          ...match,
          scheduledDate: this.formatDate(
            match.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getMatchById(id: string) {
    try {
      const match = await this.prismaService.match.findUnique({
        where: { id },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
          events: {
            select: {
              id: true,
              eventType: true,
              minute: true,
              team: { select: { teamName: true } },
              player: { select: { name: true } },
            },
          },
        },
      });
      if (!match) {
        return {
          ok: false,
          error: "Match not found",
        };
      }
      return {
        ok: true,
        data: {
          ...match,
          scheduledDate: this.formatDate(
            match.scheduledDate as unknown as string
          ),
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getMatchesByTournament(tournamentId: string) {
    try {
      const matches = await this.prismaService.match.findMany({
        where: { tournamentId },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: { scheduledDate: "asc" },
      });
      return {
        ok: true,
        data: matches.map((m) => ({
          ...m,
          scheduledDate: this.formatDate(m.scheduledDate as unknown as string),
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getMatchesByTeam(teamId: string) {
    try {
      const matches = await this.prismaService.match.findMany({
        where: {
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
        orderBy: { scheduledDate: "asc" },
      });
      return {
        ok: true,
        data: matches.map((m) => ({
          ...m,
          scheduledDate: this.formatDate(m.scheduledDate as unknown as string),
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getTodayMatches() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const matches = await this.prismaService.match.findMany({
        where: {
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
        orderBy: { scheduledDate: "asc" },
      });
      return {
        ok: true,
        data: matches.map((m) => ({
          ...m,
          scheduledDate: this.formatDate(m.scheduledDate as unknown as string),
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getLiveMatches() {
    try {
      const matches = await this.prismaService.match.findMany({
        where: { status: "LIVE" },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
          events: true,
          goalScore: true,
        },
        orderBy: { scheduledDate: "asc" },
      });
      return {
        ok: true,
        data: matches.map((m) => ({
          ...m,
          scheduledDate: this.formatDate(m.scheduledDate as unknown as string),
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getMatches(id: string) {
    try {
      const matches = await this.prismaService.match.findMany({
        where: { tournamentId: id },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
        orderBy: { scheduledDate: "asc" },
      });
      return {
        ok: true,
        data: matches.map((m) => ({
          ...m,
          scheduledDate: this.formatDate(m.scheduledDate as unknown as string),
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
