import { Request, Response } from "express";
import { NotificationService } from "./notification.servie";
import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { GalleryService } from "../gallery/gallery.service";
import { prisma } from "../../config/db.config";

const gallery = new GalleryService();

const notificationService = new NotificationService(prisma, gallery);
export class NotificationController {
  // get admin notification
  static async getAdminNotification(req: Request, res: Response) {
    const adminId = req.params.id;
    const notification = await notificationService.getAdminNotification(
      adminId
    );

    if (!notification.ok) {
      return res
        .status(400)
        .json(
          new ApiResponseBuilder().badRequest(notification.error).build(res)
        );
    }
    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created("notification fetched")
          .withData(notification.data)
          .build(res)
      );
  }

  //get broad cast notification
  static async getBroadCastNotification(req: Request, res: Response) {
    const { page } = req.params;
    console.log(page);
    const notfication = await notificationService.getBroadCastNotification(
      Number(page)
    );

    if (!notfication.ok) {
      return new ApiResponseBuilder().badRequest(notfication.error).build(res);
    }

    return new ApiResponseBuilder()
      .ok("broadcast notification is fetch")
      .withData(notfication.data)
      .withMeta(notfication?.meta)
      .build(res);
  }

  //get tournament broad cast
  static async getTournamentBroadCast(req: Request, res: Response) {
    const tournamentId = req.params.id;
    const page = req.query.page;
    const notification = await notificationService.getTournamentBroadCast(
      tournamentId,
      Number(page)
    );

    if (!notification.ok) {
      return new ApiResponseBuilder().badRequest(notification.error).build(res);
    }
    return new ApiResponseBuilder()
      .ok("tournament broadcast fetched")
      .withData(notification.data)
      .withMeta(notification?.meta)
      .build(res);
  }
  static async sendMailToManager(req: Request, res: Response) {
    const { credentials, tournamentName } = req.body;

    const notification = await notificationService.sendEmailToManager(
      credentials,
      tournamentName
    );

    if (!notification) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest("notification").build(res));
    }
    return res.status(200).json(
      new ApiResponseBuilder()
        .ok("email sent")

        .build(res)
    );
  }
  static async sendMailToMaintenance(req: Request, res: Response) {
    const { id } = req.body;

    const notification = await notificationService.sendMaintenanceEmail(id);

    if (!notification) {
      return res
        .status(400)
        .json(new ApiResponseBuilder().badRequest("notification").build(res));
    }
    return res
      .status(200)
      .json(new ApiResponseBuilder().ok("email sent").build(res));
  }
}
