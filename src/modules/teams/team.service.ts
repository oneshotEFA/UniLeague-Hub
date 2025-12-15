import { Prisma } from "../../../generated/prisma";
import { prisma } from "../../config/db";
import { CloudinaryService } from "../../common/constants/cloudinary";

export class TeamService {
  constructor(
    private PrismaService = prisma,
    private cloudinaryService: CloudinaryService
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

      const logoUrl = await this.cloudinaryService.upload(
        logo.buffer,
        "teamLogo"
      );

      const team = await this.PrismaService.team.create({
        data: {
          teamName,
          // logo: logoUrl
        },
      });
      return {
        ok: true,
        data: team,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  // update team
  async updateTeam(id: string, data: Prisma.TeamUpdateInput) {
    try {
      if (!id) {
        return {
          ok: false,
          error: "invalid parameter",
        };
      }

      const update = await this.PrismaService.team.update({
        where: { id },
        data,
      });
      return {
        ok: true,
        data: update,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
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
      const search = await this.PrismaService.team.findMany({
        where: {
          teamName: {
            contains: fineName,
            mode: "insensitive",
          },
        },
      });
      return {
        ok: true,
        data: search,
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
      return {
        ok: true,
        data: getTeam,
      };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
