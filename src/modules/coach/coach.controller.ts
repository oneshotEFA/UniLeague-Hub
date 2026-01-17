import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { CoachService } from "./coach.service";
import { LineupRole, PlayerPosition } from "../../../generated/prisma";
const coachService = new CoachService();
type linupDTO = {
  teamId: string;
  matchId: string;
  formation: string;
  requestById: string;
  players: {
    playerId: string;
    position: PlayerPosition;
    role: LineupRole;
    isCaptain?: boolean;
  }[];
};
export class CoachController {
  static async RequestLineUp(req: Request, res: Response) {
    try {
      const { teamId, matchId, formation, requestById, players }: linupDTO =
        req.body;

      const response = await coachService.requestLineUp(
        teamId,
        matchId,
        formation,
        requestById,
        players,
      );

      if (!response.ok) {
        return new ApiResponseBuilder().badRequest(response.message).build(res);
      }

      return new ApiResponseBuilder()
        .created("Tournament created successfully")
        .withData(response)
        .build(res);
    } catch (err) {
      console.error("Error during tournament creation:", err);
      return new ApiResponseBuilder().internalError("Server error").build(res);
    }
  }
  static async getLineUpOfMatch(req: Request, res: Response) {
    try {
      const { id, teamId } = req.params;

      const response = await coachService.lineUpPlayers(id, teamId);

      if (!response.ok) {
        return new ApiResponseBuilder().badRequest(response.message).build(res);
      }

      return new ApiResponseBuilder()
        .ok(response.message)
        .withData(response.data)
        .build(res);
    } catch (err) {
      console.error("Error during tournament creation:", err);
      return new ApiResponseBuilder().internalError("Server error").build(res);
    }
  }
  static async approveLineUp(req: Request, res: Response) {
    try {
      const { lineUpId, approvedId } = req.body;

      const response = await coachService.approveLineUpRequest(
        lineUpId,
        approvedId,
      );

      if (!response.ok) {
        return new ApiResponseBuilder().badRequest(response.message).build(res);
      }

      return new ApiResponseBuilder().ok(response.message).build(res);
    } catch (err) {
      console.error("Error during approving", err);
      return new ApiResponseBuilder().internalError("Server error").build(res);
    }
  }
  static async getLineUpRequests(req: Request, res: Response) {
    try {
      const { id, teamId } = req.params;

      const response = await coachService.getLineUpRequest(id, teamId);

      if (!response.ok) {
        return new ApiResponseBuilder().badRequest(response.message).build(res);
      }

      return new ApiResponseBuilder()
        .ok(response.message)
        .withData(response.data)
        .build(res);
    } catch (err) {
      console.error("Error during approving", err);
      return new ApiResponseBuilder().internalError("Server error").build(res);
    }
  }
  static async rejectLineUp(req: Request, res: Response) {
    try {
      const { lineUpId, approvedId } = req.body;

      const response = await coachService.rejectLineUpRequest(
        lineUpId,
        approvedId,
      );

      if (!response.ok) {
        return new ApiResponseBuilder().badRequest(response.message).build(res);
      }

      return new ApiResponseBuilder().ok(response.message).build(res);
    } catch (err) {
      console.error("Error during approving", err);
      return new ApiResponseBuilder().internalError("Server error").build(res);
    }
  }
}
