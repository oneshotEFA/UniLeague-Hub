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
    const adminId = req.params.id;
    const notfication = await notificationService.getBroadCastNotification();

    if (!notfication.ok) {
      return res
        .status(400)
        .json(
          new ApiResponseBuilder().badRequest(notfication.error).build(res)
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponseBuilder()
          .created("broadcast notification is fetch")
          .withData(notfication.data)
          .build(res)
      );
  }

  //get tournament broad cast
  static async getTournamentBroadCast(req: Request, res: Response) {
    const tournamentId = req.params.id;
    const notification = await notificationService.getTournamentBroadCast(
      tournamentId
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
          .created("tournament broadcast fetched")
          .withData(notification.data)
          .build(res)
      );
  }
}
