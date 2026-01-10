"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchService = void 0;
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
const db_config_1 = require("../../config/db.config");
const mtype_1 = require("./mtype");
const event_bus_1 = require("../../events/event-bus");
const events_1 = require("../../events/events");
class MatchService {
    constructor(prismaService = db_config_1.prisma) {
        this.prismaService = prismaService;
    }
    formatDate(dateStr) {
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
        }
        catch (error) {
            return typeof dateStr === "string" ? dateStr : dateStr.toISOString();
        }
    }
    async createMatches(data) {
        try {
            const matchData = await this.prismaService.match.createMany({
                data: data.map((m) => ({
                    ...m,
                    scheduledDate: new Date(m.scheduledDate), // VERY IMPORTANT
                    status: "SCHEDULED",
                    homeScore: 0,
                    awayScore: 0,
                })),
            });
            return {
                ok: true,
                data: {
                    ...matchData,
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async updateMatchSchedule(id, data) {
        try {
            const match = await this.prismaService.match.update({
                where: { id },
                data,
            });
            return {
                ok: true,
                data: {
                    ...match,
                    scheduledDate: this.formatDate(match.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async startMatch(id) {
        try {
            const match = await this.prismaService.match.update({
                where: { id },
                data: { status: "LIVE" },
            });
            return {
                ok: true,
                data: {
                    ...match,
                    scheduledDate: this.formatDate(match.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async postponeMatch(id) {
        try {
            const match = await this.prismaService.match.update({
                where: { id },
                data: { status: "POSTPONED" },
            });
            return {
                ok: true,
                data: {
                    ...match,
                    scheduledDate: this.formatDate(match.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async endMatch(id, homeScore, awayScore) {
        try {
            const updateData = { status: "FINISHED" };
            if (homeScore !== undefined)
                updateData.homeScore = homeScore;
            if (awayScore !== undefined)
                updateData.awayScore = awayScore;
            const match = await this.prismaService.match.update({
                where: { id },
                data: updateData,
            });
            // Emit event to update standings
            event_bus_1.eventBus.emit(events_1.MATCH_FINISHED, {
                tournamentId: match.tournamentId,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
            });
            event_bus_1.eventBus.emit(events_1.TEAMPOWER, {
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
            });
            return {
                ok: true,
                data: {
                    ...match,
                    scheduledDate: this.formatDate(match.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getMatchById(id) {
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
                    scheduledDate: this.formatDate(match.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getMatchesByTournament(tournamentId) {
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getMatchesByTeam(teamId) {
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getTodayMatchesByTournament(Id) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const matches = await this.prismaService.match.findMany({
                where: {
                    AND: [
                        {
                            scheduledDate: {
                                gte: today,
                                lt: tomorrow,
                            },
                        },
                        { tournamentId: Id },
                    ],
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getLiveMatchesByTournament(Id) {
        try {
            const matches = await this.prismaService.match.findMany({
                where: {
                    AND: [{ status: "LIVE" }, { tournamentId: Id }],
                },
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getMatches(id) {
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
                    scheduledDate: this.formatDate(m.scheduledDate),
                })),
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async createMatch(data) {
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
                    scheduledDate: this.formatDate(matchData.scheduledDate),
                },
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getRecentMatchesAll() {
        const { start, end } = (0, mtype_1.getPastDaysRange)(7);
        const matches = await this.findMatches({
            start,
            end,
            includeStats: true,
            order: "desc",
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async getRecentMatchesTournament(id) {
        const { start, end } = (0, mtype_1.getPastDaysRange)(7);
        const matches = await this.findMatches({
            start,
            end,
            includeStats: true,
            tournamentId: id,
            order: "desc",
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async getRecentMatchesTeam(id) {
        const { start, end } = (0, mtype_1.getPastDaysRange)(7);
        const matches = await this.findMatches({
            start,
            end,
            includeStats: true,
            teamId: id,
            order: "desc",
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async getNextWeekMatches() {
        const { start, end } = (0, mtype_1.getNextDaysRange)(7);
        const matches = await this.findMatches({
            start,
            end,
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async getNextWeekMatchesTournament(id) {
        const { start, end } = (0, mtype_1.getNextDaysRange)(15);
        const matches = await this.findMatches({
            start,
            end,
            tournamentId: id,
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async getNextWeekMatchesTeam(id) {
        const { start, end } = (0, mtype_1.getNextDaysRange)(15);
        const matches = await this.findMatches({
            start,
            end,
            teamId: id,
        });
        return {
            ok: true,
            data: matches.map((m) => ({
                ...m,
                scheduledDate: this.formatDate(m.scheduledDate),
            })),
        };
    }
    async findMatches({ start, end, tournamentId, teamId, includeStats = false, order = "asc", }) {
        return this.prismaService.match.findMany({
            where: {
                scheduledDate: { gte: start, lte: end },
                ...(tournamentId && { tournamentId }),
                ...(teamId && {
                    OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
                }),
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                tournament: true,
                ...(includeStats && {
                    events: true,
                    goalScore: true,
                }),
            },
            orderBy: { scheduledDate: order },
        });
    }
}
exports.MatchService = MatchService;
