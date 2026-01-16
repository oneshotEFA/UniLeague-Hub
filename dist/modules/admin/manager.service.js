"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerServices = void 0;
const db_config_1 = require("../../config/db.config");
const event_bus_1 = require("../../events/event-bus");
const events_1 = require("../../events/events");
const ai_service_1 = require("../_AI/ai.service");
const gallery_service_1 = require("../gallery/gallery.service");
const notification_servie_1 = require("../notifications/notification.servie");
const mtype_1 = require("../matches/mtype");
const utility_1 = require("./utility");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const gallery = new gallery_service_1.GalleryService();
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
class ManagerServices {
    constructor(prismaService = db_config_1.prisma, tournamentService, notificationService, teamService) {
        this.prismaService = prismaService;
        this.tournamentService = tournamentService;
        this.notificationService = notificationService;
        this.teamService = teamService;
    }
    async initTournamentStanding(tournamentId) {
        const init = await this.tournamentService.initTournamentStanding(tournamentId);
        if (!init.ok) {
            return {
                ok: false,
                error: init.error,
            };
        }
        return init;
    }
    async getPlayerByTournament(tournamentId) {
        const player = await this.tournamentService.getPlayersByTournament(tournamentId);
        if (!player.ok) {
            return {
                ok: false,
                error: player.message,
            };
        }
        return player;
    }
    async getFixtureByTournament(tournamentId) {
        const fixture = await this.tournamentService.getTournamentFixtures(tournamentId);
        if (!fixture.ok) {
            return {
                ok: false,
                error: fixture.error,
            };
        }
        return fixture;
    }
    async getStandingByTournament(tournamentId) {
        const standing = await this.tournamentService.getTournamentStandings(tournamentId);
        if (!standing.ok) {
            return {
                ok: false,
                error: standing.error,
            };
        }
        return standing;
    }
    async getTeamsByTournament(tournamentId) {
        const teams = await this.tournamentService.getTournamentTeams(tournamentId);
        if (!teams.ok) {
            return {
                ok: false,
                error: teams.error,
            };
        }
        return teams;
    }
    async getNewsByTournament(tournamentId) {
        const news = await this.notificationService.getTournamentBroadCast(tournamentId);
        if (!news.ok) {
            return {
                ok: false,
                error: news.error,
            };
        }
        return news;
    }
    async getTournamentStatus(tournamentId) {
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
        }
        catch (error) {
            return {
                ok: false,
                error: "fail to get status",
            };
        }
    }
    async registerTeam(teamName, coachEmail, coachName, logo, tournamentId) {
        const teamInfo = await this.teamService.createTeam(teamName, coachName, coachEmail, logo);
        if (!teamInfo || !teamInfo.ok) {
            return {
                ok: false,
                error: teamInfo.error,
            };
        }
        const res = await this.tournamentService.addTeamToTournament(tournamentId, teamInfo.data.team.id);
        const accessKey = (0, utility_1.generatePassword)();
        const hashedAccessKey = bcryptjs_1.default.hash(String(accessKey), 10);
        const registrationKey = ((teamInfo.data?.team.teamName?.slice(0, 4) ?? "") + (0, utility_1.generatePassword)()).toUpperCase();
        const expirationDate = (0, mtype_1.getNextDaysRange)(14);
        await this.prismaService.team.update({
            where: { id: teamInfo.data?.team.id },
            data: {
                registrationKey,
                expiredRegistration: expirationDate.end,
                accessKey: String(hashedAccessKey),
            },
        });
        event_bus_1.eventBus.emit(events_1.REGISTIRATION_KEY, {
            registrationKey: String(registrationKey),
            recipientName: teamInfo.data?.team.coachName,
            accessKey: String(accessKey),
            email: teamInfo.data.team.coachEmail,
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
    async generateFixture(input) {
        try {
            if (input.tournamentType === "League") {
                const { teams, rounds, matchesPerWeek, startingDate } = input;
                const fixture = await ai_service_1.AiService.generateRandomLeagueFixture({
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
            }
            else if (input.tournamentType === "knockout") {
                const { teams, startingDate } = input;
                const fixture = await ai_service_1.AiService.generateKnockoutBracket({ teams });
                return {
                    ok: true,
                    data: fixture,
                };
            }
            return {
                ok: false,
                error: "invalid input",
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "unexpected error",
            };
        }
    }
    async createNews(tournamentId, managerId, content, banner) {
        // const res = await this.notificationService.broadCastToTournament;
        const response = await notificationService.broadCastToTournament(managerId, tournamentId, content, banner);
        if (!response.ok) {
            return {
                ok: false,
                error: response.error,
            };
        }
        return response;
    }
    async tournamentGallery(tournamentId) {
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
                    teamName: item.ownerType === "TEAM"
                        ? teamMap.get(item.ownerId) ?? null
                        : null,
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error,
            };
        }
    }
    async postGallery(image, ownerId, ownerType, usage) {
        const res = await gallery.savePicture(image.buffer, ownerId, ownerType, usage);
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
    async directMessage(senderId, message) {
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
        const res = await notificationService.sendNotification(senderId, message, receiverId[0].id);
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
    async getDirectMessage(id) {
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
    async deleteNews(id) {
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
}
exports.ManagerServices = ManagerServices;
