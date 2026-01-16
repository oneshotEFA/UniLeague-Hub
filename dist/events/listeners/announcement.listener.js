"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
const ai_service_1 = require("../../modules/_AI/ai.service");
const utility_1 = require("../../common/utils/utility");
const notification_servie_1 = require("../../modules/notifications/notification.servie");
const db_config_1 = require("../../config/db.config");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const gallery = new gallery_service_1.GalleryService();
const notification = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
event_bus_1.eventBus.on(events_1.TOURNAMENT_ANNOUNCEMENT, async (payload) => {
    await (0, utility_1.withRetry)(async () => {
        const message = await ai_service_1.AiService.generateAnnouncement(payload);
        console.log(message);
        const res = await notification.broadCastToWeb(message);
        if (!res.ok) {
            throw res.error;
        }
    }, { retries: 5, onFail: async () => { }, onRecover: async () => { } });
});
