import { error } from "console";
import { prisma } from "../../config/db.config";
import {
  MatchEvent,
  playerExist,
  reverseGoal,
  reverseRedCard,
  reverseYellowCard,
  validateMatch,
  validatePlayer,
} from "./utility";
import { cleanData } from "../../common/utils/utility";
import { eventBus } from "../../events/event-bus";
import { EVENT_HANDLER } from "../../events/events";

export class MatchEventService {
  constructor(private prismaService = prisma) {}
  async addMatchEvent(data: MatchEvent) {
    try {
      const validate = await validateMatch(data.matchId);
      if (!validate.ok) {
        return { ok: false, error: validate.error };
      }
      const ok = await validatePlayer(data.playerId, data.matchId, data.teamId);
      if (!ok.ok) {
        return { ok: false, error: ok.message };
      }
      const match = await this.prismaService.match.findUnique({
        where: { id: data.matchId },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
        },
      });

      if (!match) {
        return { ok: false, error: "Match not found" };
      }

      const isHome = match.homeTeamId === data.teamId;

      const result = await this.prismaService.$transaction(async (prisma) => {
        if (data.eventType === "Goal") {
          await prisma.match.update({
            where: { id: data.matchId },
            data: isHome
              ? { homeScore: { increment: 1 } }
              : { awayScore: { increment: 1 } },
          });
        }

        const matchEvent = await prisma.matchEvent.create({
          data: {
            matchId: data.matchId,
            playerId: data.playerId,
            eventTeamId: data.teamId,
            minute: data.min,
            eventType: data.eventType,
            processingStatus: "PENDING",
          },
        });

        return matchEvent;
      });

      eventBus.emit(EVENT_HANDLER, { eventId: result.id });

      return { ok: true, data: result };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  async getEventByMatch(matchId: string) {
    try {
      const events = await this.prismaService.matchEvent.findMany({
        where: { matchId },
      });
      return {
        ok: true,
        data: events,
      };
    } catch (error) {
      return {
        ok: false,
        error: (error as Error).message,
      };
    }
  }
  async getEventByTeam(teamId: string) {
    try {
      const events = await this.prismaService.matchEvent.findMany({
        where: { eventTeamId: teamId },
      });
      return {
        ok: true,
        data: events,
      };
    } catch (error) {
      return {
        ok: false,
        error: (error as Error).message,
      };
    }
  }
  async deleteMatchEvent(id: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const event = await tx.matchEvent.findUnique({
          where: { id },
        });

        if (!event) {
          throw new Error("MatchEvent not found");
        }

        /**
         * Reverse side effects FIRST
         */
        switch (event.eventType) {
          case "Goal":
            await reverseGoal(tx, event);
            break;

          case "Yellow":
            await reverseYellowCard(tx, event);
            break;

          case "Red":
            await reverseRedCard(tx, event);
            break;
        }

        /**
         * Then delete the event itself
         */
        await tx.matchEvent.delete({
          where: { id },
        });
      });

      return {
        ok: true,
        data: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: (error as Error).message,
      };
    }
  }
}
