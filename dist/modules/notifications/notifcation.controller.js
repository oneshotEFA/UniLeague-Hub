"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_servie_1 = require("./notification.servie");
const ApiResponse_1 = require("../../common/utils/ApiResponse");
const gallery_service_1 = require("../gallery/gallery.service");
const db_config_1 = require("../../config/db.config");
const gallery = new gallery_service_1.GalleryService();
const notificationService = new notification_servie_1.NotificationService(db_config_1.prisma, gallery);
class NotificationController {
    // get admin notification
    static async getAdminNotification(req, res) {
        const adminId = req.params.id;
        const notification = await notificationService.getAdminNotification(adminId);
        if (!notification.ok) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest(notification.error).build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder()
            .created("notification fetched")
            .withData(notification.data)
            .build(res));
    }
    //get broad cast notification
    static async getBroadCastNotification(req, res) {
        const { page } = req.params;
        console.log(page);
        const notfication = await notificationService.getBroadCastNotification(Number(page));
        if (!notfication.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(notfication.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("broadcast notification is fetch")
            .withData(notfication.data)
            .withMeta(notfication?.meta)
            .build(res);
    }
    //get tournament broad cast
    static async getTournamentBroadCast(req, res) {
        const tournamentId = req.params.id;
        const page = req.query.page;
        const notification = await notificationService.getTournamentBroadCast(tournamentId, Number(page));
        if (!notification.ok) {
            return new ApiResponse_1.ApiResponseBuilder().badRequest(notification.error).build(res);
        }
        return new ApiResponse_1.ApiResponseBuilder()
            .ok("tournament broadcast fetched")
            .withData(notification.data)
            .withMeta(notification?.meta)
            .build(res);
    }
    static async sendMailToManager(req, res) {
        const { credentials, tournamentName } = req.body;
        const notification = await notificationService.sendEmailToManager(credentials, tournamentName);
        if (!notification) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest("notification").build(res));
        }
        return res.status(200).json(new ApiResponse_1.ApiResponseBuilder()
            .ok("email sent")
            .build(res));
    }
    static async sendMailToMaintenance(req, res) {
        const { id } = req.body;
        const notification = await notificationService.sendMaintenanceEmail(id);
        if (!notification) {
            return res
                .status(400)
                .json(new ApiResponse_1.ApiResponseBuilder().badRequest("notification").build(res));
        }
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponseBuilder().ok("email sent").build(res));
    }
}
exports.NotificationController = NotificationController;
