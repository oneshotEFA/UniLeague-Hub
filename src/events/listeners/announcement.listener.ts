import { eventBus } from "../event-bus";
import { TOURNAMENT_ANNOUNCEMENT } from "../events";
import { AiService } from "../../modules/_AI/ai.service";
import { TournamentAnnouncementInput } from "../../modules/_AI/utility/type";
import { withRetry } from "../../common/utils/utility";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../../modules/gallery/gallery.service";
const gallery = new GalleryService();
const notification = new NotificationService(prisma, gallery);
eventBus.on(
  TOURNAMENT_ANNOUNCEMENT,
  async (payload: TournamentAnnouncementInput) => {
    await withRetry(
      async () => {
        const message: {
          content: string;
          title: string;
          excerpt: string;
        } = await AiService.generateAnnouncement(payload);

        await notification.broadCastToWeb(message);
      },
      { retries: 5, }
    );
  }
);
