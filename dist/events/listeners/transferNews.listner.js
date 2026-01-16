"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("../../common/utils/utility");
const db_config_1 = require("../../config/db.config");
const ai_service_1 = require("../../modules/_AI/ai.service");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const notification_servie_1 = require("../../modules/notifications/notification.servie");
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
const gallery = new gallery_service_1.GalleryService();
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
event_bus_1.eventBus.on(events_1.TRANSFER_NEWS, async (payload) => {
    const { playerName, fromTeam, toTeam, position, managerId, tournamentId } = payload;
    await (0, utility_1.withRetry)(async () => {
        const content = await ai_service_1.AiService.generateTransferAnnouncement({
            playerName,
            fromTeam,
            toTeam,
            position,
        });
        if (!content) {
            throw new Error(`Failed to generate transfer news automatically for this transfer data :${payload}`);
        }
        const response = await notificationService.broadCastToTournament(managerId, tournamentId, content);
        if (!response.ok) {
            throw response.error;
        }
        return;
    }, {
        retries: 5,
    });
});
