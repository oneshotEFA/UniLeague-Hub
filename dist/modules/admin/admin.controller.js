"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminControl = void 0;
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const notification_servie_1 = require("../notifications/notification.servie");
const admin_service_1 = require("./admin.service");
const db_config_1 = require("../../config/db.config");
const gallery_service_1 = require("../gallery/gallery.service");
const tournament_service_1 = require("../tournaments/tournament.service");
const auth_service_1 = require("../auth/auth.service");
const gallery = new gallery_service_1.GalleryService();
const tournament = new tournament_service_1.TournamentService(db_config_1.prisma, gallery);
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
const auth = new auth_service_1.AuthService();
const adminService = new admin_service_1.AdminService(db_config_1.prisma, tournament, notificationService, auth);
class AdminControl {
    static async createTournament(req, res) {
        try {
            // Check if the logo file is provided
            if (!req.file) {
                return res
                    .status(400)
                    .json(new ApiResponse_1.ApiResponseBuilder()
                    .badRequest("Logo file is required")
                    .build(res));
            }
            const createTournament = await tournament.createTournament({
                ...req.body,
                logo: req.file,
            });
            if (!createTournament.ok) {
                return res
                    .status(400)
                    .json(new ApiResponse_1.ApiResponseBuilder()
                    .badRequest(createTournament.error)
                    .build(res));
            }
            return res
                .status(201)
                .json(new ApiResponse_1.ApiResponseBuilder()
                .created("Tournament created successfully")
                .withData(createTournament.data)
                .build(res));
        }
        catch (err) {
            console.error("Error during tournament creation:", err);
            return res
                .status(500)
                .json(new ApiResponse_1.ApiResponseBuilder().internalError("Server error").build(res));
        }
    }
    // upadate the torunament
    static async updateTournament(req, res) {
        const update = await adminService.updateTournament(req.body);
        if (!update.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(update.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("updated")
            .withData(update.data)
            .build(res));
    }
    // delete tournamemnt
    static async deleteTournament(req, res) {
        const id = req.params.id;
        const deleted = await adminService.deleteTournament(id);
        if (!deleted.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(deleted.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("tournament deleted")
            .withData(deleted.data)
            .build(res));
    }
    // delete admin
    static async deletedAdmin(req, res) {
        const id = req.params.id;
        const deleted = await adminService.deleteAdmin(id);
        if (!deleted.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(deleted.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("admin deleted")
            .withData(deleted)
            .build(res));
    }
    // get tournamet teams
    static async getTeamsInTournament(req, res) {
        const id = req.params.id;
        const teams = await adminService.getTeamsInTournament(id);
        if (!teams.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(teams.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("tournament teams")
            .withData(teams.data)
            .build(res));
    }
    //assign manager to tournament
    static async assignManagerToTournament(req, res) {
        const { managerId, id } = req.params;
        const manager = await adminService.assignManagerToTournament(managerId, id);
        if (!manager.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(manager.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("manager assigned")
            .withData(manager.data)
            .build(res));
    }
    // get tournament managers
    static async getTournamentManagers(req, res) {
        const managers = await adminService.getTournamentManagers();
        if (!managers.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(managers.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("tournamnet manager")
            .withData(managers.data)
            .build(res));
    }
    // remove Tournament Manager
    static async removeTournamentManager(req, res) {
        const { tournamentId, managerId } = req.params;
        const removeManager = await adminService.removeTournamentManager(tournamentId, managerId);
        if (!removeManager.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(removeManager.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("manager removed")
            .withData(removeManager)
            .build(res));
    }
    // get  All Admin
    static async getAllAdmin(req, res) {
        const admins = await adminService.getAllAdmin();
        if (!admins.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(admins.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("all admins")
            .withData(admins.data)
            .build(res));
    }
    // create news
    static async createNews(req, res) {
        const { content } = req.body;
        const image = req.file;
        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        }
        catch {
            return res.status(400).json({ message: "Invalid content JSON" });
        }
        const rese = await adminService.createNews(parsedContent, image);
        if (!rese.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(rese.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .created("news is created")
            .withData(rese.data)
            .build(res);
    }
    // update news
    static async updateNews(req, res) {
        const newsId = req.params.id;
        const content = req.body;
        const updated = await adminService.updateNews(newsId, content);
        if (!updated.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(updated.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("updated")
            .withData(updated.data)
            .build(res));
    }
    // delete news
    static async deleteNews(req, res) {
        const newsId = req.params.id;
        const deleted = await adminService.deleteNews(newsId);
        if (!deleted.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(deleted.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("deleted")
            .withData(deleted.data)
            .build(res));
    }
    // all admins
    static async getAllNews(req, res) {
        const managers = await adminService.getAllAdmin();
        if (!managers.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(managers.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("managers")
            .withData(managers.data)
            .build(res));
    }
    // system logs
    static async getsystemLogs(req, res) {
        const logs = await adminService.systemLogs();
        if (!logs.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(logs.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("system logs")
            .withData(logs.data)
            .build(res));
    }
    static async getAllMessageMeta(req, res) {
        const logs = await adminService.getAllMessageMeta();
        if (!logs) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest("smtg wrong").build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .ok("get messages")
            .withData(logs.data)
            .build(res));
    }
    static async getMessageOfAdmin(req, res) {
        const { id } = req.params;
        const logs = await adminService.getMessageOfAdmin(id);
        if (!logs) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest("smtg wrong").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("get messages of specify manager")
            .withData(logs.data)
            .build(res);
    }
    static async sendDirectMessageToClients(req, res) {
        const { managerId, message } = req.body;
        const logs = await adminService.sendDirectMessage(managerId, message);
        if (!logs) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest("smtg wrong").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder().ok(logs.message).build(res);
    }
    static async markRead(req, res) {
        const { id } = req.params;
        const logs = await adminService.markRead(id);
        if (!logs) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest("smtg wrong").build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder().ok(logs.message).build(res);
    }
}
exports.AdminControl = AdminControl;
