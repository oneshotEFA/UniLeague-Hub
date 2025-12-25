import { isRecoverable, withRetry } from "../../common/utils/utility";
import { prisma } from "../../config/db";
import { GalleryService } from "../../modules/gallery/gallery.service";
import { NotificationService } from "../../modules/notifications/notification.servie";
import { TournamentService } from "../../modules/tournaments/tournament.service";
import { eventBus } from "../event-bus";
import { MATCH_FINISHED } from "../events";

const gallery = new GalleryService();

const tournamentService = new TournamentService(prisma, gallery);
const notificationService = new NotificationService(prisma, gallery);

eventBus.on(
  MATCH_FINISHED,
  async (payload: {
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
          console.error(
            "Failed to update standings for match:",
            payload,
            error
          );
          if (!isRecoverable(error)) {
            // notificationService.systemCall()
          }
          //analysis the error and return the data
          // notificationService.systemCall()
        },
        onRecover: async () => {
          await tournamentService.resetTournamentStandings(
            payload.tournamentId
          );
          const matches = await prisma.match.findMany({
            where: { tournamentId: payload.tournamentId },
            select: {
              homeTeamId: true,
              awayTeamId: true,
              homeScore: true,
              awayScore: true,
            },
          });
          await Promise.all(
            matches.map(async (match) => {
              await tournamentService.updateStandings({
                tournamentId: payload.tournamentId,
                homeTeamId: match.homeTeamId,
                awayTeamId: match.awayTeamId,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
              });
            })
          );
        },
      }
    );
  }
);
