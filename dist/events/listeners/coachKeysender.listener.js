"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_bus_1 = require("../event-bus");
const events_1 = require("../events");
const utility_1 = require("../../common/utils/utility");
const notification_servie_1 = require("../../modules/notifications/notification.servie");
const gallery_service_1 = require("../../modules/gallery/gallery.service");
const db_config_1 = require("../../config/db.config");
const console_1 = require("console");
const gallery = new gallery_service_1.GalleryService();
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
event_bus_1.eventBus.on(events_1.REGISTIRATION_KEY, async (payload) => {
    await (0, utility_1.withRetry)(async () => {
        const res = await notificationService.sendEmailToCoach(payload);
        if (!res) {
            console.log(res, "error");
            throw console_1.error;
        }
        console.log("sent");
    }, {
        retries: 3,
    });
});
