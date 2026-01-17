import { LineupRole, PlayerPosition } from "../../../generated/prisma";
import { prisma } from "../../config/db.config";

export class CoachService {
  constructor(private prismaService = prisma) {}
  async requestLineUp(
    teamId: string,
    matchId: string,
    formation: string,
    requestById: string,
    players: {
      playerId: string;
      position: PlayerPosition;
      role: LineupRole;
      isCaptain?: boolean;
    }[],
  ) {
    const match = await this.prismaService.match.findFirst({
      where: {
        id: matchId,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
    });

    if (!match) {
      return {
        ok: false,
        message: "Team is not part of this match",
      };
    }

    const existingLineup = await this.prismaService.matchLineup.findUnique({
      where: {
        matchId_teamId: {
          matchId,
          teamId,
        },
      },
    });

    if (existingLineup?.state === "APPROVED") {
      return {
        ok: false,
        message: "Approved lineup cannot be modified",
      };
    }

    const trans = await this.prismaService.$transaction(async (tx) => {
      // delete old draft/requested lineup players
      if (existingLineup) {
        await tx.matchLineupPlayer.deleteMany({
          where: { lineupId: existingLineup.id },
        });
      }

      // upsert lineup
      const lineup = await tx.matchLineup.upsert({
        where: {
          matchId_teamId: {
            matchId,
            teamId,
          },
        },
        update: {
          formation,
          state: "REQUESTED",
          submittedAt: new Date(),
        },
        create: {
          matchId,
          teamId,
          formation,
          state: "REQUESTED",
          requestedById: requestById,
          submittedAt: new Date(),
        },
      });

      // create players
      await tx.matchLineupPlayer.createMany({
        data: players.map((p) => ({
          lineupId: lineup.id,
          playerId: p.playerId,
          position: p.position,
          role: p.role,
          isCaptain: p.isCaptain ?? false,
        })),
      });

      return lineup;
    });
    if (!trans) {
      return {
        ok: false,
        message: "failed to Request the Lineup try again",
      };
    }
    return {
      ok: true,
      message: "Line-Up Requested Successfully",
    };
  }
  async lineUpPlayers(matchId: string, teamId: string) {
    const data = await this.prismaService.matchLineup.findFirst({
      where: {
        matchId,
        teamId,
        state: "APPROVED",
      },
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                number: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      return {
        ok: false,
        message: "No Line-Up History Found",
        data: null,
      };
    }

    return {
      ok: true,
      message: "fetched Line-Up History",
      data: {
        starting: data.players.filter((player) => player.role === "STARTING"),
        bench: data.players.filter((player) => player.role === "BENCH"),
      },
    };
  }
  async getLineUpRequest(matchId: string, teamId: string) {
    const data = await this.prismaService.matchLineup.findFirst({
      where: {
        matchId,
        teamId,
        state: "REQUESTED",
      },
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                number: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      return {
        ok: false,
        message: "No Line-Up History Found",
        data: null,
      };
    }

    return {
      ok: true,
      message: "fetched Line-Up History",
      data: { players: data.players, status: data.state },
    };
  }
  async approveLineUpRequest(id: string, approvedById: string) {
    const res = await this.prismaService.matchLineup.update({
      where: { id },
      data: {
        state: "APPROVED",
        approvedById,
      },
    });
    if (!res) {
      return {
        ok: false,
        message: "line-up not found",
      };
    }
    return {
      ok: true,
      message: "line-up approved",
    };
  }
  async rejectLineUpRequest(id: string, approvedById: string) {
    const res = await this.prismaService.matchLineup.update({
      where: { id },
      data: {
        state: "REJECTED",
        approvedById,
      },
    });
    if (!res) {
      return {
        ok: false,
        message: "line-up not found",
      };
    }
    return {
      ok: true,
      message: "line-up approved",
    };
  }
  async getAllRequestedLinUpsTeamId() {
    const teamIds = await this.prismaService.matchLineup.findMany({
      where: { state: "REQUESTED" },
      select: { teamId: true },
    });
    if (teamIds.length < 0) {
      return {
        ok: false,
        data: [],
        message: "No Requested LineUp",
      };
    }
    return {
      ok: true,
      data: teamIds,
    };
  }
}
