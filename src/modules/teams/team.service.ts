import { Prisma } from "../../../generated/prisma";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../gallery/gallery.service";
export class TeamService {
  constructor(
    private PrismaService = prisma,
    private galleryService: GalleryService
  ) {}

  // upload image(logo) to the cloudinary cloud create team
  async createTeam(teamName: string, logo: Express.Multer.File) {
    try {
      if (!teamName || !logo) {
        return {
          ok: false,
          error: "Team name and logo is required",
        };
      }
      const check = await this.PrismaService.team.findMany({
        where: { teamName },
      });
      if (check.length > 0) {
        return {
          ok: false,
          error: "there is a team with this name!!!",
        };
      }

      const team = await this.PrismaService.team.create({
        data: {
          teamName,
        },
      });

      const logoSaved = await this.galleryService.savePicture(
        logo.buffer,
        team.id,
        "TEAM",
        "LOGO",
        true
      );

      return {
        ok: true,
        data: {
          team,
          logo: logoSaved.data?.url,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // update team
  async updateTeam(
    id: string,
    data: Prisma.TeamUpdateInput,
    logo?: Express.Multer.File
  ) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "invalid parameter",
        };
      }

      const updateTeam = await this.PrismaService.team.update({
        where: { id },
        data,
      });

      if (logo) {
        const existingLogo = await this.PrismaService.mediaGallery.findFirst({
          where: { ownerId: id },
          select: { id: true, publicId: true },
        });

        await this.galleryService.savePicture(
          logo.buffer,
          id,
          "TEAM",
          "LOGO",
          true
        );

        if (existingLogo?.publicId) {
          await this.galleryService.deleteImage(existingLogo.publicId);

          await this.PrismaService.mediaGallery.delete({
            where: { id: existingLogo.id },
          });
        }
      }

      return {
        ok: true,
        data: updateTeam,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      };
    }
  }

  // remove team
  async removeTeam(id: string) {
    try {
      const team = await this.PrismaService.team.findUnique({
        where: { id },
      });
      if (!team) {
        return {
          ok: false,
          error: "team does not exist",
        };
      }
      const removeLogo = await this.PrismaService.mediaGallery.findFirst({
        where: { ownerId: id },
        select: { publicId: true },
      });

      if (removeLogo?.publicId) {
        await this.galleryService.deleteImage(removeLogo.publicId);
      }

      const removedTeam = await this.PrismaService.team.delete({
        where: { id },
      });

      return {
        ok: true,
        data: removedTeam,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // search team
  async searchTeamByName(teamName: string) {
    const fineName = teamName.trim();
    try {
      if (!fineName) {
        return {
          ok: false,
          error: "team name required",
        };
      }
      const team = await this.PrismaService.team.findFirst({
        where: {
          teamName: {
            contains: fineName,
            mode: "insensitive",
          },
        },
      });

      if (team) {
        const logo = await this.galleryService.getImagesByOwner(
          "TEAM",
          team.id
        );
        return {
          ok: true,
          data: {
            ...team,
            logo,
          },
        };
      }
      return {
        ok: false,
        error: "no team found ",
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // get team be Id
  async getTeamById(id: string) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "id requierd",
        };
      }
      const check = await this.PrismaService.team.findUnique({
        where: { id },
      });
      if (!check) {
        return {
          ok: false,
          error: "no team found",
        };
      }
      const getTeam = await this.PrismaService.team.findUnique({
        where: { id },
      });

      const logo = await this.galleryService.getImagesByOwner("TEAM", id);

      return {
        ok: true,
        data: {
          ...getTeam,
          logo,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // team stastics
  async teamStatus(id: string) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "teamid is required",
        };
      }
      const check = await this.PrismaService.team.findUnique({
        where: { id: id },
      });
      if (!check) {
        return {
          ok: false,
          error: "team does not exist",
        };
      }
      const matches = await this.PrismaService.match.findMany({
        where: {
          status: "FINISHED",
          OR: [{ homeTeamId: id }, { awayTeamId: id }],
        },
      });

      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      for (const match of matches) {
        const home = match.homeTeamId === id;

        const scored = home ? match.homeScore : match.awayScore;
        const conceded = home ? match.awayScore : match.homeScore;

        goalsFor += scored;
        goalsAgainst += conceded;

        if (scored > conceded) {
          wins++;
        } else if (scored === conceded) {
          draws++;
        } else {
          losses++;
        }
      }

      const cards = await this.PrismaService.matchEvent.groupBy({
        by: ["eventType"],
        where: {
          eventTeamId: id,
          eventType: { in: ["Yellow", "Red"] },
        },
        _count: true,
      });

      const yellowCards =
        cards.find((check) => check.eventType === "Yellow")?._count ?? 0;
      const readCards =
        cards.find((check) => check.eventType === "Red")?._count ?? 0;

      return {
        ok: true,
        data: {
          id,
          teamName: check.teamName,
          matchesPlayed: matches.length,
          wins,
          draws,
          losses,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          yellowCards,
          readCards,
        },
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async getAllTeams() {
    try {
      const teams = await this.PrismaService.team.findMany();

      const result = await Promise.all(
        teams.map(async (team) => {
          const logo = await this.galleryService.getImagesByOwner(
            "TEAM",
            team.id
          );
          const count = await this.PrismaService.player.count({
            where: { teamId: team.id },
          });
          return {
            ...team,
            playerCount: count,
            logo,
          };
        })
      );

      return {
        ok: true,
        data: result,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
// get all teams
