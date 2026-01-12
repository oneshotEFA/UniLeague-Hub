import { withRetry } from "../../common/utils/utility";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { ManagerCredentials } from "../../modules/notifications/utility";
import { eventBus } from "../event-bus";
import { TOURNAMENT_MANAGER_NOTIFICATION } from "../events";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
eventBus.on(
  TOURNAMENT_MANAGER_NOTIFICATION,
  async (payload: { credential: ManagerCredentials; tName: string }) => {
    withRetry(
      async () => {
        console.log("process began");
        const res = await notificationService.sendEmailToManager(
          payload.credential,
          payload.tName
        );
        if (!res.success) {
          console.log(res.message);
          throw new Error(res.message);
        }
        console.log("sent");
      },
      { retries: 1 }
    );
  }
);
