"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerExist = exports.validateMatch = void 0;
exports.reverseGoal = reverseGoal;
exports.reverseRedCard = reverseRedCard;
exports.reverseYellowCard = reverseYellowCard;
const db_config_1 = require("../../config/db.config");
const validateMatch = async (id) => {
    const checkMatch = await db_config_1.prisma.match.findUnique({
        where: { id },
    });
    if (!checkMatch && checkMatch === null)
        return {
            ok: false,
            error: "Match not found",
        };
    else if (checkMatch.status !== "LIVE")
        return {
            ok: false,
            error: "Cannot add event to a match that is not live",
        };
    return {
        ok: true,
    };
};
exports.validateMatch = validateMatch;
const playerExist = async (matchId, playerId) => {
    try {
        const res = await db_config_1.prisma.playerMatchStats.findUnique({
            where: { playerId_matchId: { matchId, playerId } },
            select: { id: true },
        });
        if (res) {
            return {
                ok: true,
                id: res.id,
            };
        }
        return {
            ok: false,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: "smgt went wrong",
        };
    }
};
exports.playerExist = playerExist;
async function reverseGoal(tx, event) {
    await tx.goalScorer.deleteMany({
        where: {
            playerId: event.playerId,
            matchId: event.matchId,
            minute: event.minute,
        },
    });
    const match = await tx.match.findUnique({ where: { id: event.matchId } });
    const isHome = match.homeTeamId === event.eventTeamId;
    await tx.match.update({
        where: { id: event.matchId },
        data: isHome
            ? { homeScore: { decrement: 1 } }
            : { awayScore: { decrement: 1 } },
    });
    await tx.playerMatchStats.update({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
        data: {
            goals: { decrement: 1 },
        },
    });
}
async function reverseRedCard(tx, event) {
    await tx.playerMatchStats.update({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
        data: {
            red: { decrement: 1 },
        },
    });
}
async function reverseYellowCard(tx, event) {
    const stats = await tx.playerMatchStats.findUnique({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
    });
    if (!stats)
        return;
    /**
     * If yellow caused red (yellow → red),
     * revert red AND keep yellow history clean
     */
    if (stats.red === 1 && stats.yellow === 1) {
        await tx.playerMatchStats.update({
            where: {
                playerId_matchId: {
                    playerId: event.playerId,
                    matchId: event.matchId,
                },
            },
            data: {
                red: 0,
                yellow: 0,
            },
        });
        return;
    }
    await tx.playerMatchStats.update({
        where: {
            playerId_matchId: {
                playerId: event.playerId,
                matchId: event.matchId,
            },
        },
        data: {
            yellow: { decrement: 1 },
        },
    });
}
