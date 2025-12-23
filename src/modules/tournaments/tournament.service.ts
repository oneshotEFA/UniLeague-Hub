import { prisma } from "../../config/db";
import {
  fixtureMatchesType,
  parseSeason,
  tournament,
  UpdateTournament,
} from "./utility";
import { eventBus } from "../../events/event-bus";
import { TOURNAMENT_ANNOUNCEMENT } from "../../events/events";
import { GalleryService } from "../gallery/gallery.service";

export class TournamentService {
  constructor(
    private prismaService = prisma,
    private galleryService: GalleryService
  ) {}

  async getTournaments() {
    try {
      const res = await this.prismaService.tournament.findMany({});
      if (!res || res.length === 0) {
        return {
          ok: false,
          error: "No tournaments found in this calendar year",
        };
      }
      const data = await Promise.all(
        res.map(async (tournament) => {
          const logo = await this.galleryService.getImagesByOwner(
            "TOURNAMENT",
            tournament.id,
            "LOGO"
          );
          return {
            ...res,
            logoUrl: logo[0]?.url,
          };
        })
      );

      return {
        ok: true,
        data,
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
      const data = await Promise.all(
        await this.galleryService.getImagesByOwner("TOURNAMENT", res.id, "LOGO")
      );

      return {
        ok: true,
        data: { ...res, logoUrl: data[0]?.url },
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
          startingDate: true,
          description: true,
          sponsor: true,
          manager: { select: { fullName: true } },
        },
      });
      const logo = await this.galleryService.savePicture(
        data.logo.buffer,
        res.id,
        "TOURNAMENT",
        "LOGO",
        true
      );
      let message = "Tournament created successfully";
      eventBus.emit(TOURNAMENT_ANNOUNCEMENT, {
        name: res.tournamentName,
        startDate: res.startingDate,
        organizer: res.sponsor,
        extraInfo: res.description,
      });
      if (!logo.ok) message = "Tournament created but logo upload failed";

      return {
        ok: true,
        data: res,
        message,
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
      const logo = await this.prismaService.mediaGallery.findFirst({
        where: { ownerId: id, ownerType: "TOURNAMENT", usage: "LOGO" },
        select: { publicId: true },
      });
      if (!logo?.publicId) return { ok: true, data: res };
      await this.galleryService.deleteImage(logo?.publicId);
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
      const { id, logo, ...update } = data;

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
      if (logo) {
        const existingLogo = await this.prismaService.mediaGallery.findFirst({
          where: { ownerId: id },
          select: { id: true, publicId: true },
        });

        await this.galleryService.savePicture(
          logo.buffer,
          id,
          "TOURNAMENT",
          "LOGO",
          true
        );

        if (existingLogo?.publicId) {
          await this.galleryService.deleteImage(existingLogo.publicId);

          await this.prismaService.mediaGallery.delete({
            where: { id: existingLogo.id },
          });
        }
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

  async addTeamToTournament(tournamentId: string, teamId: string) {
    try {
      // 1. Validate tournament
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      if (!tournament) {
        return { ok: false, message: "Tournament not found", data: null };
      }

      // 2. Validate team
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return { ok: false, message: "Team not found", data: null };
      }

      // 3. Prevent duplicates
      const existing = await prisma.tournamentTeam.findFirst({
        where: { tournamentId, teamId },
      });

      if (existing) {
        return {
          ok: false,
          message: "Team already added to this tournament",
          data: null,
        };
      }

      // 4. Insert the team into the tournament
      const tt = await prisma.tournamentTeam.create({
        data: { tournamentId, teamId },
      });

      return {
        ok: true,
        message: "Team successfully added to tournament",
        data: tt,
      };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Something went wrong", data: null };
    }
  }

  async removeTeamFromTournament(tournamentId: string, teamId: string) {
    try {
      // 1. Check if the team is part of the tournament
      const member = await prisma.tournamentTeam.findFirst({
        where: { tournamentId, teamId },
      });

      if (!member) {
        return { ok: false, message: "Team is not part of this tournament" };
      }

      const matches = await prisma.match.findFirst({
        where: {
          tournamentId,
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
      });

      if (matches) {
        return {
          ok: false,
          message:
            "Cannot remove team — team already has scheduled or played matches.",
        };
      }

      await prisma.tournamentStanding.deleteMany({
        where: { tournamentId, teamId },
      });

      await prisma.tournamentTeam.delete({
        where: { id: member.id },
      });

      return { ok: true, message: "Team removed successfully from tournament" };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Something went wrong while removing team" };
    }
  }

  async getTournamentTeams(tournamentId: string) {
    try {
      const teams = await this.prismaService.tournamentTeam.findMany({
        where: { tournamentId },
        select: { team: true },
      });
      if (teams.length === 0) {
        return {
          ok: false,
          error: "No team found",
        };
      }
      const data = await Promise.all(
        teams.map(async (team) => {
          const logo = await this.galleryService.getImagesByOwner(
            "TEAM",
            team.team.id,
            "LOGO"
          );
          return {
            ...team.team,
            logoUrl: logo[0]?.url,
          };
        })
      );
      return {
        ok: true,
        data,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  async generateFixtures(tournamentId: string) {
    try {
      const teams = await this.prismaService.tournamentTeam.findMany({
        where: { tournamentId },
      });

      if (teams.length === 0) {
        return {
          ok: false,
          error: "No team found",
        };
      }
      //assuming Ai module give a function to generate fixture like this <|>
      //const fixtureMatches= await this.AiService.generateFixture(teams);
      var fixtureMatches: fixtureMatchesType[];

      //return the fixture to admin to view it and match module handle creating the match
      return {
        ok: true,
        data: "fixtureMatches",
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  async getTournamentFixtures(tournamentId: string) {
    try {
      const matches = await this.prismaService.match.findMany({
        where: { tournamentId },
        orderBy: { matchWeek: "asc" },
      });
      if (matches.length === 0) {
        return {
          ok: false,
          error: "No matches found",
        };
      }
      return {
        ok: true,
        data: matches,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  async updateStandings(match: any) {
    try {
      const { tournamentId, homeTeamId, awayTeamId, homeScore, awayScore } =
        match;

      await this.updateTeamStanding(
        tournamentId,
        homeTeamId,
        homeScore,
        awayScore
      );
      await this.updateTeamStanding(
        tournamentId,
        awayTeamId,
        awayScore,
        homeScore
      );
      return { ok: true, data: "Standings updated" };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getTournamentStandings(tournamentId: string) {
    try {
      const standing = await this.prismaService.tournamentStanding.findMany({
        where: { tournamentId },
        orderBy: { points: "desc" },
      });
      if (!standing) return { ok: false, error: "not found" };
      return {
        ok: true,
        data: standing,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async closeTournament(id: string) {
    try {
      await this.prismaService.tournament.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      return {
        ok: true,
        data: "finished",
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  async getTournamentSummary(tournamentId: string) {}
  private async updateTeamStanding(
    tournamentId: string,
    teamId: string,
    goalsFor: number,
    goalsAgainst: number
  ) {
    const row = await prisma.tournamentStanding.findFirst({
      where: { tournamentId, teamId },
    });
    if (!row) throw new Error("Standing row not found");
    const updateData: any = {
      played: row.played + 1,
      goalsFor: row.goalsFor + goalsFor,
      goalsAgainst: row.goalsAgainst + goalsAgainst,
    };
    updateData.goalDifference = updateData.goalsFor - updateData.goalsAgainst;
    if (goalsFor > goalsAgainst) {
      updateData.wins = row.wins + 1;
      updateData.points = row.points + 3;
    } else if (goalsFor === goalsAgainst) {
      updateData.draws = row.draws + 1;
      updateData.points = row.points + 1;
    } else {
      updateData.losses = row.losses + 1;
    }

    await prisma.tournamentStanding.update({
      where: { id: row.id },
      data: updateData,
    });
  }

  private cleanData(update: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(update).filter(([_, v]) => v !== undefined)
    );
  }
  async initTournamentStanding(tournamentId: string) {
    try {
      const teams = await this.prismaService.tournamentTeam.findMany({
        where: { tournamentId: tournamentId },
        select: { teamId: true },
      });
      const res = await Promise.all(
        teams.map(async (team) => {
          try {
            return await this.initStanding(team.teamId, tournamentId);
          } catch (err) {
            return { ok: false, error: (err as Error).message };
          }
        })
      );
      const success = res.filter((r) => r.ok);
      const failed = res.filter((r) => !r.ok);
      return { ok: true, data: { success, failed } };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }
  private async initStanding(teamId: string, tournamentId: string) {
    try {
      const res = await this.prismaService.tournamentStanding.upsert({
        where: { tournamentId_teamId: { tournamentId, teamId } },
        update: {},
        create: { tournamentId, teamId },
      });

      return { ok: true, data: res.id };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }
  async resetTournamentStandings(tournamentId: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 1. Ensure tournament exists
        const tournament = await tx.tournament.findUnique({
          where: { id: tournamentId },
          select: { id: true },
        });

        if (!tournament) {
          return { ok: false, error: "Tournament not found" };
        }

        // 2. Get registered teams (IMPORTANT)
        const teams = await tx.tournamentTeam.findMany({
          where: { tournamentId },
          select: { teamId: true },
        });

        if (teams.length === 0) {
          return { ok: false, error: "No teams registered in tournament" };
        }

        // 3. Delete existing standings
        await tx.tournamentStanding.deleteMany({
          where: { tournamentId },
        });

        // 4. Recreate standings (defaults = 0)
        await tx.tournamentStanding.createMany({
          data: teams.map((t) => ({
            tournamentId,
            teamId: t.teamId,
          })),
          skipDuplicates: true,
        });

        return {
          ok: true,
          data: {
            tournamentId,
            teamsCount: teams.length,
          },
        };
      });
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
