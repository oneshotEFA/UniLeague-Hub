"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.recoverMatch = recoverMatch;
exports.markEventAsFailed = markEventAsFailed;
const ApiResponse_1 = require("../common/utils/ApiResponse");
const http_1 = require("../common/constants/http");
const db_config_1 = require("../config/db.config");
const player_service_1 = require("../modules/players/player.service");
const gallery_service_1 = require("../modules/gallery/gallery.service");
const gallery = new gallery_service_1.GalleryService();
const playerService = new player_service_1.PlayerService(db_config_1.prisma, gallery);
const errorHandler = (err, req, res, next) => {
    console.error("🔥 Error:", err);
    const status = err.status || http_1.HttpStatusCode.INTERNAL_SERVER_ERROR;
    const response = new ApiResponse_1.ApiResponseBuilder()
        .badRequest("An unexpected error occurred")
        .build(res);
    return res.status(status).json(response);
};
exports.errorHandler = errorHandler;
async function recoverMatch(matchId) {
    await db_config_1.prisma.$transaction(async (tx) => {
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
async function markEventAsFailed(eventId, error) {
    await db_config_1.prisma.matchEvent.update({
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
