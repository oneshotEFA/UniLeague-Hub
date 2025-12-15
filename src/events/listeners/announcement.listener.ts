import { eventBus } from "../event-bus";
import { TOURNAMENT_ANNOUNCEMENT } from "../events";
import { FixtureAI } from "../../modules/_AI/ai.service";
import { TournamentAnnouncementInput } from "../../modules/_AI/utility/type";
import { withRetry } from "../../modules/_AI/utility/common";

eventBus.on(
  TOURNAMENT_ANNOUNCEMENT,
  async (payload: TournamentAnnouncementInput) => {
    await withRetry(async () => {
      const message = await FixtureAI.generateAnnouncement(payload);
      //   await Anouncemnt(message);
    }, 5);
  }
);
