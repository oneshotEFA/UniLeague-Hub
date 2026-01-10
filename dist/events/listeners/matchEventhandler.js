"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../common/utils/utility");
const db_config_1 = require("../../config/db.config");
const errorHandler_1 = require("../../middlewares/errorHandler");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const player_service_1 = require("../../modules/players/player.service");
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
const gallery = new gallery_service_1.GalleryService();
const playerService = new player_service_1.PlayerService(db_config_1.prisma, gallery);
event_bus_1.eventBus.on(events_1.EVENT_HANDLER, async (payload) => {
    await (0, utility_1.withRetry)(async () => {
        await playerService.playerStatHandler({ eventId: payload.eventId });
    }, {
        retries: 5,
        onFail: async (error) => {
            await (0, errorHandler_1.markEventAsFailed)(payload.eventId, error);
        },
        onRecover: async () => {
            const event = await db_config_1.prisma.matchEvent.findUnique({
                where: { id: payload.eventId },
                select: { matchId: true },
            });
            if (!event?.matchId)
                return;
            await (0, errorHandler_1.recoverMatch)(event.matchId);
        },
    });
});
