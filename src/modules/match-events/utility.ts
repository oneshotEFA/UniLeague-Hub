import { EventType } from "../../../generated/prisma";
import { prisma } from "../../config/db.config";

export type MatchEvent = {
  matchId: string;
  playerId: string;
  teamId: string;
  min: number;
  eventType: EventType;
};

export const validateMatch = async (id: string) => {
  const checkMatch = await prisma.match.findUnique({
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
export const playerExist = async (matchId: string, playerId: string) => {
  try {
    const res = await prisma.playerMatchStats.findUnique({
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
  } catch (error) {
    return {
      ok: false,
      error: "smgt went wrong",
    };
  }
};

export type matchEventRes = {
  id: string;
  minute: number;
  eventType: EventType;
  matchId: string;
  playerId: string;
  eventTeamId: string;
};

export async function reverseGoal(tx: any, event: any) {
  await tx.goalScorer.deleteMany({
    where: {
      playerId: event.playerId,
      matchId: event.matchId,
      minute: event.minute,
    },
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

export async function reverseRedCard(tx: any, event: any) {
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

export async function reverseYellowCard(tx: any, event: any) {
  const stats = await tx.playerMatchStats.findUnique({
    where: {
      playerId_matchId: {
        playerId: event.playerId,
        matchId: event.matchId,
      },
    },
  });

  if (!stats) return;

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
