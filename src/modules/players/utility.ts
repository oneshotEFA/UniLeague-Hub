export async function handleRedCard(tx: any, event: any) {
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

export async function handleYellowCard(tx: any, event: any) {
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
