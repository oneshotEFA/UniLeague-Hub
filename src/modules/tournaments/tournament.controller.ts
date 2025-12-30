import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { TournamentService } from "./tournament.service";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../gallery/gallery.service";
const gallery = new GalleryService();
const tournamentService = new TournamentService(prisma, gallery);

export class TournamentController {
  // GET ALL TOURNAMENTS
  static async getTournaments(req: Request, res: Response) {
    const result = await tournamentService.getTournaments();

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournaments fetched")
      .withData(result.data)
      .build(res);
  }

  // GET SINGLE TOURNAMENT
  static async getTournament(req: Request, res: Response) {
    const { id } = req.params;

    const result = await tournamentService.getTournament(id);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament fetched")
      .withData(result.data)
      .build(res);
  }

  // GET TEAMS IN TOURNAMENT
  static async getTournamentTeams(req: Request, res: Response) {
    const { tournamentId } = req.params;
    console.log(tournamentId);
    const result = await tournamentService.getTournamentTeams(tournamentId);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament teams fetched")
      .withData(result.data)
      .build(res);
  }

  // GET FIXTURES FOR TOURNAMENT
  static async getTournamentFixtures(req: Request, res: Response) {
    const { tournamentId } = req.params;
    const result = await tournamentService.getTournamentFixtures(tournamentId);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament fixtures fetched")
      .withData(result.data)
      .build(res);
  }

  // GET TOURNAMENT STANDINGS
  static async getTournamentStandings(req: Request, res: Response) {
    const { tournamentId } = req.params;
    const result = await tournamentService.getTournamentStandings(tournamentId);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound(result.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament standings fetched")
      .withData(result.data)
      .build(res);
  }
  static async initTournamentStanding(req: Request, res: Response) {
    const { tournamentId } = req.params;

    const result = await tournamentService.initTournamentStanding(tournamentId);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound("result?.error").build(res);
    }

    return new ApiResponseBuilder()
      .ok("Tournament standings fetched")
      .withData(result.data)
      .build(res);
  }
  static async getPlayersByTournament(req: Request, res: Response) {
    const { tournamentId } = req.params;

    const result = await tournamentService.getPlayersByTournament(tournamentId);

    if (!result.ok) {
      return new ApiResponseBuilder().notFound("result?.error").build(res);
    }

    return new ApiResponseBuilder()
      .ok("players fethed")
      .withData(result.data)
      .build(res);
  }

  // dash board status 
  static async dashBoardStatus(req: Request, res: Response){
    const result = await tournamentService.getDashboardStats()
    if (!result.ok) {
      return new ApiResponseBuilder().notFound("result?.error").build(res);
    }

    return new ApiResponseBuilder()
      .ok("DashBord status fetched")
      .withData(result.data)
      .build(res);
  }



  // GET TOURNAMENT SUMMARY
  // static async getTournamentSummary(req: Request, res: Response) {
  //   const { tournamentId } = req.params;
  //   const result = await tournamentService.getTournamentSummary(tournamentId);

  //   if (!result.ok) {
  //     return new ApiResponseBuilder()
  //       .notFound(result.error || "No summary available")
  //       .build(res);
  //   }

  //   return new ApiResponseBuilder()
  //     .ok("Tournament summary fetched")
  //     .withData(result.data)
  //     .build(res);
  // }
}
