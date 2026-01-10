"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const match_service_1 = require("./match.service");
const db_config_1 = require("../../config/db.config");
const matchService = new match_service_1.MatchService(db_config_1.prisma);
class MatchController {
    // CREATE MATCH
    static async createMatches(req, res) {
        const matchData = req.body;
        const result = await matchService.createMatches(matchData);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("Match created successfully")
            .withData(result.data)
            .build(res);
    }
    // UPDATE MATCH SCHEDULE
    static async updateMatchSchedule(req, res) {
        const { id } = req.params;
        const updateData = req.body;
        const result = await matchService.updateMatchSchedule(id, updateData);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Match schedule updated successfully")
            .withData(result.data)
            .build(res);
    }
    // START MATCH
    static async startMatch(req, res) {
        const { id } = req.params;
        const result = await matchService.startMatch(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Match started successfully")
            .withData(result.data)
            .build(res);
    }
    // POSTPONE MATCH
    static async postponeMatch(req, res) {
        const { id } = req.params;
        const result = await matchService.postponeMatch(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Match postponed successfully")
            .withData(result.data)
            .build(res);
    }
    // END MATCH
    static async endMatch(req, res) {
        const { id } = req.params;
        const endData = req.body;
        const { homeScore, awayScore } = endData;
        const result = await matchService.endMatch(id, homeScore, awayScore);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Match ended successfully")
            .withData(result.data)
            .build(res);
    }
    // GET MATCH BY ID
    static async getMatchById(req, res) {
        const { id } = req.params;
        const result = await matchService.getMatchById(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Match fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET MATCHES BY TOURNAMENT
    static async getMatchesByTournament(req, res) {
        const { tournamentId } = req.params;
        const result = await matchService.getMatchesByTournament(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Matches fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET MATCHES BY TEAM
    static async getMatchesByTeam(req, res) {
        const { teamId } = req.params;
        const result = await matchService.getMatchesByTeam(teamId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Matches fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET TODAY MATCHES
    static async getTodayMatches(req, res) {
        const result = await matchService.getTodayMatches();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Today's matches fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET LIVE MATCHES
    static async getLiveMatches(req, res) {
        const result = await matchService.getLiveMatches();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Live matches fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET ALL MATCHES
    static async getMatches(req, res) {
        const { id } = req.params;
        const result = await matchService.getMatches(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Matches fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET TODAY MATCHES BY TOURNAMENT
    static async getTodayMatchesByTournament(req, res) {
        const { tournamentId } = req.params;
        const result = await matchService.getTodayMatchesByTournament(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Today's matches for tournament fetched successfully")
            .withData(result.data)
            .build(res);
    }
    // GET LIVE MATCHES BY TOURNAMENT
    static async getLiveMatchesByTournament(req, res) {
        const { tournamentId } = req.params;
        const result = await matchService.getLiveMatchesByTournament(tournamentId);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Live matches for tournament fetched successfully")
            .withData(result.data)
            .build(res);
    }
    static async createMatch(req, res) {
        const matchData = req.body;
        const result = await matchService.createMatch(matchData);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("Match created successfully")
            .withData(result.data)
            .build(res);
    }
    static async nextMatchAll(req, res) {
        const result = await matchService.getNextWeekMatches();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("next week match fetched")
            .withData(result.data)
            .build(res);
    }
    static async nextMatchTournament(req, res) {
        const { id } = req.params;
        const result = await matchService.getNextWeekMatchesTournament(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("next week match fetched")
            .withData(result.data)
            .build(res);
    }
    static async nextMatchTeam(req, res) {
        const { id } = req.params;
        const result = await matchService.getNextWeekMatchesTeam(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("next week match fetched")
            .withData(result.data)
            .build(res);
    }
    static async recentMatchAll(req, res) {
        const result = await matchService.getRecentMatchesAll();
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("esult.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("recent week match fetched")
            .withData(result.data)
            .build(res);
    }
    static async recentMatchTeam(req, res) {
        const { id } = req.params;
        const result = await matchService.getRecentMatchesTeam(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("recent week match fetched")
            .withData(result.data)
            .build(res);
    }
    static async recentMatchTournament(req, res) {
        const { id } = req.params;
        const result = await matchService.getRecentMatchesTournament(id);
        if (!result.ok) {
            return new ApiResponse_1.ApiResponseBuilder().notFound("result.error!").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("recent week match fetched")
            .withData(result.data)
            .build(res);
    }
}
exports.MatchController = MatchController;
