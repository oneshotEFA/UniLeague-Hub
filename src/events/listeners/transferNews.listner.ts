import { isRecoverable, withRetry } from "../../common/utils/utility";
import { prisma } from "../../config/db.config";
import { AiService } from "../../modules/_AI/ai.service";
import { TransferAnnouncementInput } from "../../modules/_AI/utility/type";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { eventBus } from "../event-bus";
import { TRANSFER_NEWS } from "../events";
const gallery = new GalleryService();
const notificationService = new NotificationService(prisma, gallery);
eventBus.on(
  TRANSFER_NEWS,
  async (payload: {
    playerName: string;
    fromTeam: string;
    toTeam: string;
    position: string;
    managerId: string;
    tournamentId: string;
  }) => {
    const { playerName, fromTeam, toTeam, position, managerId, tournamentId } =
      payload;
    await withRetry(
      async () => {
        const content: { content: string; title: string; excerpt: string } =
          await AiService.generateTransferAnnouncement({
            playerName,
            fromTeam,
            toTeam,
            position,
          });
        if (!content) {
          throw new Error(
            `Failed to generate transfer news automatically for this transfer data :${payload}`
          );
        }
        const response = await notificationService.broadCastToTournament(
          managerId,
          tournamentId,
          content
        );
        if (!response.ok) {
          throw response.error;
        }
        return;
      },
      {
        retries: 5,
      }
    );
  }
);
