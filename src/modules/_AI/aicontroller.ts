import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { FixtureAI } from "./ai.service";
import {
  GroupInput,
  KnockoutInput,
  LeagueInput,
  PosterInput,
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
}
