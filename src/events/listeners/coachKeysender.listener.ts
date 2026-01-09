import { eventBus } from "../event-bus";
import { REGISTIRATION_KEY } from "../events";
import { withRetry } from "../../common/utils/utility";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { prisma } from "../../config/db.config";
import { CoachCredentials } from "../../modules/notifications/utility";
import { error } from "console";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
eventBus.on(REGISTIRATION_KEY, async (payload: CoachCredentials) => {
  await withRetry(
    async () => {
      const res = await notificationService.sendEmailToCoach(payload);
      if (!res) {
        console.log(res, "error");
        throw error;
      }
      console.log("sent");
    },
    {
      retries: 3,
    }
  );
});
