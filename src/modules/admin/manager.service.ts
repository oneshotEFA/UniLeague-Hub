import { error } from "console";
import { generateTeamKey } from "../../common/utils/utility";
import { prisma } from "../../config/db.config";
import { eventBus } from "../../events/event-bus";
import { REGISTIRATION_KEY } from "../../events/events";
import { AiService } from "../_AI/ai.service";
import { TeamInput } from "../_AI/utility/type";
import { GalleryService } from "../gallery/gallery.service";
import { NotificationService } from "../notifications/notification.servie";
import { TeamService } from "../teams/team.service";
import { TournamentService } from "../tournaments/tournament.service";
import { GenerateFixtureInput } from "./type";
import { ImageUsage, MediaOwnerType } from "../../../generated/prisma";
import { getNextDaysRange } from "../matches/mtype";
import { generatePassword } from "./utility";
import bcrypt from "bcryptjs";
import { CoachService } from "../coach/coach.service";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
const coachService = new CoachService();
export class ManagerServices {
  constructor(
    private prismaService = prisma,
    private tournamentService: TournamentService,
    private notificationService: NotificationService,
    private teamService: TeamService,
  ) {}
  async initTournamentStanding(tournamentId: string) {
    const init =
      await this.tournamentService.initTournamentStanding(tournamentId);
    if (!init.ok) {
      return {
        ok: false,
        error: init.error,
      };
    }
    return init;
  }
  async getPlayerByTournament(tournamentId: string) {
    const player =
      await this.tournamentService.getPlayersByTournament(tournamentId);
    if (!player.ok) {
      return {
        ok: false,
        error: player.message,
      };
    }
    return player;
  }
  async getFixtureByTournament(tournamentId: string) {
    const fixture =
      await this.tournamentService.getTournamentFixtures(tournamentId);
    if (!fixture.ok) {
      return {
        ok: false,
        error: fixture.error,
      };
    }
    return fixture;
  }
  async getStandingByTournament(tournamentId: string) {
    const standing =
      await this.tournamentService.getTournamentStandings(tournamentId);
    if (!standing.ok) {
      return {
        ok: false,
        error: standing.error,
      };
    }
    return standing;
  }
  async getTeamsByTournament(tournamentId: string) {
    const teams = await this.tournamentService.getTournamentTeams(tournamentId);
    if (!teams.ok) {
      return {
        ok: false,
        error: teams.error,
      };
    }
    return teams;
  }
  async getNewsByTournament(tournamentId: string) {
    const news =
      await this.notificationService.getTournamentBroadCast(tournamentId);
    if (!news.ok) {
      return {
        ok: false,
        error: news.error,
      };
    }
    return news;
  }
  async getTournamentStatus(tournamentId: string) {
    try {
      const detail = await this.prismaService.tournament.findUnique({
        where: { id: tournamentId },
      });
      const teamCount = await this.prismaService.tournamentTeam.count({
        where: { tournamentId },
      });
      const matchCount = await this.prismaService.match.count({
        where: { tournamentId },
      });
      return {
        ok: true,
        data: {
          tournament: detail,
          teamCount: teamCount,
          matchCount: matchCount,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: "fail to get status",
      };
    }
  }
  async registerTeam(
    teamName: string,
    coachEmail: string,
    coachName: string,
    logo: Express.Multer.File,
    tournamentId: string,
  ): Promise<{ ok: boolean; data?: any; error?: string }> {
    const teamInfo = await this.teamService.createTeam(
      teamName,
      coachName,
      coachEmail,
      logo,
    );
    if (!teamInfo || !teamInfo.ok) {
      return {
        ok: false,
        error: teamInfo.error,
      };
    }
    const res = await this.tournamentService.addTeamToTournament(
      tournamentId,
      teamInfo.data!.team.id,
    );
    const accessKey = generatePassword();
    const hashedAccessKey = bcrypt.hash(String(accessKey), 10);
    const registrationKey = (
      (teamInfo.data?.team.teamName?.slice(0, 4) ?? "") +
      generatePassword(4) +
      Date.now().toString(36).slice(-4)
    ).toUpperCase();
    const expirationDate = getNextDaysRange(14);
    await this.prismaService.team.update({
      where: { id: teamInfo.data?.team.id },
      data: {
        registrationKey,
        expiredRegistration: expirationDate.end,
        accessKey: String(hashedAccessKey),
      },
    });
    eventBus.emit(REGISTIRATION_KEY, {
      registrationKey: String(registrationKey),
      recipientName: teamInfo.data?.team.coachName,
      accessKey: String(accessKey),
      email: teamInfo.data!.team.coachEmail,
      tournamentName: res.data?.tournament.tournamentName,
      teamName: teamInfo.data?.team.teamName,
    });
    if (!res.ok) {
      return {
        ok: false,
        error: res.message,
      };
    }
    return res;
  }
  async generateFixture(input: GenerateFixtureInput) {
    try {
      if (input.tournamentType === "League") {
        const { teams, rounds, matchesPerWeek, startingDate } = input;
        const fixture = await AiService.generateRandomLeagueFixture({
          teams,
          rounds,
          matchesPerWeek,
          startDate: startingDate,
          daysBetweenWeeks: 7,
        });
        return {
          ok: true,
          data: fixture,
        };
      } else if (input.tournamentType === "knockout") {
        const { teams, startingDate } = input;
        const fixture = await AiService.generateKnockoutBracket({ teams });
        return {
          ok: true,
          data: fixture,
        };
      }
      return {
        ok: false,
        error: "invalid input",
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "unexpected error",
      };
    }
  }
  async createNews(
    tournamentId: string,
    managerId: string,
    content: { content: string; title: string; excerpt: string },
    banner: Express.Multer.File,
  ) {
    // const res = await this.notificationService.broadCastToTournament;
    const response = await notificationService.broadCastToTournament(
      managerId,
      tournamentId,
      content,
      banner,
    );
    if (!response.ok) {
      return {
        ok: false,
        error: response.error,
      };
    }
    return response;
  }
  async tournamentGallery(tournamentId: string) {
    try {
      const teams = await this.prismaService.tournamentTeam.findMany({
        where: { tournamentId },
        select: {
          team: {
            select: {
              id: true,
              teamName: true,
            },
          },
        },
      });

      const teamMap = new Map(teams.map((t) => [t.team.id, t.team.teamName]));

      const teamIds = teams.map((t) => t.team.id);

      const gallery = await this.prismaService.mediaGallery.findMany({
        where: {
          OR: [
            { ownerId: tournamentId, ownerType: "TOURNAMENT" },
            { ownerId: { in: teamIds }, ownerType: "TEAM" },
          ],
        },
        select: {
          id: true,
          ownerId: true,
          ownerType: true,
          url: true,
          usage: true,
        },
      });

      return {
        ok: true,
        data: gallery.map((item) => ({
          id: item.id,
          url: item.url,
          ownerType: item.ownerType,
          category: item.usage,
          teamName:
            item.ownerType === "TEAM"
              ? (teamMap.get(item.ownerId) ?? null)
              : null,
        })),
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  async postGallery(
    image: Express.Multer.File,
    ownerId: string,
    ownerType: MediaOwnerType,
    usage: ImageUsage,
  ) {
    const res = await gallery.savePicture(
      image.buffer,
      ownerId,
      ownerType,
      usage,
    );
    if (!res.ok) {
      return {
        ok: false,
        error: res.error,
      };
    }
    return {
      ok: true,
      message: "photo uploaded",
    };
  }
  async directMessage(senderId: string, message: string) {
    const receiverId = await this.prismaService.admin.findMany({
      where: { role: "superAdmin" },
      select: { id: true },
    });
    if (receiverId.length === 0) {
      return {
        ok: false,
        message: "no Support found ",
      };
    }
    const res = await notificationService.sendNotification(
      senderId,
      message,
      receiverId[0].id,
    );
    if (!res.ok) {
      return {
        ok: false,
        error: res.error,
      };
    }
    return {
      ok: true,
      message: "sent",
    };
  }
  async getDirectMessage(id: string) {
    const res = await notificationService.getAdminNotification(id);
    if (!res.ok) {
      return {
        ok: false,
        error: res.error,
      };
    }
    if (res.data === null) {
      return {
        ok: true,
        data: "no message fund",
      };
    }
    return {
      ok: true,
      error: res.error,
      data: res.data,
    };
  }
  async deleteNews(id: string) {
    const res = await notificationService.deleteBroadCast(id);
    if (!res) {
      return {
        ok: false,
        error: "not working",
      };
    }
    return {
      ok: true,
      message: "deleted",
    };
  }
  async resendCredential(id: string) {
    try {
      const teamInfo = await this.prismaService.team.findUnique({
        where: { id },
        include: {
          tournaments: {
            select: { tournament: { select: { tournamentName: true } } },
          },
        },
      });
      if (!teamInfo) {
        return {
          ok: false,
          message: "Team is not even in the Database re register them",
        };
      }
      const accessKey = generatePassword();
      const hashedAccessKey = bcrypt.hash(String(accessKey), 10);
      const registrationKey = (
        (teamInfo.teamName?.slice(0, 4) ?? "") +
        generatePassword(4) +
        Date.now().toString(36).slice(-4)
      ).toUpperCase();
      const expirationDate = getNextDaysRange(14);
      await this.prismaService.team.update({
        where: { id: teamInfo.id },
        data: {
          registrationKey,
          expiredRegistration: expirationDate.end,
          accessKey: String(hashedAccessKey),
        },
      });
      const res = await notificationService.sendEmailToCoach({
        registrationKey: String(registrationKey),
        recipientName: teamInfo.coachName || "",
        accessKey: String(accessKey),
        email: teamInfo.coachEmail || "",
        tournamentName: teamInfo.tournaments[0].tournament.tournamentName,
        teamName: teamInfo.teamName,
      });
      if (!res.success) {
        return {
          ok: true,
          message: res.message,
        };
      }
      return {
        ok: true,
        message: `sent to email ${teamInfo.coachEmail}!!`,
      };
    } catch (error) {
      return {
        ok: false,
        message: "smtg just happen",
      };
    }
  }
  async pendingActions(tournamentId: string) {
    return this.prismaService.matchLineup.findMany({
      where: {
        state: "REQUESTED",
        team: {
          tournaments: {
            some: {
              tournamentId: tournamentId,
            },
          },
        },
      },
      select: {
        matchId: true,
        team: { select: { teamName: true } },
      },
    });
  }
}
