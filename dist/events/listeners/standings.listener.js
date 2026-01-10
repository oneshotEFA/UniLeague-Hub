"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../common/utils/utility");
const db_config_1 = require("../../config/db.config");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const notification_servie_1 = require("../../modules/notifications/notification.servie");
const tournament_service_1 = require("../../modules/tournaments/tournament.service");
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
const gallery = new gallery_service_1.GalleryService();
const tournamentService = new tournament_service_1.TournamentService(db_config_1.prisma, gallery);
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
event_bus_1.eventBus.on(events_1.MATCH_FINISHED, async (payload) => {
    await (0, utility_1.withRetry)(async () => {
        await tournamentService.updateStandings(payload);
    }, {
        retries: 5,
        onFail: async (error) => {
            console.error("Failed to update standings for match:", payload, error);
            if (!(0, utility_1.isRecoverable)(error)) {
                // notificationService.systemCall()
            }
            //analysis the error and return the data
            // notificationService.systemCall()
        },
        onRecover: async () => {
            await tournamentService.resetTournamentStandings(payload.tournamentId);
            const matches = await db_config_1.prisma.match.findMany({
                where: { tournamentId: payload.tournamentId },
                select: {
                    homeTeamId: true,
                    awayTeamId: true,
                    homeScore: true,
                    awayScore: true,
                },
            });
            await Promise.all(matches.map(async (match) => {
                await tournamentService.updateStandings({
                    tournamentId: payload.tournamentId,
                    homeTeamId: match.homeTeamId,
                    awayTeamId: match.awayTeamId,
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                });
            }));
        },
    });
});
