"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRedCard = handleRedCard;
exports.handleYellowCard = handleYellowCard;
async function handleRedCard(tx, event) {
    const stats = await tx.playerMatchStats.findUnique({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
    });
    if (stats?.red && stats.red >= 1) {
        return {
            ok: false,
            reason: "PLAYER_ALREADY_HAS_RED_CARD",
        };
    }
    await tx.playerMatchStats.upsert({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
        update: {
            red: { increment: 1 },
        },
        create: {
            playerId: event.playerId,
            matchId: event.matchId,
            red: 1,
            minutes: event.minute,
        },
    });
}
async function handleYellowCard(tx, event) {
    const stats = await tx.playerMatchStats.findUnique({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
    });
    if (stats?.yellow && stats.yellow >= 1) {
        await tx.playerMatchStats.update({
            where: {
                playerId_matchId: {
                    playerId: event.playerId,
                    matchId: event.matchId,
                },
            },
            data: {
                red: 1,
                yellow: 1, // keep yellow as 1 (history)
                minutes: event.minute,
            },
        });
        return {
            ok: true,
            action: "YELLOW_TO_RED",
        };
    }
    await tx.playerMatchStats.upsert({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
        update: {
            yellow: { increment: 1 },
        },
        create: {
            playerId: event.playerId,
            matchId: event.matchId,
            yellow: 1,
            minutes: event.minute,
        },
    });
}
