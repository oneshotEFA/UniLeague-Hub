import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db.config";
import { MatchEventService } from "./macth-event.service";

const matchEventService = new MatchEventService(prisma);

export class MatchEventController {
  // Add a new match event
  static async addEvent(req: Request, res: Response) {
    const eventData = req.body;

    const result = await matchEventService.addMatchEvent(eventData);

    if (!result.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(result.error).build(res));
    }

    return res.status(201).json(
      new ApiResponseBuilder()
        .created("Event added successfully")
        .withData(JSON.parse(JSON.stringify(result.data)))
        .build(res)
    );
  }

  // Delete a match event
  static async deleteEvent(req: Request, res: Response) {
    const { id } = req.params;

    const result = await matchEventService.deleteMatchEvent(id);

    if (!result.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(result.error).build(res));
    }

    return res.status(200).json(
      new ApiResponseBuilder()
        .ok("Event deleted successfully")
        .withData(JSON.parse(JSON.stringify(result.data)))
        .build(res)
    );
  }

  // Get events by match
  static async getEventsByMatch(req: Request, res: Response) {
    const { matchId } = req.params;

    const result = await matchEventService.getEventByMatch(matchId);

    if (!result.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(result.error).build(res));
    }

    return res.status(200).json(
      new ApiResponseBuilder()
        .ok("Events fetched successfully")
        .withData(JSON.parse(JSON.stringify(result.data)))
        .build(res)
    );
  }

  // Get events by team
  static async getEventsByTeam(req: Request, res: Response) {
    const { teamId } = req.params;

    const result = await matchEventService.getEventByTeam(teamId);

    if (!result.ok) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest(result.error).build(res));
    }

    return res.status(200).json(
      new ApiResponseBuilder()
        .ok("Events fetched successfully")
        .withData(JSON.parse(JSON.stringify(result.data)))
        .build(res)
    );
  }

  // Optional: Get events by player
  //   static async getEventsByPlayer(req: Request, res: Response) {
  //     const { playerId } = req.params;

  //     const result = await matchEventService.(playerId);

  //     if (!result.ok) {
  //       return res
  //         .status(400)
  //         .json(new ApiResponseBuilder().badRequest(result.error).build(res));
  //     }

  //     return res
  //       .status(200)
  //       .json(
  //         new ApiResponseBuilder()
  //           .ok("Events fetched successfully")
  //           .withData(result.data)
  //           .build(res)
  //       );
  //   }
}
