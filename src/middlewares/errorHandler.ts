import { Request, Response, NextFunction } from "express";
import { ApiResponseBuilder } from "../common/utils/ApiResponse";
import { HttpStatusCode } from "../common/constants/http";
import { prisma } from "../config/db";

import { PlayerService } from "../modules/players/player.service";
import { GalleryService } from "../modules/gallery/gallery.service";
const gallery = new GalleryService();
const playerService = new PlayerService(prisma, gallery);
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error:", err);

  const status = err.status || HttpStatusCode.INTERNAL_SERVER_ERROR;

  const response = new ApiResponseBuilder()
    .badRequest("An unexpected error occurred")
    .build(res);

  return res.status(status).json(response);
};
export async function recoverMatch(matchId: string) {
  await prisma.$transaction(async (tx) => {
    // Delete derived data
    await tx.goalScorer.deleteMany({ where: { matchId } });
    await tx.playerMatchStats.deleteMany({ where: { matchId } });

    // Reset events
    await tx.matchEvent.updateMany({
      where: { matchId },
      data: {
        processingStatus: "PENDING",
        // lastError: null,
      },
    });

    // Replay events
    const events = await tx.matchEvent.findMany({
      where: { matchId },
      orderBy: { minute: "asc" },
    });

    for (const event of events) {
      await playerService.playerStatHandler({ eventId: event.id });
    }
  });

  return { ok: true };
}

export async function markEventAsFailed(eventId: string, error: Error) {
  await prisma.matchEvent.update({
    where: { id: eventId },
    data: {
      processingStatus: "FAILED",
      // lastError: error.message,
    },
  });

  // await systemNotificationService.send({
  //   type: "DATA_INCONSISTENCY",
  //   message: `MatchEvent ${eventId} failed after retries`,
  // });
}
