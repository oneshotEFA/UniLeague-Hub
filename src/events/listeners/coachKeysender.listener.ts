import { eventBus } from "../event-bus";
import { REGISTIRATION_KEY } from "../events";
import { withRetry } from "../../common/utils/utility";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { prisma } from "../../config/db.config";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
eventBus.on(
  REGISTIRATION_KEY,
  async (payload: { key: string; email: string }) => {
    await withRetry(
      async () => {
        // await notificationService.sendMaintenanceEmail(
        //   payload.key,
        //   payload.email
        // );
        console.log("email sent to coach");
      },
      {
        retries: 1,
      }
    );
  }
);
