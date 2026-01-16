"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const ai_service_1 = require("./ai.service");
class AIController {
    static async getTournamentTeams(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No input provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateRandomLeagueFixture(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async getGroupStageTeam(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No input provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateGroupStageFixture(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async getKnockOutTeam(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No input provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateKnockoutBracket(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async generatePoster(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No input provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generatePoster(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async calculateTeamPower(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No input provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateTeamPower(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async predictMatch(req, res) {
        const id = req.params.id;
        if (!id) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No match id provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.predictMatchOutcome(id);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async generateAnaoucment(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No match id provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateTransferAnnouncement(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
    static async generateTournamentAnaoucment(req, res) {
        const body = req.body;
        if (!body) {
            return new ApiResponse_1.ApiResponseBuilder()
                .badRequest("No match id provided")
                .build(res);
        }
        const result = await ai_service_1.AiService.generateAnnouncement(body);
        if (!result) {
            return new ApiResponse_1.ApiResponseBuilder().notFound(result).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("Tournament teams fetched")
            .withData(result)
            .build(res);
    }
}
exports.AIController = AIController;
