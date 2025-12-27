import { generateTeamKey } from "../../common/utils/utility";
import { prisma } from "../../config/db.config";
import { eventBus } from "../../events/event-bus";
import { REGISTIRATION_KEY } from "../../events/events";
import { NotificationService } from "../notifications/notification.servie";
import { TeamService } from "../teams/team.service";
import { TournamentService } from "../tournaments/tournament.service";

export class ManagerServices {
  constructor(
    private prismaService = prisma,
    private tournamentService: TournamentService,
    private notificationService: NotificationService,
    private teamService: TeamService
  ) {}
  async initTournamentStanding(tournamentId: string) {
    const init = await this.tournamentService.initTournamentStanding(
      tournamentId
    );
    if (!init.ok) {
      return {
        ok: false,
        error: init.error,
      };
    }
    return init;
  }
  async getPlayerByTournament(tournamentId: string) {
    const player = await this.tournamentService.getPlayersByTournament(
      tournamentId
    );
    if (!player.ok) {
      return {
        ok: false,
        error: player.message,
      };
    }
    return player;
  }
  async getFixtureByTournament(tournamentId: string) {
    const fixture = await this.tournamentService.getTournamentFixtures(
      tournamentId
    );
    if (!fixture.ok) {
      return {
        ok: false,
        error: fixture.error,
      };
    }
    return fixture;
  }
  async getStandingByTournament(tournamentId: string) {
    const standing = await this.tournamentService.getTournamentStandings(
      tournamentId
    );
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
    const news = await this.notificationService.getTournamentBroadCast(
      tournamentId
    );
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
    tournamentId: string
  ): Promise<{ ok: boolean; data?: any; error?: string }> {
    const teamInfo = await this.teamService.createTeam(
      teamName,
      coachName,
      coachEmail,
      logo
    );
    if (!teamInfo || !teamInfo.ok) {
      return {
        ok: false,
        error: teamInfo.error,
      };
    }
    const res = await this.tournamentService.addTeamToTournament(
      tournamentId,
      teamInfo.data!.team.id
    );
    const key = generateTeamKey(teamInfo.data!.team.id);
    console.log("evemt called");
    eventBus.emit(REGISTIRATION_KEY, {
      key,
      email: teamInfo.data!.team.coachEmail,
    });
    if (!res.ok) {
      return {
        ok: false,
        error: res.message,
      };
    }
    return res;
  }
}
