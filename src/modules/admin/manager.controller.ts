import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db.config";
import { GalleryService } from "../gallery/gallery.service";
import { NotificationService } from "../notifications/notification.servie";
import { TeamService } from "../teams/team.service";
import { TournamentService } from "../tournaments/tournament.service";
import { ManagerServices } from "./manager.service";
import { Request, Response } from "express";

const tournament = new TournamentService(prisma, new GalleryService());
const team = new TeamService(prisma, new GalleryService());
const notification = new NotificationService(prisma, new GalleryService());
const managerService = new ManagerServices(
  prisma,
  tournament,
  notification,
  team
);
export class ManagerController {
  static async registerTeam(req: Request, res: Response) {
    try {
      const { teamName, coachEmail, coachName, tournamentId } = req.body;
      const logo = req.file;

      if (!logo) {
        return new ApiResponseBuilder()
          .badRequest("Team logo is required")
          .build(res);
      }

      const result = await managerService.registerTeam(
        teamName,
        coachName,
        coachEmail,
        logo,
        tournamentId
      );

      if (!result.ok) {
        return new ApiResponseBuilder().badRequest(result.error).build(res);
      }

      return new ApiResponseBuilder()
        .ok("Team registered successfully")
        .withData(result.data)
        .build(res);
    } catch (error) {
      console.error(error);
      return new ApiResponseBuilder()
        .internalError("Internal server error")
        .build(res);
    }
  }
}
