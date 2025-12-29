import { ApiResponseBuilder } from "../../common/utils/ApiResponse";
import { prisma } from "../../config/db.config";
import { AiService } from "../_AI/ai.service";
import { GalleryService } from "../gallery/gallery.service";
import { NotificationService } from "../notifications/notification.servie";
import { TeamService } from "../teams/team.service";
import { TournamentService } from "../tournaments/tournament.service";
import { ManagerServices } from "./manager.service";
import { Request, Response } from "express";
import { GenerateFixtureInput } from "./type";

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
        coachEmail,
        coachName,
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
  static async generateFixture(req: Request, res: Response) {
    try {
      const body = (req.body as GenerateFixtureInput) || null;

      const result = await managerService.generateFixture(body);

      if (!result.ok) {
        return new ApiResponseBuilder().badRequest(result.error).build(res);
      }

      return new ApiResponseBuilder()
        .ok("Preview match fixture")
        .withData(result.data)
        .build(res);
    } catch (error) {
      console.error(error);
      return new ApiResponseBuilder()
        .internalError("Internal server error")
        .build(res);
    }
  }
  static async postNewsToTournament(req: Request, res: Response) {
    try {
      console.log(req.body);
      const { tournamentId, managerId, content } = req.body;
      const banner = req.file;
      if (!banner) {
        return new ApiResponseBuilder().badRequest("Image no found").build(res);
      }
      const result = await managerService.createNews(
        tournamentId,
        managerId,
        content,
        banner
      );

      if (!result.ok) {
        return new ApiResponseBuilder().badRequest(result.error).build(res);
      }

      return new ApiResponseBuilder()
        .ok("Preview match fixture")
        .withData(result.ok)
        .build(res);
    } catch (error) {
      console.error(error);
      return new ApiResponseBuilder()
        .internalError("Internal server error")
        .build(res);
    }
  }
  static async getGalleryOfTournament(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await managerService.tournamentGallery(id);

      if (!result.ok) {
        return new ApiResponseBuilder()
          .badRequest("no result from the fucntion")
          .build(res);
      }

      return new ApiResponseBuilder()
        .ok("Gallery fetched")
        .withData(result.data)
        .build(res);
    } catch (error) {
      console.error(error);
      return new ApiResponseBuilder()
        .internalError("Internal server error")
        .build(res);
    }
  }
  static async postToGallery(req: Request, res: Response) {
    try {
      const { ownerId, ownerType, usage } = req.body;
      const banner = req.file;
      if (!banner) {
        return new ApiResponseBuilder()
          .badRequest("image not being set")
          .build(res);
      }
      const result = await managerService.postGallery(
        banner,
        ownerId,
        ownerType,
        usage
      );

      if (!result.ok) {
        return new ApiResponseBuilder()
          .badRequest("no result from the fucntion")
          .build(res);
      }

      return new ApiResponseBuilder().ok(result.message).build(res);
    } catch (error) {
      console.error(error);
      return new ApiResponseBuilder()
        .internalError("Internal server error")
        .build(res);
    }
  }
}
