import { withRetry } from "../../common/utils/utility";
import { prisma } from "../../config/db";
import {
  markEventAsFailed,
  recoverMatch,
} from "../../middlewares/errorHandler";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { PlayerService } from "../../modules/players/player.service";
import { eventBus } from "../event-bus";
import { EVENT_HANDLER } from "../events";
const gallery = new GalleryService();
const playerService = new PlayerService(prisma, gallery);
eventBus.on(EVENT_HANDLER, async (payload: { eventId: string }) => {
  await withRetry(
    async () => {
      await playerService.playerStatHandler({ eventId: payload.eventId });
    },
    {
      retries: 5,

      onFail: async (error) => {
        await markEventAsFailed(payload.eventId, error);
      },

      onRecover: async () => {
        const event = await prisma.matchEvent.findUnique({
          where: { id: payload.eventId },
          select: { matchId: true },
        });

        if (!event?.matchId) return;

        await recoverMatch(event.matchId);
      },
    }
  );
});
