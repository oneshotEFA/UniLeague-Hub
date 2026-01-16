"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const tournament_service_1 = require("./tournament.service");
const db_config_1 = require("../../config/db.config");
const gallery_service_1 = require("../gallery/gallery.service");
const gallery = new gallery_service_1.GalleryService();
const tournamentService = new tournament_service_1.TournamentService(db_config_1.prisma, gallery);
class TournamentController {
    // GET ALL TOURNAMENTS
    static async getTournaments(req, res) {
        const result = await tournamentService.getTournaments();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournaments fetched")
            .withData(result.data)
            .build(res);
    }
    // GET SINGLE TOURNAMENT
    static async getTournament(req, res) {
        const { id } = req.params;
        const result = await tournamentService.getTournament(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament fetched")
            .withData(result.data)
            .build(res);
    }
    // GET TEAMS IN TOURNAMENT
    static async getTournamentTeams(req, res) {
        const { tournamentId } = req.params;
        console.log(tournamentId);
        const result = await tournamentService.getTournamentTeams(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result.data)
            .build(res);
    }
    // GET FIXTURES FOR TOURNAMENT
    static async getTournamentFixtures(req, res) {
        const { tournamentId } = req.params;
        const result = await tournamentService.getTournamentFixtures(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament fixtures fetched")
            .withData(result.data)
            .build(res);
    }
    // GET TOURNAMENT STANDINGS
    static async getTournamentStandings(req, res) {
        const { tournamentId } = req.params;
        const result = await tournamentService.getTournamentStandings(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament standings fetched")
            .withData(result.data)
            .build(res);
    }
    static async initTournamentStanding(req, res) {
        const { tournamentId } = req.params;
        const result = await tournamentService.initTournamentStanding(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result?.error").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament standings fetched")
            .withData(result.data)
            .build(res);
    }
    static async getPlayersByTournament(req, res) {
        const { tournamentId } = req.params;
        const result = await tournamentService.getPlayersByTournament(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result?.error").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("players fethed")
            .withData(result.data)
            .build(res);
    }
    // dash board status 
    static async dashBoardStatus(req, res) {
        const result = await tournamentService.getDashboardStats();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result?.error").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("DashBord status fetched")
            .withData(result.data)
            .build(res);
    }
}
exports.TournamentController = TournamentController;
