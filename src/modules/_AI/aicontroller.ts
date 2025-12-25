import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { AiService as FixtureAI } from "./ai.service";
import {
  GroupInput,
  KnockoutInput,
  LeagueInput,
  PosterInput,
  TournamentAnnouncementInput,
  TransferAnnouncementInput,
} from "./utility/type";

export class AIController {
  static async getTournamentTeams(req: Request, res: Response) {
    const body = req.body as unknown as LeagueInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No input provided")
        .build(res);
    }
    const result = await FixtureAI.generateRandomLeagueFixture(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async getGroupStageTeam(req: Request, res: Response) {
    const body = req.body as unknown as GroupInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No input provided")
        .build(res);
    }
    const result = await FixtureAI.generateGroupStageFixture(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async getKnockOutTeam(req: Request, res: Response) {
    const body = req.body as unknown as KnockoutInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No input provided")
        .build(res);
    }
    const result = await FixtureAI.generateKnockoutBracket(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async generatePoster(req: Request, res: Response) {
    const body = req.body as unknown as PosterInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No input provided")
        .build(res);
    }
    const result = await FixtureAI.generatePoster(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async calculateTeamPower(req: Request, res: Response) {
    const body = req.body as unknown as any | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No input provided")
        .build(res);
    }
    const result = await FixtureAI.generateTeamPower(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async predictMatch(req: Request, res: Response) {
    const id = (req.params as { id?: string }).id;
    if (!id) {
      return new ApiResponseBuilder()
        .badRequest("No match id provided")
        .build(res);
    }
    const result = await FixtureAI.predictMatchOutcome(id);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async generateAnaoucment(req: Request, res: Response) {
    const body = req.body as unknown as TransferAnnouncementInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No match id provided")
        .build(res);
    }
    const result = await FixtureAI.generateTransferAnnouncement(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
  static async generateTournamentAnaoucment(req: Request, res: Response) {
    const body = req.body as unknown as TournamentAnnouncementInput | null;
    if (!body) {
      return new ApiResponseBuilder()
        .badRequest("No match id provided")
        .build(res);
    }
    const result = await FixtureAI.generateAnnouncement(body);

    if (!result) {
      return new ApiResponseBuilder().notFound(result).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result)
      .build(res);
  }
}
