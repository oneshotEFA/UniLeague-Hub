"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchEventController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const db_config_1 = require("../../config/db.config");
const macth_event_service_1 = require("./macth-event.service");
const matchEventService = new macth_event_service_1.MatchEventService(db_config_1.prisma);
class MatchEventController {
    // Add a new match event
    static async addEvent(req, res) {
        const eventData = req.body;
        const result = await matchEventService.addMatchEvent(eventData);
        if (!result.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res));
        }
        return res.status(201).json(new ApiResponse_1.ApiResponseBuilder()
            .created("Event added successfully")
            .withData(JSON.parse(JSON.stringify(result.data)))
            .build(res));
    }
    // Delete a match event
    static async deleteEvent(req, res) {
        const { id } = req.params;
        const result = await matchEventService.deleteMatchEvent(id);
        if (!result.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res));
        }
        return res.status(200).json(new ApiResponse_1.ApiResponseBuilder()
            .ok("Event deleted successfully")
            .withData(JSON.parse(JSON.stringify(result.data)))
            .build(res));
    }
    // Get events by match
    static async getEventsByMatch(req, res) {
        const { matchId } = req.params;
        const result = await matchEventService.getEventByMatch(matchId);
        if (!result.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res));
        }
        return res.status(200).json(new ApiResponse_1.ApiResponseBuilder()
            .ok("Events fetched successfully")
            .withData(JSON.parse(JSON.stringify(result.data)))
            .build(res));
    }
    // Get events by team
    static async getEventsByTeam(req, res) {
        const { teamId } = req.params;
        const result = await matchEventService.getEventByTeam(teamId);
        if (!result.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res));
        }
        return res.status(200).json(new ApiResponse_1.ApiResponseBuilder()
            .ok("Events fetched successfully")
            .withData(JSON.parse(JSON.stringify(result.data)))
            .build(res));
    }
}
exports.MatchEventController = MatchEventController;
