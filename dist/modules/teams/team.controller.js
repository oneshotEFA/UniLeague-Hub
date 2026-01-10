"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamControl = void 0;
const team_service_1 = require("./team.service");
const gallery_service_1 = require("../gallery/gallery.service");
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const db_config_1 = require("../../config/db.config");
const gallery = new gallery_service_1.GalleryService();
const teamService = new team_service_1.TeamService(db_config_1.prisma, gallery);
class teamControl {
    // create a team
    static async createTeam(req, res) {
        const { teamName, coachEmail, coachName } = req.body;
        const logo = req.file;
        const value = await teamService.createTeam(teamName, coachEmail, coachName, logo);
        if (!value.ok) {
            return res
                .status(401)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(value.error).build(res));
        }
        return res
            .status(201)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("team created")
            .withData(value.data)
            .build(res));
    }
    // get all teams
    static async getTeams(req, res) {
        const value = await teamService.getAllTeams(); // add this method in service if missing
        if (!value.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(value.error).build(res));
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("teams fetched")
            .withData(value.data)
            .build(res);
    }
    // get team by id
    static async getTeamById(req, res) {
        const { id } = req.params;
        const value = await teamService.getTeamById(id);
        if (!value.ok) {
            return res
                .status(404)
                .json(new ApiResponse_1.ApiResponseBuilder().notFound(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("team found")
            .withData(value.data)
            .build(res));
    }
    // update team
    static async updateTeam(req, res) {
        const { id } = req.params;
        const data = req.body;
        const logo = req.file;
        const value = await teamService.updateTeam(id, data, logo);
        if (!value.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("team updated")
            .withData(value.data)
            .build(res));
    }
    // delete team
    static async removeTeam(req, res) {
        const { id } = req.params;
        const value = await teamService.removeTeam(id);
        if (!value.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("team removed")
            .withData(value.data)
            .build(res));
    }
    // search team by name
    static async searchTeam(req, res) {
        const { name } = req.params;
        const value = await teamService.searchTeamByName(name);
        if (!value.ok) {
            return res
                .status(404)
                .json(new ApiResponse_1.ApiResponseBuilder().notFound(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("team found")
            .withData(value.data)
            .build(res));
    }
    // team status
    static async teamStatus(req, res) {
        const { id } = req.params;
        const value = await teamService.teamStatus(id);
        if (!value.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(value.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("team status")
            .withData(value.data)
            .build(res));
    }
}
exports.teamControl = teamControl;
