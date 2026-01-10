"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerController = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const db_config_1 = require("../../config/db.config");
const gallery_service_1 = require("../gallery/gallery.service");
const notification_servie_1 = require("../notifications/notification.servie");
const team_service_1 = require("../teams/team.service");
const tournament_service_1 = require("../tournaments/tournament.service");
const manager_service_1 = require("./manager.service");
const tournament = new tournament_service_1.TournamentService(db_config_1.prisma, new gallery_service_1.GalleryService());
const team = new team_service_1.TeamService(db_config_1.prisma, new gallery_service_1.GalleryService());
const notification = new notification_servie_1.NotificationService(db_config_1.prisma, new gallery_service_1.GalleryService());
const managerService = new manager_service_1.ManagerServices(db_config_1.prisma, tournament, notification, team);
class ManagerController {
    static async registerTeam(req, res) {
        try {
            const { teamName, coachEmail, coachName, tournamentId } = req.body;
            const logo = req.file;
            if (!logo) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("Team logo is required")
                    .build(res);
            }
            const result = await managerService.registerTeam(teamName, coachEmail, coachName, logo, tournamentId);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder()
                .ok("Team registered successfully")
                .withData(result.data)
                .build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async generateFixture(req, res) {
        try {
            const body = req.body || null;
            const result = await managerService.generateFixture(body);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder()
                .ok("Preview match fixture")
                .withData(result.data)
                .build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async postNewsToTournament(req, res) {
        try {
            const { tournamentId, managerId, content } = req.body;
            const banner = req.file;
            if (!banner) {
                return new ApiResponse_1.ApiResponseBuilder().badRequest("Image no found").build(res);
            }
            const result = await managerService.createNews(tournamentId, managerId, content, banner);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder()
                .ok("Preview match fixture")
                .withData(result.ok)
                .build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async getGalleryOfTournament(req, res) {
        try {
            const { id } = req.params;
            const result = await managerService.tournamentGallery(id);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("no result from the fucntion")
                    .build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder()
                .ok("Gallery fetched")
                .withData(result.data)
                .build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async postToGallery(req, res) {
        try {
            const { ownerId, ownerType, usage } = req.body;
            const banner = req.file;
            if (!banner) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("image not being set")
                    .build(res);
            }
            const result = await managerService.postGallery(banner, ownerId, ownerType, usage);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("no result from the fucntion")
                    .build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder().ok(result.message).build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async directMessage(req, res) {
        try {
            const { senderId, message } = req.body;
            const result = await managerService.directMessage(senderId, message);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder().badRequest(result.error).build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder().ok("sent").build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async getDirectMessages(req, res) {
        try {
            const { id } = req.params;
            console.log(id);
            const result = await managerService.getDirectMessage(id);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("no result from the api")
                    .build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder()
                .ok(result.error)
                .withData(result.data)
                .build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
    static async deleteNews(req, res) {
        try {
            const { id } = req.params;
            console.log(id);
            const result = await managerService.deleteNews(id);
            if (!result.ok) {
                return new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("no result from the api")
                    .build(res);
            }
            return new ApiResponse_1.ApiResponseBuilder().ok(result.message).build(res);
        }
        catch (error) {
            console.error(error);
            return new ApiResponse_1.ApiResponseBuilder()
                .internalError("Internal server error")
                .build(res);
        }
    }
}
exports.ManagerController = ManagerController;
