import { withRetry } from "../../common/utils/utility";
import { prisma } from "../../config/db";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { TournamentService } from "../../modules/tournaments/tournament.service";
import { eventBus } from "../event-bus";
import { MATCH_FINISHED } from "../events";

const gallery = new GalleryService();
const tournamentService = new TournamentService(prisma, gallery);

eventBus.on(MATCH_FINISHED, async (payload: {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}) => {
  await withRetry(
    async () => {
      await tournamentService.updateStandings(payload);
    },
    {
      retries: 5,
      onFail: async (error) => {
        console.error("Failed to update standings for match:", payload, error);
        // Optionally, mark something as failed, but since no specific entity, just log
      },
      onRecover: async () => {
        // Since updateStandings is idempotent, re-run it
        await tournamentService.updateStandings(payload);
      },
    }
  );
});