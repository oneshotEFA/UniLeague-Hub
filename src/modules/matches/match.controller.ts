import { Request, Response } from "express";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { MatchService } from "./match.service";
import { prisma } from "../../config/db";
import { match, UpdateMatchSchedule, EndMatchData } from "./mtype";

const matchService = new MatchService(prisma);

export class MatchController {

    // CREATE MATCH
    static async createMatch(req: Request, res: Response) {
    const matchData: match = req.body;
    const result = await matchService.createMatch(matchData);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .created("Match created successfully")
        .withData(result.data)
        .build(res);
    }

    // UPDATE MATCH SCHEDULE
    static async updateMatchSchedule(req: Request, res: Response) {
    const { id } = req.params;
    const updateData: UpdateMatchSchedule = req.body;
    const result = await matchService.updateMatchSchedule(id, updateData);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Match schedule updated successfully")
        .withData(result.data)
        .build(res);
    }

    // START MATCH
    static async startMatch(req: Request, res: Response) {
    const { id } = req.params;
    const result = await matchService.startMatch(id);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Match started successfully")
        .withData(result.data)
        .build(res);
    }

    // POSTPONE MATCH
    static async postponeMatch(req: Request, res: Response) {
    const { id } = req.params;
    const result = await matchService.postponeMatch(id);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Match postponed successfully")
        .withData(result.data)
        .build(res);
    }

    // END MATCH
    static async endMatch(req: Request, res: Response) {
    const { id } = req.params;
    const endData: EndMatchData = req.body;
    const { homeScore, awayScore } = endData;
    const result = await matchService.endMatch(id, homeScore, awayScore);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Match ended successfully")
        .withData(result.data)
        .build(res);
    }

    // GET MATCH BY ID
    static async getMatchById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await matchService.getMatchById(id);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Match fetched successfully")
        .withData(result.data)
        .build(res);
    }

    // GET MATCHES BY TOURNAMENT
    static async getMatchesByTournament(req: Request, res: Response) {
    const { tournamentId } = req.params;
    const result = await matchService.getMatchesByTournament(tournamentId);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Matches fetched successfully")
        .withData(result.data)
        .build(res);
    }

    // GET MATCHES BY TEAM
    static async getMatchesByTeam(req: Request, res: Response) {
    const { teamId } = req.params;
    const result = await matchService.getMatchesByTeam(teamId);
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Matches fetched successfully")
        .withData(result.data)
        .build(res);
    }

    // GET TODAY MATCHES
    static async getTodayMatches(req: Request, res: Response) {
    const result = await matchService.getTodayMatches();
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Today's matches fetched successfully")
        .withData(result.data)
        .build(res);
    }

    // GET LIVE MATCHES
    static async getLiveMatches(req: Request, res: Response) {
    const result = await matchService.getLiveMatches();
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Live matches fetched successfully")
        .withData(result.data)
        .build(res);
    }

    // GET ALL MATCHES
    static async getMatches(req: Request, res: Response) {
    const result = await matchService.getMatches();
    if (!result.ok) {
        return new ApiResponseBuilder().notFound(result.error!).build(res);
    }
    return new ApiResponseBuilder()
        .ok("Matches fetched successfully")
        .withData(result.data)
        .build(res);
    }
}
