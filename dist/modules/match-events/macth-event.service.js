"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchEventService = void 0;
const db_config_1 = require("../../config/db.config");
const utility_1 = require("./utility");
const event_bus_1 = require("../../events/event-bus");
const events_1 = require("../../events/events");
class MatchEventService {
    constructor(prismaService = db_config_1.prisma) {
        this.prismaService = prismaService;
    }
    async addMatchEvent(data) {
        try {
            const validate = await (0, utility_1.validateMatch)(data.matchId);
            if (!validate.ok) {
                return { ok: false, error: validate.error };
            }
            const match = await this.prismaService.match.findUnique({
                where: { id: data.matchId },
                select: {
                    homeTeamId: true,
                    awayTeamId: true,
                    homeScore: true,
                    awayScore: true,
                },
            });
            if (!match) {
                return { ok: false, error: "Match not found" };
            }
            const isHome = match.homeTeamId === data.teamId;
            const result = await this.prismaService.$transaction(async (prisma) => {
                if (data.eventType === "Goal") {
                    await prisma.match.update({
                        where: { id: data.matchId },
                        data: isHome
                            ? { homeScore: { increment: 1 } }
                            : { awayScore: { increment: 1 } },
                    });
                }
                const matchEvent = await prisma.matchEvent.create({
                    data: {
                        matchId: data.matchId,
                        playerId: data.playerId,
                        eventTeamId: data.teamId,
                        minute: data.min,
                        eventType: data.eventType,
                        processingStatus: "PENDING",
                    },
                });
                return matchEvent;
            });
            event_bus_1.eventBus.emit(events_1.EVENT_HANDLER, { eventId: result.id });
            return { ok: true, data: result };
        }
        catch (error) {
            return { ok: false, error: error.message };
        }
    }
    async getEventByMatch(matchId) {
        try {
            const events = await this.prismaService.matchEvent.findMany({
                where: { matchId },
            });
            return {
                ok: true,
                data: events,
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async getEventByTeam(teamId) {
        try {
            const events = await this.prismaService.matchEvent.findMany({
                where: { eventTeamId: teamId },
            });
            return {
                ok: true,
                data: events,
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }
    async deleteMatchEvent(id) {
        try {
            await this.prismaService.$transaction(async (tx) => {
                const event = await tx.matchEvent.findUnique({
                    where: { id },
                });
                if (!event) {
                    throw new Error("MatchEvent not found");
                }
                /**
                 * Reverse side effects FIRST
                 */
                switch (event.eventType) {
                    case "Goal":
                        await (0, utility_1.reverseGoal)(tx, event);
                        break;
                    case "Yellow":
                        await (0, utility_1.reverseYellowCard)(tx, event);
                        break;
                    case "Red":
                        await (0, utility_1.reverseRedCard)(tx, event);
                        break;
                }
                /**
                 * Then delete the event itself
                 */
                await tx.matchEvent.delete({
                    where: { id },
                });
            });
            return {
                ok: true,
                data: null,
            };
        }
        catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }
}
exports.MatchEventService = MatchEventService;
