import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { TournamentService } from "./tournament.service";
import { prisma } from "../../config/db";

const tournamentService = new TournamentService(prisma);

export class TournamentController {
  // GET ALL TOURNAMENTS
  static async getTournaments(req: Request, res: Response) {
    const result = await tournamentService.getTournaments();

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build();
    }

    return new ApiResponseBuilder()
      .ok("Tournaments fetched")
      .withData(result.data)
      .build();
  }

  // GET SINGLE TOURNAMENT
  static async getTournament(req: Request, res: Response) {
    const { id } = req.params;

    const result = await tournamentService.getTournament(id);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build();
    }

    return new ApiResponseBuilder()
      .ok("Tournament fetched")
      .withData(result.data)
      .build();
  }

  // CREATE TOURNAMENT
  //   static async createTournament(req: Request, res: Response) {
  //     const data = req.body;

  //     const result = await tournamentService.createTournament(data);

  //     if (!result.ok) {
  //       return new ApiResponseBuilder().badRequest(result.error).build();
  //     }

  //     return new ApiResponseBuilder()
  //       .created("Tournament created")
  //       .withData(result.data)
  //       .build();
  //   }

  // DELETE TOURNAMENT
  //   static async deleteTournament(req: Request, res: Response) {
  //     const { id } = req.params;

  //     const result = await tournamentService.deleteTournament(id);

  //     if (!result.ok) {
  //       return new ApiResponseBuilder().badRequest(result.error).build();
  //     }

  //     return new ApiResponseBuilder()
  //       .ok("Tournament deleted")
  //       .withData(result.data)
  //       .build();
  //   }

  // UPDATE TOURNAMENT
  //   static async updateTournament(req: Request, res: Response) {
  //     const data = req.body; // includes id and update fields

  //     const result = await tournamentService.updateTournament(data);

  //     if (!result.ok) {
  //       return new ApiResponseBuilder().badRequest(result.error).build();
  //     }

  //     return new ApiResponseBuilder()
  //       .ok("Tournament updated")
  //       .withData(result.data)
  //       .build();
  //   }
}
