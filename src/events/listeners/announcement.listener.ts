import { eventBus } from "../event-bus";
import { TOURNAMENT_ANNOUNCEMENT } from "../events";
import { AiService } from "../../modules/_AI/ai.service";
import { TournamentAnnouncementInput } from "../../modules/_AI/utility/type";
import { withRetry } from "../../common/utils/utility";

eventBus.on(
  TOURNAMENT_ANNOUNCEMENT,
  async (payload: TournamentAnnouncementInput) => {
    await withRetry(
      async () => {
        const message = await AiService.generateAnnouncement(payload);
        //   await Anouncemnt(message);
      },
      { retries: 5, onFail: async () => {}, onRecover: async () => {} }
    );
  }
);
